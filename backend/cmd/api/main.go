package main

import (
	"context"
	dbgenerated "little-closet/db/generated"
	"little-closet/internal/auth"
	"little-closet/internal/config"
	"little-closet/internal/database"
	"log"

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

	authService := auth.NewService(queries)
	authHandler := auth.NewHandler(authService)

	api := router.Group("/api/v1")

	api.POST("/auth/login", authHandler.Login)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})
	log.Fatal(router.Run(cfg.HTTPAddr))
}
