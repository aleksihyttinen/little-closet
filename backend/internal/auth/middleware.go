package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

const userIDKey = "user_id"

func (s *SessionService) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Request.Cookie("session")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "authentication required",
			})
			return
		}

		if cookie.Value == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "authentication required",
			})
			return
		}

		session, err := s.GetSessionByTokenHash(
			c.Request.Context(),
			cookie.Value,
		)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid or expired session",
			})
			return
		}

		c.Set(userIDKey, session.UserID)
		c.Next()
	}
}

func CurrentUserID(c *gin.Context) interface{} {
	value, exists := c.Get(userIDKey)
	if !exists {
		return nil
	}

	return value
}
