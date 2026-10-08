package sharing

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"net/http"
	"time"

	db "little-closet/db/generated"
	"little-closet/internal/auth"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

const invitationLifetime = 7 * 24 * time.Hour

type Handler struct {
	queries *db.Queries
}

func NewHandler(queries *db.Queries) *Handler {
	return &Handler{queries: queries}
}

type createShareRequest struct {
	Role string `json:"role"`
}

func newInvitationToken() (string, string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", "", err
	}
	token := base64.RawURLEncoding.EncodeToString(bytes)
	hash := sha256.Sum256([]byte(token))
	return token, hex.EncodeToString(hash[:]), nil
}

func (h *Handler) Create(c *gin.Context) {
	var req createShareRequest
	if err := c.ShouldBindJSON(&req); err != nil || (req.Role != "viewer" && req.Role != "editor") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "role must be viewer or editor"})
		return
	}

	token, tokenHash, err := newInvitationToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create invitation"})
		return
	}

	expiresAt := time.Now().Add(invitationLifetime)
	share, err := h.queries.CreateClosetShare(c.Request.Context(), db.CreateClosetShareParams{
		ID:          pgtype.UUID{Bytes: uuid.New(), Valid: true},
		OwnerUserID: auth.CurrentNeonUserID(c),
		Role:        req.Role,
		TokenHash:   tokenHash,
		ExpiresAt:   pgtype.Timestamptz{Time: expiresAt, Valid: true},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save invitation"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"share":        shareResponse(share.ID, share.OwnerUserID, share.SharedWithUserID, share.Role, share.ExpiresAt, share.AcceptedAt, share.RevokedAt),
		"invite_token": token,
	})
}

func (h *Handler) List(c *gin.Context) {
	shares, err := h.queries.ListOwnedClosetShares(c.Request.Context(), auth.CurrentNeonUserID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list closet shares"})
		return
	}

	items := make([]gin.H, 0, len(shares))
	for _, share := range shares {
		items = append(items, shareResponse(share.ID, share.OwnerUserID, share.SharedWithUserID, share.Role, share.ExpiresAt, share.AcceptedAt, share.RevokedAt))
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

func (h *Handler) Revoke(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid share_id"})
		return
	}

	if err := h.queries.RevokeClosetShare(c.Request.Context(), db.RevokeClosetShareParams{
		ID:          pgtype.UUID{Bytes: id, Valid: true},
		OwnerUserID: auth.CurrentNeonUserID(c),
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to revoke closet share"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "closet share revoked"})
}

func (h *Handler) Accept(c *gin.Context) {
	var req struct {
		Token string `json:"token"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.Token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invitation token is required"})
		return
	}

	hash := sha256.Sum256([]byte(req.Token))
	share, err := h.queries.AcceptClosetShare(c.Request.Context(), db.AcceptClosetShareParams{
		TokenHash:        hex.EncodeToString(hash[:]),
		SharedWithUserID: pgtype.Text{String: auth.CurrentNeonUserID(c), Valid: true},
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invitation is invalid, expired, or already belongs to another user"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to accept invitation"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"share": shareResponse(share.ID, share.OwnerUserID, share.SharedWithUserID, share.Role, share.ExpiresAt, share.AcceptedAt, share.RevokedAt)})
}

func shareResponse(
	id pgtype.UUID,
	ownerUserID string,
	sharedWithUserID pgtype.Text,
	role string,
	expiresAt pgtype.Timestamptz,
	acceptedAt pgtype.Timestamptz,
	revokedAt pgtype.Timestamptz,
) gin.H {
	return gin.H{
		"id":                  id,
		"owner_user_id":       ownerUserID,
		"shared_with_user_id": sharedWithUserID,
		"role":                role,
		"expires_at":          expiresAt,
		"accepted_at":         acceptedAt,
		"revoked_at":          revokedAt,
	}
}
