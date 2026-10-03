package auth

import (
	db "little-closet/db/generated"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const userIDKey = "user_id"

func (s *SessionService) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var (
			session       db.GetSessionByTokenHashRow
			authenticated bool
			err           error
		)
		//TODO REMOVE AUTH HEADER LOGIC WHEN DOMAIN NAME IS SET
		// 1. Prefer the cookie.
		if cookie, cookieErr := c.Request.Cookie("session"); cookieErr == nil && cookie.Value != "" {
			session, err = s.GetSessionByTokenHash(
				c.Request.Context(),
				cookie.Value,
			)

			if err == nil {
				authenticated = true
			}
		}

		// 2. Fall back to Authorization header.
		if !authenticated {
			auth := c.GetHeader("Authorization")

			if strings.HasPrefix(auth, "Bearer ") {
				token := strings.TrimPrefix(auth, "Bearer ")

				if token != "" {
					session, err = s.GetSessionByTokenHash(
						c.Request.Context(),
						token,
					)

					if err == nil {
						authenticated = true
					}
				}
			}
		}

		if !authenticated {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "authentication required",
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
