package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"time"

	db "little-closet/db/generated"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const sessionDuration = 1 * 24 * time.Hour

type SessionService struct {
	queries *db.Queries
}

func NewSessionService(queries *db.Queries) *SessionService {
	return &SessionService{
		queries: queries,
	}
}

func hashSessionToken(rawToken string) string {
	tokenHash := sha256.Sum256([]byte(rawToken))
	return base64.RawURLEncoding.EncodeToString(tokenHash[:])
}

func (s *SessionService) CreateSession(
	ctx context.Context,
	userID pgtype.UUID,
) (string, error) {
	tokenBytes := make([]byte, 32)

	if _, err := rand.Read(tokenBytes); err != nil {
		return "", fmt.Errorf("generate session token: %w", err)
	}

	rawToken := base64.RawURLEncoding.EncodeToString(tokenBytes)

	expiresAt := time.Now().Add(sessionDuration)

	_, err := s.queries.CreateSession(ctx, db.CreateSessionParams{
		ID:        uuidToPgtype(uuid.New()),
		TokenHash: hashSessionToken(rawToken),
		UserID:    userID,
		ExpiresAt: pgtype.Timestamptz{
			Time:  expiresAt,
			Valid: true,
		},
	})

	if err != nil {
		return "", fmt.Errorf("create session: %w", err)
	}

	return rawToken, nil
}

func (s *SessionService) GetSessionByTokenHash(
	ctx context.Context,
	rawToken string,
) (db.GetSessionByTokenHashRow, error) {
	return s.queries.GetSessionByTokenHash(ctx, hashSessionToken(rawToken))
}

func (s *SessionService) DeleteSession(
	ctx context.Context,
	rawToken string,
) error {
	return s.queries.DeleteSession(ctx, hashSessionToken(rawToken))
}

func uuidToPgtype(id uuid.UUID) pgtype.UUID {
	return pgtype.UUID{
		Bytes: id,
		Valid: true,
	}
}
