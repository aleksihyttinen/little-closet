package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadReadsParentEnvAndPreservesEnvironment(t *testing.T) {
	root := t.TempDir()
	backendDir := filepath.Join(root, "backend")
	if err := os.Mkdir(backendDir, 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(root, ".env"), []byte("DATABASE_URL=postgres://from-dotenv\nHTTP_ADDR=:9090\n"), 0600); err != nil {
		t.Fatal(err)
	}

	workingDir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	if err := os.Chdir(backendDir); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := os.Chdir(workingDir); err != nil {
			t.Errorf("restore working directory: %v", err)
		}
	})

	databaseURL, hadDatabaseURL := os.LookupEnv("DATABASE_URL")
	if err := os.Unsetenv("DATABASE_URL"); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if hadDatabaseURL {
			_ = os.Setenv("DATABASE_URL", databaseURL)
		} else {
			_ = os.Unsetenv("DATABASE_URL")
		}
	})
	t.Setenv("HTTP_ADDR", ":9091")

	cfg := Load()
	if cfg.DatabaseURL != "postgres://from-dotenv" {
		t.Errorf("DatabaseURL = %q, want value from parent .env", cfg.DatabaseURL)
	}
	if cfg.HTTPAddr != ":9091" {
		t.Errorf("HTTPAddr = %q, want environment override", cfg.HTTPAddr)
	}
}
