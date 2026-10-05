package clothing

import (
	"context"
	db "little-closet/db/generated"

	"github.com/jackc/pgx/v5/pgtype"
)

type Service struct {
	queries *db.Queries
}

func NewService(queries *db.Queries) *Service {
	return &Service{
		queries: queries,
	}
}

func (s *Service) GetClothing(
	ctx context.Context,
	userID string,
) ([]db.ListClothingItemsRow, error) {
	items, err := s.queries.ListClothingItems(ctx, userID)
	if err != nil {
		return nil, err
	}

	return items, nil
}

func (s *Service) CreateClothing(
	ctx context.Context,
	arg db.CreateClothingItemParams,
) (db.CreateClothingItemRow, error) {
	item, err := s.queries.CreateClothingItem(ctx, arg)
	if err != nil {
		return db.CreateClothingItemRow{}, err
	}

	return item, nil
}

func (s *Service) UpdateClothing(
	ctx context.Context,
	arg db.UpdateClothingItemParams,
) (db.UpdateClothingItemRow, error) {
	item, err := s.queries.UpdateClothingItem(ctx, arg)
	if err != nil {
		return db.UpdateClothingItemRow{}, err
	}

	return item, nil
}

func (s *Service) DeleteClothing(
	ctx context.Context,
	id pgtype.UUID,
	userID string,
) error {
	err := s.queries.DeleteClothingItem(ctx, db.DeleteClothingItemParams{ID: id, UserID: userID})
	if err != nil {
		return err
	}

	return nil
}

func (s *Service) GetSizes(
	ctx context.Context,
	userID string,
) ([]db.ListSizesRow, error) {
	sizes, err := s.queries.ListSizes(ctx, userID)
	if err != nil {
		return nil, err
	}

	return sizes, nil
}

func (s *Service) GetGategories(
	ctx context.Context,
	userID string,
) ([]db.ListCategoriesRow, error) {
	items, err := s.queries.ListCategories(ctx, userID)
	if err != nil {
		return nil, err
	}

	return items, nil
}

func (s *Service) CreateCategory(
	ctx context.Context,
	arg db.CreateCategoryParams,
) (db.CreateCategoryRow, error) {
	return s.queries.CreateCategory(ctx, arg)
}

func (s *Service) GetCategoryByID(
	ctx context.Context,
	id pgtype.UUID,
	userID string,
) (db.GetCategoryByIDRow, error) {
	return s.queries.GetCategoryByID(ctx, db.GetCategoryByIDParams{ID: id, UserID: userID})
}

func (s *Service) UpdateCategory(
	ctx context.Context,
	arg db.UpdateCategoryParams,
) (db.UpdateCategoryRow, error) {
	return s.queries.UpdateCategory(ctx, arg)
}

func (s *Service) DeleteCategory(
	ctx context.Context,
	id pgtype.UUID,
	userID string,
) error {
	return s.queries.DeleteCategory(ctx, db.DeleteCategoryParams{ID: id, UserID: userID})
}

func (s *Service) CreateSize(
	ctx context.Context,
	arg db.CreateSizeParams,
) (db.CreateSizeRow, error) {
	return s.queries.CreateSize(ctx, arg)
}

func (s *Service) UpdateSize(
	ctx context.Context,
	arg db.UpdateSizeParams,
) (db.UpdateSizeRow, error) {
	return s.queries.UpdateSize(ctx, arg)
}

func (s *Service) DeleteSize(
	ctx context.Context,
	id pgtype.UUID,
	userID string,
) error {
	return s.queries.DeleteSize(ctx, db.DeleteSizeParams{ID: id, UserID: userID})
}
