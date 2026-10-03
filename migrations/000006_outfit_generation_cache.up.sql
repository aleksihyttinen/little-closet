CREATE TABLE outfit_generation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('en', 'fi')),

    wardrobe_updated_at TIMESTAMPTZ NOT NULL,

    outfit TEXT NOT NULL,
    weather JSONB NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (latitude, longitude, language)
);