-- name: CreateClosetShare :one
INSERT INTO closet_shares (
    id,
    owner_user_id,
    role,
    name,
    token_hash,
    expires_at
)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, owner_user_id, shared_with_user_id, role, name, expires_at, accepted_at, revoked_at, created_at;

-- name: ListOwnedClosetShares :many
SELECT
    id,
    owner_user_id,
    shared_with_user_id,
    role,
    name,
    expires_at,
    accepted_at,
    revoked_at,
    created_at
FROM closet_shares
WHERE owner_user_id = $1
ORDER BY created_at DESC;

-- name: RevokeClosetShare :exec
UPDATE closet_shares
SET revoked_at = NOW()
WHERE id = $1
  AND owner_user_id = $2
  AND revoked_at IS NULL;

-- name: DeleteRevokedClosetShare :exec
DELETE FROM closet_shares
WHERE id = $1
  AND owner_user_id = $2
  AND revoked_at IS NOT NULL;

-- name: AcceptClosetShare :one
UPDATE closet_shares
SET
    shared_with_user_id = $2,
    accepted_at = NOW()
WHERE token_hash = $1
  AND revoked_at IS NULL
  AND expires_at > NOW()
  AND (shared_with_user_id IS NULL OR shared_with_user_id = $2)
  AND owner_user_id <> $2
RETURNING id, owner_user_id, shared_with_user_id, role, name, expires_at, accepted_at, revoked_at, created_at;

-- name: ResolveSharedCloset :one
SELECT owner_user_id, role
FROM closet_shares
WHERE shared_with_user_id = $1
  AND revoked_at IS NULL
ORDER BY accepted_at DESC NULLS LAST, created_at DESC
LIMIT 1;

-- name: ResolveSharedClosetByOwner :one
SELECT owner_user_id, role
FROM closet_shares
WHERE shared_with_user_id = $1
  AND owner_user_id = $2
  AND revoked_at IS NULL
LIMIT 1;
