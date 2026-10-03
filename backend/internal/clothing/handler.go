package clothing

import (
	"errors"
	"net/http"

	db "little-closet/db/generated"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
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

type createCategoryRequest struct {
	Name     string `json:"name"`
	ParentID string `json:"parent_id"`
}

type updateCategoryRequest struct {
	Name     string `json:"name"`
	ParentID string `json:"parent_id"`
}

type createSizeRequest struct {
	Name      string `json:"name"`
	SortOrder int32  `json:"sort_order"`
}

type updateSizeRequest struct {
	Name      string `json:"name"`
	SortOrder int32  `json:"sort_order"`
}

func (h *Handler) ListCategories(c *gin.Context) {
	items, err := h.service.GetGategories(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch categories"})
		return
	}
	if items == nil {
		items = []db.ListCategoriesRow{}
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

func (h *Handler) CreateCategory(c *gin.Context) {
	var req createCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	parentID := pgtype.UUID{}
	if req.ParentID != "" {
		parsedParentID, err := uuid.Parse(req.ParentID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid parent_id"})
			return
		}
		parentID = pgtype.UUID{Bytes: parsedParentID, Valid: true}
		if _, err := h.service.GetCategoryByID(c.Request.Context(), parentID); err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "parent category not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to validate parent category"})
			return
		}
	}

	item, err := h.service.CreateCategory(c.Request.Context(), db.CreateCategoryParams{
		ID:       pgtype.UUID{Bytes: uuid.New(), Valid: true},
		Name:     req.Name,
		ParentID: parentID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"item": item})
}

func (h *Handler) UpdateCategory(c *gin.Context) {
	var req updateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	categoryID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category_id"})
		return
	}

	parentID := pgtype.UUID{}
	if req.ParentID != "" {
		parsedParentID, err := uuid.Parse(req.ParentID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid parent_id"})
			return
		}
		parentID = pgtype.UUID{Bytes: parsedParentID, Valid: true}
		if _, err := h.service.GetCategoryByID(c.Request.Context(), parentID); err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "parent category not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to validate parent category"})
			return
		}
	}

	item, err := h.service.UpdateCategory(c.Request.Context(), db.UpdateCategoryParams{
		ID:       pgtype.UUID{Bytes: categoryID, Valid: true},
		Name:     req.Name,
		ParentID: parentID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			_, lookupErr := h.service.GetCategoryByID(c.Request.Context(), pgtype.UUID{Bytes: categoryID, Valid: true})
			switch {
			case lookupErr == nil:
				c.JSON(http.StatusBadRequest, gin.H{"error": "category cannot be its own parent or descendant"})
			case errors.Is(lookupErr, pgx.ErrNoRows):
				c.JSON(http.StatusNotFound, gin.H{"error": "category not found"})
			default:
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify category update"})
			}
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"item": item})
}

func (h *Handler) DeleteCategory(c *gin.Context) {
	categoryID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category_id"})
		return
	}

	if err := h.service.DeleteCategory(c.Request.Context(), pgtype.UUID{Bytes: categoryID, Valid: true}); err != nil {
		var postgresError *pgconn.PgError
		if errors.As(err, &postgresError) && postgresError.Code == "23503" {
			c.JSON(http.StatusConflict, gin.H{"error": "category is still used by clothing items or child categories"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "category deleted successfully"})
}

func (h *Handler) ListSizes(c *gin.Context) {
	items, err := h.service.GetSizes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch sizes"})
		return
	}
	if items == nil {
		items = []db.Size{}
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

func (h *Handler) CreateSize(c *gin.Context) {
	var req createSizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	item, err := h.service.CreateSize(c.Request.Context(), db.CreateSizeParams{
		ID:        pgtype.UUID{Bytes: uuid.New(), Valid: true},
		Name:      req.Name,
		SortOrder: req.SortOrder,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create size"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"item": item})
}

func (h *Handler) UpdateSize(c *gin.Context) {
	var req updateSizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	sizeID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid size_id"})
		return
	}

	item, err := h.service.UpdateSize(c.Request.Context(), db.UpdateSizeParams{
		ID:        pgtype.UUID{Bytes: sizeID, Valid: true},
		Name:      req.Name,
		SortOrder: req.SortOrder,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "size not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update size"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"item": item})
}

func (h *Handler) DeleteSize(c *gin.Context) {
	sizeID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid size_id"})
		return
	}

	if err := h.service.DeleteSize(c.Request.Context(), pgtype.UUID{Bytes: sizeID, Valid: true}); err != nil {
		var postgresError *pgconn.PgError
		if errors.As(err, &postgresError) && postgresError.Code == "23503" {
			c.JSON(http.StatusConflict, gin.H{"error": "size is still used by clothing items"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete size"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "size deleted successfully"})
}
