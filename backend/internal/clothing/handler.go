package clothing

import (
	"errors"
	"net/http"

	db "little-closet/db/generated"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

type createClothingRequest struct {
	Name       string `json:"name"`
	CategoryID string `json:"category_id"`
	SizeID     string `json:"size_id"`
	Quantity   int32  `json:"quantity"`
}

type updateClothingRequest struct {
	Name       string `json:"name"`
	CategoryID string `json:"category_id"`
	SizeID     string `json:"size_id"`
	Quantity   int32  `json:"quantity"`
}

func (h *Handler) List(c *gin.Context) {
	items, err := h.service.GetClothing(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch clothing items",
		})
		return
	}

	if items == nil {
		items = []db.ListClothingItemsRow{}
	}

	c.JSON(http.StatusOK, gin.H{
		"items": items,
	})
}

func (h *Handler) Create(c *gin.Context) {
	var req createClothingRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request",
		})
		return
	}

	categoryID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid category_id",
		})
		return
	}

	sizeID, err := uuid.Parse(req.SizeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid size_id",
		})
		return
	}

	item, err := h.service.CreateClothing(
		c.Request.Context(),
		db.CreateClothingItemParams{
			ID: pgtype.UUID{
				Bytes: uuid.New(),
				Valid: true,
			},
			Name: req.Name,
			CategoryID: pgtype.UUID{
				Bytes: categoryID,
				Valid: true,
			},
			SizeID: pgtype.UUID{
				Bytes: sizeID,
				Valid: true,
			},
			Quantity: req.Quantity,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create clothing item",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"item": item,
	})
}

func (h *Handler) Update(c *gin.Context) {
	var req updateClothingRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request",
		})
		return
	}

	clothingID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid clothing_id",
		})
		return
	}

	categoryID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid category_id",
		})
		return
	}

	sizeID, err := uuid.Parse(req.SizeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid size_id",
		})
		return
	}

	item, err := h.service.UpdateClothing(
		c.Request.Context(),
		db.UpdateClothingItemParams{
			ID: pgtype.UUID{
				Bytes: clothingID,
				Valid: true,
			},
			Name: req.Name,
			CategoryID: pgtype.UUID{
				Bytes: categoryID,
				Valid: true,
			},
			SizeID: pgtype.UUID{
				Bytes: sizeID,
				Valid: true,
			},
			Quantity: req.Quantity,
		},
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "clothing item not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to update clothing item",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"item": item,
	})
}

func (h *Handler) Delete(c *gin.Context) {
	clothingID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid clothing_id",
		})
		return
	}
	err = h.service.DeleteClothing(c.Request.Context(), pgtype.UUID{
		Bytes: clothingID,
		Valid: true,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to delete clothing item",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "clothing item deleted successfully"})
}
