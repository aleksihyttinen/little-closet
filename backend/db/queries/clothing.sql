-- name: ListCategories :many
SELECT
    id,
    name,
    created_at
FROM categories
ORDER BY name;


-- name: GetCategoryByID :one
SELECT
    id,
    name,
    created_at
FROM categories
WHERE id = $1;


-- name: GetCategoryByName :one
SELECT
    id,
    name,
    created_at
FROM categories
WHERE name = $1;


-- name: CreateCategory :one
INSERT INTO categories (
    id,
    name
)
VALUES ($1, $2)
RETURNING
    id,
    name,
    created_at;


-- name: ListSizes :many
SELECT
    id,
    name,
    sort_order
FROM sizes
ORDER BY sort_order ASC, name ASC;


-- name: GetSizeByID :one
SELECT
    id,
    name,
    sort_order
FROM sizes
WHERE id = $1;


-- name: GetSizeByName :one
SELECT
    id,
    name,
    sort_order
FROM sizes
WHERE name = $1;


-- name: CreateSize :one
INSERT INTO sizes (
    id,
    name,
    sort_order
)
VALUES ($1, $2, $3)
RETURNING
    id,
    name,
    sort_order;


-- name: ListClothingItems :many
SELECT
    ci.id,
    ci.name,
    ci.quantity,
    ci.category_id,
    c.name AS category_name,
    ci.size_id,
    s.name AS size_name,
    ci.created_at,
    ci.updated_at
FROM clothing_items ci
JOIN categories c ON c.id = ci.category_id
JOIN sizes s ON s.id = ci.size_id
ORDER BY ci.name;


-- name: GetClothingItem :one
SELECT
    ci.id,
    ci.name,
    ci.quantity,
    ci.category_id,
    c.name AS category_name,
    ci.size_id,
    s.name AS size_name,
    ci.created_at,
    ci.updated_at
FROM clothing_items ci
JOIN categories c ON c.id = ci.category_id
JOIN sizes s ON s.id = ci.size_id
WHERE ci.id = $1;


-- name: CreateClothingItem :one
INSERT INTO clothing_items (
    id,
    name,
    category_id,
    size_id,
    quantity
)
VALUES ($1, $2, $3, $4, $5)
RETURNING
    id,
    name,
    category_id,
    size_id,
    quantity,
    created_at,
    updated_at;


-- name: UpdateClothingItem :one
UPDATE clothing_items
SET
    name = $2,
    category_id = $3,
    size_id = $4,
    quantity = $5,
    updated_at = NOW()
WHERE id = $1
RETURNING
    id,
    name,
    category_id,
    size_id,
    quantity,
    created_at,
    updated_at;


-- name: DeleteClothingItem :exec
DELETE FROM clothing_items
WHERE id = $1;