CREATE TABLE closet_shares (
    id UUID PRIMARY KEY,
    owner_user_id TEXT NOT NULL,
    shared_with_user_id TEXT,
    role TEXT NOT NULL CHECK (role IN ('viewer', 'editor')),
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT closet_shares_not_self
        CHECK (shared_with_user_id IS NULL OR shared_with_user_id <> owner_user_id)
);

CREATE INDEX closet_shares_shared_with_idx
ON closet_shares (shared_with_user_id)
WHERE revoked_at IS NULL;

CREATE INDEX closet_shares_owner_idx
ON closet_shares (owner_user_id)
WHERE revoked_at IS NULL;
