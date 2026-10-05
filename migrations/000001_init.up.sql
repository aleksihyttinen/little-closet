CREATE TABLE categories (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, id),
    CONSTRAINT categories_parent_not_self CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE UNIQUE INDEX categories_root_name_key
ON categories (user_id, name)
WHERE parent_id IS NULL;

CREATE UNIQUE INDEX categories_parent_name_key
ON categories (user_id, parent_id, name)
WHERE parent_id IS NOT NULL;

CREATE TABLE sizes (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (user_id, name),
    UNIQUE (user_id, id)
);

CREATE TABLE clothing_items (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category_id UUID NOT NULL,
    size_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id, category_id) REFERENCES categories (user_id, id),
    FOREIGN KEY (user_id, size_id) REFERENCES sizes (user_id, id)
);

CREATE INDEX clothing_items_user_id_idx ON clothing_items (user_id);

CREATE TABLE outfit_generation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('en', 'fi')),
    wardrobe_updated_at TIMESTAMPTZ NOT NULL,
    outfit TEXT NOT NULL,
    weather JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, latitude, longitude, language)
);
