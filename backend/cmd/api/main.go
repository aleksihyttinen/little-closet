package main

import (
	"context"
	dbgenerated "little-closet/db/generated"
	"little-closet/internal/ai"
	"little-closet/internal/auth"
	"little-closet/internal/clothing"
	"little-closet/internal/config"
	"little-closet/internal/database"
	"log"
	"net/http"
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

	httpClient := &http.Client{
		Timeout: 60 * time.Second,
	}

	if err := router.SetTrustedProxies(nil); err != nil {
		log.Fatal(err)
	}
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	neonAuth, err := auth.NewNeonVerifier(ctx, cfg.NeonAuthURL)
	if err != nil {
		log.Fatal(err)
	}
	clothingService := clothing.NewService(queries)
	clothingHandler := clothing.NewHandler(clothingService)

	aiService := ai.NewService(queries, httpClient, cfg.NeonGenerateOutfitFunctionURL, cfg.NeonAnalyzeImageFunctionURL, cfg.NeonFunctionSecret)
	aiHandler := ai.NewHandler(aiService)

	api := router.Group("/api/v1")

	api.GET("/auth/session", neonAuth.Session)

	protected := api.Group("")
	protected.Use(neonAuth.Middleware())

	protected.GET("/clothing", clothingHandler.List)
	protected.GET("/size", clothingHandler.ListSizes)
	protected.GET("/category", clothingHandler.ListCategories)
	protected.POST("/ai/generate-outfit", aiHandler.GenerateOutfit)
	protected.POST("/ai/analyze-image", aiHandler.AnalyzeImage)

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
