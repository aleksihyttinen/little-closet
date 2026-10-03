package main

import (
	"context"
	dbgenerated "little-closet/db/generated"
	"little-closet/internal/auth"
	"little-closet/internal/clothing"
	"little-closet/internal/config"
	"little-closet/internal/database"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()
	db, err := database.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	queries := dbgenerated.New(db)

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	authService := auth.NewService(queries)
	sessionService := auth.NewSessionService(queries)
	authHandler := auth.NewHandler(authService, sessionService)
	clothingService := clothing.NewService(queries)
	clothingHandler := clothing.NewHandler(clothingService)

	api := router.Group("/api/v1")

	api.POST("/auth/login", authHandler.Login)
	api.POST("/auth/logout", authHandler.LogOut)
	api.GET("/auth/session", authHandler.GetSessionByTokenHash)
	api.GET("/clothing", clothingHandler.List)
	api.GET("/size", clothingHandler.ListSizes)
	api.GET("/category", clothingHandler.ListCategories)

	protected := api.Group("")
	protected.Use(authHandler.AuthMiddleware())

	protected.POST("/clothing", clothingHandler.Create)
	protected.PUT("/clothing/:id", clothingHandler.Update)
	protected.DELETE("/clothing/:id", clothingHandler.Delete)

	protected.POST("/size", clothingHandler.CreateSize)
	protected.PUT("/size/:id", clothingHandler.UpdateSize)
	protected.DELETE("/size/:id", clothingHandler.DeleteSize)

	protected.POST("/category", clothingHandler.CreateCategory)
	protected.PUT("/category/:id", clothingHandler.UpdateCategory)
	protected.DELETE("/category/:id", clothingHandler.DeleteCategory)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})
	log.Fatal(router.Run(cfg.HTTPAddr))
}
