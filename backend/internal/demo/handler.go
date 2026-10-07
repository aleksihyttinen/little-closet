package demo

import (
	"little-closet/internal/ai"
	"little-closet/internal/clothing"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	userID          string
	clothingHandler *clothing.Handler
	aiHandler       *ai.Handler
}

func NewHandler(
	userID string,
	clothingHandler *clothing.Handler,
	aiHandler *ai.Handler,
) *Handler {
	return &Handler{
		userID:          userID,
		clothingHandler: clothingHandler,
		aiHandler:       aiHandler,
	}
}

func (h *Handler) List(c *gin.Context) {
	h.clothingHandler.ListForUser(c, h.userID)
}

func (h *Handler) ListCategories(c *gin.Context) {
	h.clothingHandler.ListCategoriesForUser(c, h.userID)
}

func (h *Handler) ListSizes(c *gin.Context) {
	h.clothingHandler.ListSizesForUser(c, h.userID)
}

func (h *Handler) GenerateOutfit(c *gin.Context) {
	h.aiHandler.GenerateOutfitForUser(c, h.userID)
}
