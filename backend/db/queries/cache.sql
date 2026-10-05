-- name: GetCachedOutfit :one
SELECT
    outfit,
    weather,
    created_at,
    wardrobe_updated_at
FROM outfit_generation_cache
WHERE user_id = $5
  AND latitude = $1
  AND longitude = $2
  AND language = $3
  AND wardrobe_updated_at = $4
  AND created_at > NOW() - INTERVAL '1 hour'
LIMIT 1;


-- name: UpsertCachedOutfit :one
INSERT INTO outfit_generation_cache (
    user_id,
    latitude,
    longitude,
    language,
    wardrobe_updated_at,
    outfit,
    weather
)
VALUES ($7, $1, $2, $3, $4, $5, $6)
ON CONFLICT (user_id, latitude, longitude, language)
DO UPDATE SET
    wardrobe_updated_at = EXCLUDED.wardrobe_updated_at,
    outfit = EXCLUDED.outfit,
    weather = EXCLUDED.weather,
    created_at = NOW()
RETURNING
    id,
    user_id,
    latitude,
    longitude,
    language,
    wardrobe_updated_at,
    outfit,
    weather,
    created_at;


-- name: GetWardrobeUpdatedAt :one
SELECT MAX(updated_at)::timestamptz AS wardrobe_updated_at
FROM clothing_items
WHERE user_id = $1;