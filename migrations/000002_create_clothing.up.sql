CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sizes (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE clothing_items (
    id UUID PRIMARY KEY,

    name TEXT NOT NULL,

    category_id UUID NOT NULL
        REFERENCES categories(id),

    size_id UUID NOT NULL
        REFERENCES sizes(id),

    quantity INTEGER NOT NULL DEFAULT 0
        CHECK (quantity >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);