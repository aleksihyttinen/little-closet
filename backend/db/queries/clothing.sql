-- name: ListCategories :many
WITH RECURSIVE category_tree AS (
    SELECT
        id,
        name,
        parent_id,
        created_at,
        ARRAY[name] AS path
    FROM categories
    WHERE parent_id IS NULL

    UNION ALL

    SELECT
        child.id,
        child.name,
        child.parent_id,
        child.created_at,
        parent.path || child.name
    FROM categories child
    JOIN category_tree parent
        ON child.parent_id = parent.id
)
SELECT
    id,
    name,
    parent_id,
    created_at
FROM category_tree
ORDER BY path;


-- name: GetCategoryByID :one
SELECT
    id,
    name,
    parent_id,
    created_at
FROM categories
WHERE id = $1;


-- name: GetCategoryByName :one
SELECT
    id,
    name,
    parent_id,
    created_at
FROM categories
WHERE name = $1;


-- name: CreateCategory :one
INSERT INTO categories (
    id,
    name,
    parent_id
)
VALUES ($1, $2, $3)
RETURNING
    id,
    name,
    parent_id,
    created_at;

-- name: UpdateCategory :one
WITH RECURSIVE descendants AS (
    SELECT id
    FROM categories
    WHERE parent_id = $1

    UNION ALL

    SELECT child.id
    FROM categories child
    JOIN descendants parent ON child.parent_id = parent.id
)
UPDATE categories
SET
    name = $2,
    parent_id = $3
WHERE categories.id = $1
    AND $3 IS DISTINCT FROM $1
    AND NOT EXISTS (SELECT 1 FROM descendants WHERE id = $3)
RETURNING
    id,
    name,
    parent_id,
    created_at;

-- name: DeleteCategory :exec
DELETE FROM categories
WHERE id = $1;


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

-- name: UpdateSize :one
UPDATE sizes
SET
    name = $2,
    sort_order = $3
WHERE id = $1
RETURNING
    id,
    name,
    sort_order;

-- name: DeleteSize :exec
DELETE FROM sizes
WHERE id = $1;


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
ORDER BY s.sort_order, s.name, ci.name;


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