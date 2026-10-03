package auth

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

type Handler struct {
	service        *Service
	sessionService *SessionService
}

func NewHandler(service *Service, sessionService *SessionService) *Handler {
	return &Handler{
		service:        service,
		sessionService: sessionService,
	}
}

func (h *Handler) AuthMiddleware() gin.HandlerFunc {
	return h.sessionService.AuthMiddleware()
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *Handler) Login(c *gin.Context) {
	var req loginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request",
		})
		return
	}

	user, err := h.service.Authenticate(
		c.Request.Context(),
		req.Email,
		req.Password,
	)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid credentials",
		})
		return
	}

	token, err := h.sessionService.CreateSession(c.Request.Context(), user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "could not create session",
		})
		return
	}

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "session",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(sessionDuration.Seconds()),
	})

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
		},
	})
}

func (h *Handler) GetSessionByTokenHash(c *gin.Context) {
	token, err := c.Cookie("session")
	if err != nil || token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "authentication required",
		})
		return
	}

	session, err := h.sessionService.GetSessionByTokenHash(c.Request.Context(), token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid or expired session",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"session": gin.H{
			"id":         session.ID.String(),
			"user_id":    session.UserID.String(),
			"expires_at": session.ExpiresAt.Time.Format(http.TimeFormat),
			"created_at": session.CreatedAt.Time.Format(http.TimeFormat),
		},
	})
}

func (h *Handler) LogOut(c *gin.Context) {
	token, err := c.Cookie("session")
	if err != nil || token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "token required",
		})
		return
	}

	err = h.sessionService.DeleteSession(c.Request.Context(), token)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "session not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to delete session",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "successfully logged out",
	})
}
