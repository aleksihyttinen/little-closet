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
) ([]db.ListClothingItemsRow, error) {
	items, err := s.queries.ListClothingItems(ctx)
	if err != nil {
		return nil, err
	}

	return items, nil
}

func (s *Service) CreateClothing(
	ctx context.Context,
	arg db.CreateClothingItemParams,
) (db.ClothingItem, error) {
	item, err := s.queries.CreateClothingItem(ctx, arg)
	if err != nil {
		return db.ClothingItem{}, err
	}

	return item, nil
}

func (s *Service) UpdateClothing(
	ctx context.Context,
	arg db.UpdateClothingItemParams,
) (db.ClothingItem, error) {
	item, err := s.queries.UpdateClothingItem(ctx, arg)
	if err != nil {
		return db.ClothingItem{}, err
	}

	return item, nil
}

func (s *Service) DeleteClothing(
	ctx context.Context,
	id pgtype.UUID,
) error {
	err := s.queries.DeleteClothingItem(ctx, id)
	if err != nil {
		return err
	}

	return nil
}

func (s *Service) GetSizes(
	ctx context.Context,
) ([]db.Size, error) {
	sizes, err := s.queries.ListSizes(ctx)
	if err != nil {
		return nil, err
	}

	return sizes, nil
}

func (s *Service) GetGategories(
	ctx context.Context,
) ([]db.ListCategoriesRow, error) {
	items, err := s.queries.ListCategories(ctx)
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
) (db.GetCategoryByIDRow, error) {
	return s.queries.GetCategoryByID(ctx, id)
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
) error {
	return s.queries.DeleteCategory(ctx, id)
}

func (s *Service) CreateSize(
	ctx context.Context,
	arg db.CreateSizeParams,
) (db.Size, error) {
	return s.queries.CreateSize(ctx, arg)
}

func (s *Service) UpdateSize(
	ctx context.Context,
	arg db.UpdateSizeParams,
) (db.Size, error) {
	return s.queries.UpdateSize(ctx, arg)
}

func (s *Service) DeleteSize(
	ctx context.Context,
	id pgtype.UUID,
) error {
	return s.queries.DeleteSize(ctx, id)
}
