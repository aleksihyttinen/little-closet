package config

import (
	"log"
	"os"
)

type Config struct {
	DatabaseURL string
	HTTPAddr    string
}

func Load() Config {
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
