package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	HTTPAddr    string
}

func Load() Config {
	loadDotEnv()

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	httpAddr := os.Getenv("HTTP_ADDR")
	if httpAddr == "" {
		httpAddr = ":8080"
	}

	return Config{
		DatabaseURL: databaseURL,
		HTTPAddr:    httpAddr,
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
