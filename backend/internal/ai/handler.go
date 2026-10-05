package ai

import (
	"encoding/json"
	"errors"
	"io"
	"math"
	"net/http"

	db "little-closet/db/generated"
	"little-closet/internal/auth"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

type generateOutfitRequest struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Language  string  `json:"language"`
}

type analyzeImageRequest struct {
	Image    []byte `json:"image"`
	Language string `json:"language"`
}

func (h *Handler) GenerateOutfit(c *gin.Context) {
	userID := auth.CurrentNeonUserID(c)
	var req generateOutfitRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request",
		})
		return
	}

	if req.Language != "en" && req.Language != "fi" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "language must be en or fi",
		})
		return
	}

	// Round the location so tiny GPS changes don't create
	// a completely new cache entry.
	latitude := roundCoordinate(req.Latitude)
	longitude := roundCoordinate(req.Longitude)

	ctx := c.Request.Context()

	// Get the timestamp of the latest wardrobe change.
	wardrobeUpdatedAt, err := h.service.GetWardrobeUpdatedAt(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get wardrobe state",
		})
		return
	}

	// Check the one-hour cache.
	cached, err := h.service.GetCachedOutfit(
		ctx,
		db.GetCachedOutfitParams{
			UserID:    userID,
			Latitude:  latitude,
			Longitude: longitude,
			Language:  req.Language,
			WardrobeUpdatedAt: pgtype.Timestamptz{
				Time:  wardrobeUpdatedAt,
				Valid: true,
			},
		},
	)

	if err == nil {
		c.JSON(http.StatusOK, gin.H{
			"outfit":  cached.Outfit,
			"weather": json.RawMessage(cached.Weather),
			"cached":  true,
		})
		return
	}

	if !errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to check outfit cache",
		})
		return
	}

	// Cache miss.
	// Call the Neon Function here.
	result, err := h.service.GenerateOutfit(
		ctx,
		userID,
		generateOutfitRequest{
			latitude,
			longitude,
			req.Language,
		},
	)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error": "failed to generate outfit",
		})
		return
	}

	// Save the generated result.
	_, err = h.service.UpsertCachedOutfit(
		ctx,
		db.UpsertCachedOutfitParams{
			UserID:    userID,
			Latitude:  latitude,
			Longitude: longitude,
			Language:  req.Language,
			WardrobeUpdatedAt: pgtype.Timestamptz{
				Time:  wardrobeUpdatedAt,
				Valid: true,
			},
			Outfit:  result.Outfit,
			Weather: result.Weather,
		},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to cache outfit",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"outfit":  result.Outfit,
		"weather": result.Weather,
		"cached":  false,
	})
}

func roundCoordinate(value float64) float64 {
	return math.Round(value*10) / 10
}

func (h *Handler) AnalyzeImage(c *gin.Context) {
	userID := auth.CurrentNeonUserID(c)
	language := c.PostForm("language")

	if language != "en" && language != "fi" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "language must be en or fi",
		})
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "missing image",
		})
		return
	}

	image, err := file.Open()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to open image",
		})
		return
	}
	defer image.Close()

	imageBytes, err := io.ReadAll(image)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to read image",
		})
		return
	}

	ctx := c.Request.Context()

	result, err := h.service.AnalyzeImage(
		ctx,
		userID,
		analyzeImageRequest{
			Image:    imageBytes,
			Language: language,
		},
	)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error": "failed to analyze image",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"name":        result.Name,
		"size_source": result.SizeSource,
		"size": gin.H{
			"id":   result.Size.ID,
			"name": result.Size.Name,
		},
		"category": gin.H{
			"id":        result.Category.ID,
			"name":      result.Category.Name,
			"parent_id": result.Category.ParentID,
		},
	})
}
