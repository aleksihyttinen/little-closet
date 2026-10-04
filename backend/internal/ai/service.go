package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	db "little-closet/db/generated"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"time"
)

type Service struct {
	queries                       *db.Queries
	httpClient                    *http.Client
	neonGenerateOutfitFunctionURL string
	neonAnalyzeImageFunctionURL   string
}

type generateOutfitResponse struct {
	Outfit  string          `json:"outfit"`
	Weather json.RawMessage `json:"weather"`
}

type GenerateOutfitResult struct {
	Outfit  string
	Weather json.RawMessage
}

type AnalyzeImageResult struct {
	Name       string               `json:"name"`
	SizeSource string               `json:"size_source"`
	Size       AnalyzeImageSize     `json:"size"`
	Category   AnalyzeImageCategory `json:"category"`
}

type AnalyzeImageSize struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type AnalyzeImageCategory struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	ParentID *string `json:"parent_id"`
}

func NewService(queries *db.Queries, httpClient *http.Client, neonGenerateOutfitFunctionURL string, neonAnalyzeImageFunctionURL string) *Service {
	return &Service{
		queries:                       queries,
		httpClient:                    httpClient,
		neonGenerateOutfitFunctionURL: neonGenerateOutfitFunctionURL,
		neonAnalyzeImageFunctionURL:   neonAnalyzeImageFunctionURL,
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
		s.neonGenerateOutfitFunctionURL,
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

func (s *Service) AnalyzeImage(
	ctx context.Context,
	arg analyzeImageRequest,
) (AnalyzeImageResult, error) {
	var body bytes.Buffer

	writer := multipart.NewWriter(&body)

	if err := writer.WriteField("language", arg.Language); err != nil {
		return AnalyzeImageResult{}, err
	}

	header := make(textproto.MIMEHeader)
	header.Set(
		"Content-Disposition",
		`form-data; name="image"; filename="clothing.jpg"`,
	)
	header.Set("Content-Type", "image/jpeg")

	part, err := writer.CreatePart(header)
	if err != nil {
		return AnalyzeImageResult{}, err
	}

	if _, err := part.Write(arg.Image); err != nil {
		return AnalyzeImageResult{}, err
	}

	if err := writer.Close(); err != nil {
		return AnalyzeImageResult{}, err
	}

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		s.neonAnalyzeImageFunctionURL,
		&body,
	)
	if err != nil {
		return AnalyzeImageResult{}, err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return AnalyzeImageResult{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		responseBody, _ := io.ReadAll(resp.Body)

		return AnalyzeImageResult{}, fmt.Errorf(
			"neon function returned status %d: %s",
			resp.StatusCode,
			string(responseBody),
		)
	}

	var result AnalyzeImageResult

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return AnalyzeImageResult{}, err
	}

	return result, nil
}
