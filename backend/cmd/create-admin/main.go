package main

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"syscall"

	"github.com/google/uuid"
	"golang.org/x/term"

	db "little-closet/db/generated"
	"little-closet/internal/auth"
	"little-closet/internal/config"
	"little-closet/internal/database"

	"github.com/jackc/pgx/v5/pgtype"
)

const (
	argonTime    uint32 = 3
	argonMemory  uint32 = 64 * 1024
	argonThreads uint8  = 4
	argonKeyLen  uint32 = 32
	argonSaltLen uint32 = 16
)

func main() {
	cfg := config.Load()

	ctx := context.Background()

	pool, err := database.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	queries := db.New(pool)

	reader := bufio.NewReader(os.Stdin)

	fmt.Print("Email: ")
	email, err := reader.ReadString('\n')
	if err != nil {
		log.Fatal(err)
	}
	email = strings.TrimSpace(email)

	if email == "" {
		log.Fatal("email is required")
	}

	password, err := readPassword("Password: ")
	if err != nil {
		log.Fatal(err)
	}

	confirmPassword, err := readPassword("Confirm password: ")
	if err != nil {
		log.Fatal(err)
	}

	if password != confirmPassword {
		log.Fatal("passwords do not match")
	}

	if len(password) < 12 {
		log.Fatal("password must be at least 12 characters")
	}

	passwordHash, err := auth.HashPassword(password)
	if err != nil {
		log.Fatal(err)
	}

	_, err = queries.GetUserByEmail(ctx, email)
	if err == nil {
		log.Fatal("a user with this email already exists")
	}

	user, err := queries.CreateUser(ctx, db.CreateUserParams{
		ID: pgtype.UUID{
			Bytes: uuid.New(),
			Valid: true,
		},
		Email:        email,
		PasswordHash: passwordHash,
	})
	if err != nil {
		log.Fatalf("create admin user: %v", err)
	}

	fmt.Printf("\nAdmin user created.\n")
	fmt.Printf("ID: %s\n", user.ID)
	fmt.Printf("Email: %s\n", user.Email)
}

func readPassword(prompt string) (string, error) {
	fmt.Print(prompt)

	password, err := term.ReadPassword(int(syscall.Stdin))
	fmt.Println()

	if err != nil {
		return "", err
	}

	return string(password), nil
}
