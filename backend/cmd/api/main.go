package main

import (
	"context"
	dbgenerated "little-closet/db/generated"
	"little-closet/internal/ai"
	"little-closet/internal/auth"
	"little-closet/internal/clothing"
	"little-closet/internal/config"
	"little-closet/internal/database"
	"little-closet/internal/demo"
	"little-closet/internal/sharing"
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
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Closet-Owner-ID"},
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
	demoHandler := demo.NewHandler(cfg.DemoUserID, clothingHandler, aiHandler)
	sharingHandler := sharing.NewHandler(queries)

	api := router.Group("/api/v1")

	api.GET("/auth/session", neonAuth.Session)
	api.GET("/demo/clothing", demoHandler.List)
	api.GET("/demo/category", demoHandler.ListCategories)
	api.GET("/demo/size", demoHandler.ListSizes)
	api.POST("/demo/ai/generate-outfit", demoHandler.GenerateOutfit)

	protected := api.Group("")
	protected.Use(neonAuth.Middleware())
	protected.Use(auth.ClosetAccessMiddleware(queries))

	protected.GET("/clothing", clothingHandler.List)
	protected.GET("/size", clothingHandler.ListSizes)
	protected.GET("/category", clothingHandler.ListCategories)
	protected.POST("/ai/generate-outfit", aiHandler.GenerateOutfit)
	protected.GET("/closet/shares", sharingHandler.List)
	protected.POST("/closet/shares", sharingHandler.Create)
	protected.POST("/closet/invitations/accept", sharingHandler.Accept)
	protected.DELETE("/closet/shares/:id", sharingHandler.Revoke)

	editor := protected.Group("")
	editor.Use(auth.RequireClosetEditor())

	editor.POST("/ai/analyze-image", aiHandler.AnalyzeImage)

	editor.POST("/clothing", clothingHandler.Create)
	editor.PUT("/clothing/:id", clothingHandler.Update)
	editor.DELETE("/clothing/:id", clothingHandler.Delete)

	editor.POST("/size", clothingHandler.CreateSize)
	editor.PUT("/size/:id", clothingHandler.UpdateSize)
	editor.DELETE("/size/:id", clothingHandler.DeleteSize)

	editor.POST("/category", clothingHandler.CreateCategory)
	editor.PUT("/category/:id", clothingHandler.UpdateCategory)
	editor.DELETE("/category/:id", clothingHandler.DeleteCategory)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})
	log.Fatal(router.Run(cfg.HTTPAddr))
}
