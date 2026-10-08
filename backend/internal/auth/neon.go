package auth

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	db "little-closet/db/generated"
)

const neonUserIDKey = "neon_user_id"
const closetOwnerIDKey = "closet_owner_id"
const closetRoleKey = "closet_role"

type NeonVerifier struct {
	jwks keyfunc.Keyfunc
}

func NewNeonVerifier(ctx context.Context, authURL string) (*NeonVerifier, error) {
	jwks, err := keyfunc.NewDefaultCtx(ctx, []string{strings.TrimRight(authURL, "/") + "/.well-known/jwks.json"})
	if err != nil {
		return nil, err
	}
	return &NeonVerifier{jwks: jwks}, nil
}

func (v *NeonVerifier) Verify(token string) (string, error) {
	parsed, err := jwt.Parse(token, v.jwks.Keyfunc, jwt.WithValidMethods([]string{"EdDSA"}), jwt.WithExpirationRequired())
	if err != nil {
		return "", err
	}
	sub, err := parsed.Claims.GetSubject()
	if err != nil || sub == "" {
		return "", errors.New("token has no subject")
	}
	return sub, nil
}

func bearerToken(c *gin.Context) string {
	header := c.GetHeader("Authorization")
	if len(header) > 7 && strings.EqualFold(header[:7], "Bearer ") {
		return header[7:]
	}
	return ""
}

func (v *NeonVerifier) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := bearerToken(c)
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
			return
		}
		sub, err := v.Verify(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}
		c.Set(neonUserIDKey, sub)
		c.Next()
	}
}

func ClosetAccessMiddleware(queries *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := CurrentNeonUserID(c)
		ownerID := c.GetHeader("X-Closet-Owner-ID")
		if ownerID == "" || ownerID == userID {
			c.Set(closetOwnerIDKey, userID)
			c.Set(closetRoleKey, "owner")
			c.Next()
			return
		}

		share, err := queries.ResolveSharedClosetByOwner(
			c.Request.Context(),
			db.ResolveSharedClosetByOwnerParams{
				SharedWithUserID: pgtype.Text{String: userID, Valid: true},
				OwnerUserID:      ownerID,
			},
		)
		if err != nil {
			if err == pgx.ErrNoRows {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "closet access denied"})
				return
			}
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to verify closet access"})
			return
		}

		c.Set(closetOwnerIDKey, share.OwnerUserID)
		c.Set(closetRoleKey, share.Role)
		c.Next()
	}
}

func RequireClosetEditor() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get(closetRoleKey)
		if !exists || (role != "owner" && role != "editor") {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "editor access required"})
			return
		}
		c.Next()
	}
}

func (v *NeonVerifier) Session(c *gin.Context) {
	sub, err := v.Verify(bearerToken(c))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"session": gin.H{"user_id": sub}})
}

func CurrentNeonUserID(c *gin.Context) string {
	return c.GetString(neonUserIDKey)
}

func CurrentClosetOwnerID(c *gin.Context) string {
	return c.GetString(closetOwnerIDKey)
}

func CurrentClosetRole(c *gin.Context) string {
	return c.GetString(closetRoleKey)
}
