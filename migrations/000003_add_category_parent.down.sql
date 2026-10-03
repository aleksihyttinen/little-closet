DROP INDEX categories_parent_name_key;
DROP INDEX categories_root_name_key;

ALTER TABLE categories
ADD CONSTRAINT categories_name_key UNIQUE (name);

ALTER TABLE categories
DROP CONSTRAINT categories_parent_not_self;

ALTER TABLE categories
DROP COLUMN parent_id;