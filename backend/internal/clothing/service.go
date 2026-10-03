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
) ([]db.Category, error) {
	items, err := s.queries.ListCategories(ctx)
	if err != nil {
		return nil, err
	}

	return items, nil
}
