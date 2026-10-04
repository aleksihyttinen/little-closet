package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL                   string
	FrontendURL                   string
	HTTPAddr                      string
	NeonGenerateOutfitFunctionURL string
	NeonAnalyzeImageFunctionURL   string
}

func Load() Config {
	loadDotEnv()

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	httpAddr := os.Getenv("PORT")
	if httpAddr == "" {
		httpAddr = "8080"
	}

	httpAddr = "0.0.0.0:" + httpAddr

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	neonGenerateOutfitFunctionURL := os.Getenv("NEON_GENERATE_OUTFIT_FUNCTION_URL")
	if neonGenerateOutfitFunctionURL == "" {
		log.Fatal("NEON_GENERATE_OUTFIT_FUNCTION_URL is not set")
	}

	neonAnalyzeImageFunctionURL := os.Getenv("NEON_ANALYZE_IMAGE_FUNCTION_URL")
	if neonAnalyzeImageFunctionURL == "" {
		log.Fatal("NEON_ANALYZE_IMAGE_FUNCTION_URL is not set")
	}

	return Config{
		DatabaseURL:                   databaseURL,
		HTTPAddr:                      httpAddr,
		FrontendURL:                   frontendURL,
		NeonGenerateOutfitFunctionURL: neonGenerateOutfitFunctionURL,
		NeonAnalyzeImageFunctionURL:   neonAnalyzeImageFunctionURL,
	}
}

func loadDotEnv() {
	for _, path := range []string{".env", "../.env"} {
		if _, err := os.Stat(path); os.IsNotExist(err) {
			continue
		} else if err != nil {
			log.Fatalf("failed to inspect %s: %v", path, err)
		}

		if err := godotenv.Load(path); err != nil {
			log.Fatalf("failed to load %s: %v", path, err)
		}
		return
	}
}
