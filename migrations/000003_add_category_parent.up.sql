ALTER TABLE categories
ADD COLUMN parent_id UUID REFERENCES categories(id);

ALTER TABLE categories
ADD CONSTRAINT categories_parent_not_self
CHECK (parent_id IS NULL OR parent_id <> id);

ALTER TABLE categories
DROP CONSTRAINT categories_name_key;

CREATE UNIQUE INDEX categories_root_name_key
ON categories (name)
WHERE parent_id IS NULL;

CREATE UNIQUE INDEX categories_parent_name_key
ON categories (parent_id, name)
WHERE parent_id IS NOT NULL;