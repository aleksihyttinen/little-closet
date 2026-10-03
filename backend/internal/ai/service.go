package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	db "little-closet/db/generated"
	"net/http"
	"time"
)

type Service struct {
	queries         *db.Queries
	httpClient      *http.Client
	neonFunctionURL string
}

type generateOutfitResponse struct {
	Outfit  string          `json:"outfit"`
	Weather json.RawMessage `json:"weather"`
}

type GenerateOutfitResult struct {
	Outfit  string
	Weather json.RawMessage
}

func NewService(queries *db.Queries, httpClient *http.Client, neonFunctionURL string) *Service {
	return &Service{
		queries:         queries,
		httpClient:      httpClient,
		neonFunctionURL: neonFunctionURL,
	}
}

func (s *Service) GetCachedOutfit(
	ctx context.Context,
	arg db.GetCachedOutfitParams,
) (db.GetCachedOutfitRow, error) {
	outfit, err := s.queries.GetCachedOutfit(ctx, arg)
	if err != nil {
		return db.GetCachedOutfitRow{}, err
	}

	return outfit, nil
}

func (s *Service) UpsertCachedOutfit(
	ctx context.Context,
	arg db.UpsertCachedOutfitParams,
) (db.OutfitGenerationCache, error) {
	item, err := s.queries.UpsertCachedOutfit(ctx, arg)
	if err != nil {
		return db.OutfitGenerationCache{}, err
	}

	return item, nil
}

func (s *Service) GetWardrobeUpdatedAt(
	ctx context.Context,
) (time.Time, error) {
	ts, err := s.queries.GetWardrobeUpdatedAt(ctx)
	if err != nil {
		return time.Time{}, err
	}

	if !ts.Valid {
		return time.Time{}, nil
	}

	return ts.Time, nil
}

func (s *Service) GenerateOutfit(
	ctx context.Context,
	arg generateOutfitRequest,
) (GenerateOutfitResult, error) {

	body, err := json.Marshal(arg)
	if err != nil {
		return GenerateOutfitResult{}, err
	}

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		s.neonFunctionURL,
		bytes.NewReader(body),
	)
	if err != nil {
		return GenerateOutfitResult{}, err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return GenerateOutfitResult{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return GenerateOutfitResult{}, fmt.Errorf(
			"neon function returned status %d",
			resp.StatusCode,
		)
	}

	var result generateOutfitResponse

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return GenerateOutfitResult{}, err
	}

	return GenerateOutfitResult{
		Outfit:  result.Outfit,
		Weather: result.Weather,
	}, nil
}
