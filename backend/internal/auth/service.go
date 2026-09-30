package auth

import (
	"context"
	"errors"
	db "little-closet/db/generated"
)

var ErrInvalidCredentials = errors.New("invalid credentials")

type Service struct {
	queries *db.Queries
}

func NewService(queries *db.Queries) *Service {
	return &Service{
		queries: queries,
	}
}

func (s *Service) Authenticate(
	ctx context.Context,
	email string,
	password string,
) (*db.User, error) {
	user, err := s.queries.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	success, err := VerifyPassword(password, user.PasswordHash)
	if err != nil {
		return nil, err
	}

	if !success {
		return nil, ErrInvalidCredentials
	}

	return &user, nil

}
