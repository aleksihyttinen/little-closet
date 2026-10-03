-- name: CreateSession :one
INSERT INTO sessions (
    id,
    token_hash,
    user_id,
    expires_at
)
VALUES (
    $1,
    $2,
    $3,
    $4
)
RETURNING
    id,
    token_hash,
    user_id,
    expires_at,
    created_at;
    
-- name: GetSessionByTokenHash :one
SELECT

    id,
    user_id,
    token_hash,
    expires_at,
    created_at
FROM sessions
WHERE token_hash = $1
    AND expires_at > NOW()
LIMIT 1;

-- name: DeleteSession :exec
DELETE FROM sessions
WHERE token_hash = $1;

-- name: DeleteExpiredSessions :exec
DELETE FROM sessions
WHERE expires_at < NOW();