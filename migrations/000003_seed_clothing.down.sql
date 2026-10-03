BEGIN;

DELETE FROM clothing_items
WHERE id IN (
    '1a1a1a1a-1a1a-41a1-81a1-1a1a1a1a1a1a',
    '2b2b2b2b-2b2b-42b2-82b2-2b2b2b2b2b2b',
    '3c3c3c3c-3c3c-43c3-83c3-3c3c3c3c3c3c',
    '4d4d4d4d-4d4d-44d4-84d4-4d4d4d4d4d4d',
    '5e5e5e5e-5e5e-45e5-85e5-5e5e5e5e5e5e',
    '6f6f6f6f-6f6f-46f6-86f6-6f6f6f6f6f6f',
    '7a7a7a7a-7a7a-47a7-87a7-7a7a7a7a7a7a',
    '8b8b8b8b-8b8b-48b8-88b8-8b8b8b8b8b8b',
    '9c9c9c9c-9c9c-49c9-89c9-9c9c9c9c9c9c',
    '0d0d0d0d-0d0d-40d0-80d0-0d0d0d0d0d0d',
    '11e1e1e1-e1e1-41e1-81e1-1e1e1e1e1e1e',
    '22f2f2f2-f2f2-42f2-82f2-2f2f2f2f2f2f',
    '33a3a3a3-a3a3-43a3-83a3-3a3a3a3a3a3a',
    '44b4b4b4-b4b4-44b4-84b4-4b4b4b4b4b4b',
    '55c5c5c5-c5c5-45c5-85c5-5c5c5c5c5c5c',
    '66d6d6d6-d6d6-46d6-86d6-6d6d6d6d6d6d',
    '77e7e7e7-e7e7-47e7-87e7-7e7e7e7e7e7e',
    '88f8f8f8-f8f8-48f8-88f8-8f8f8f8f8f8f',
    '99a9a9a9-a9a9-49a9-89a9-9a9a9a9a9a9a',
    'a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1'
);

DELETE FROM categories WHERE name IN (
    'Bodysuits', 'Tops', 'Bottoms', 'Dresses', 'Outerwear',
    'Sleepwear', 'Footwear', 'Sets', 'Accessories', 'Swimwear'
);

DELETE FROM sizes WHERE name IN (
    'Newborn', '0-3M', '3-6M', '6-12M', '12-18M', '18-24M',
    '2T', '3T', '4T', '5T'
);

ALTER TABLE clothing_items DROP COLUMN IF EXISTS description;

COMMIT;
