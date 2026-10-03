BEGIN;

ALTER TABLE clothing_items
    ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

INSERT INTO categories (id, name) VALUES
    ('11111111-1111-4111-8111-111111111111', 'Bodysuits'),
    ('22222222-2222-4222-8222-222222222222', 'Tops'),
    ('33333333-3333-4333-8333-333333333333', 'Bottoms'),
    ('44444444-4444-4444-8444-444444444444', 'Dresses'),
    ('55555555-5555-4555-8555-555555555555', 'Outerwear'),
    ('66666666-6666-4666-8666-666666666666', 'Sleepwear'),
    ('77777777-7777-4777-8777-777777777777', 'Footwear'),
    ('88888888-8888-4888-8888-888888888888', 'Sets'),
    ('99999999-9999-4999-8999-999999999999', 'Accessories'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Swimwear')
ON CONFLICT (name) DO NOTHING;

INSERT INTO sizes (id, name, sort_order) VALUES
    ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Newborn', 1),
    ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '0-3M', 2),
    ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '3-6M', 3),
    ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '6-12M', 4),
    ('ffffffff-ffff-4fff-8fff-ffffffffffff', '12-18M', 5),
    ('12121212-1212-4121-8121-121212121212', '18-24M', 6),
    ('13131313-1313-4131-8131-131313131313', '2T', 7),
    ('14141414-1414-4141-8141-141414141414', '3T', 8),
    ('15151515-1515-4151-8151-151515151515', '4T', 9),
    ('16161616-1616-4161-8161-161616161616', '5T', 10)
ON CONFLICT (name) DO NOTHING;

INSERT INTO clothing_items (id, name, category_id, size_id, quantity, description) VALUES
    ('1a1a1a1a-1a1a-41a1-81a1-1a1a1a1a1a1a', 'Cotton Bodysuit', (SELECT id FROM categories WHERE name = 'Bodysuits'), (SELECT id FROM sizes WHERE name = '0-3M'), 4, 'Soft cotton bodysuit with snap closures and a stretchy neckline for easy dressing and all-day comfort.'),
    ('2b2b2b2b-2b2b-42b2-82b2-2b2b2b2b2b2b', 'Ribbed Long Sleeve Tee', (SELECT id FROM categories WHERE name = 'Tops'), (SELECT id FROM sizes WHERE name = '3-6M'), 3, 'A warm ribbed long-sleeve top with a relaxed fit that layers perfectly under jackets or sweaters.'),
    ('3c3c3c3c-3c3c-43c3-83c3-3c3c3c3c3c3c', 'Denim Overalls', (SELECT id FROM categories WHERE name = 'Bottoms'), (SELECT id FROM sizes WHERE name = '12-18M'), 2, 'Classic denim overalls with soft lining and adjustable straps for everyday play and easy movement.'),
    ('4d4d4d4d-4d4d-44d4-84d4-4d4d4d4d4d4d', 'Puff Sleeve Dress', (SELECT id FROM categories WHERE name = 'Dresses'), (SELECT id FROM sizes WHERE name = '18-24M'), 2, 'A sweet puff-sleeve dress with a twirly skirt and gentle cotton blend ideal for special occasions.'),
    ('5e5e5e5e-5e5e-45e5-85e5-5e5e5e5e5e5e', 'Soft Knit Cardigan', (SELECT id FROM categories WHERE name = 'Outerwear'), (SELECT id FROM sizes WHERE name = '6-12M'), 5, 'Lightweight cardigan with cozy knit texture and button front for easy layering through cool mornings.'),
    ('6f6f6f6f-6f6f-46f6-86f6-6f6f6f6f6f6f', 'Zip Front Pajama Set', (SELECT id FROM categories WHERE name = 'Sleepwear'), (SELECT id FROM sizes WHERE name = '2T'), 3, 'A soft zip-front pajama set that keeps bedtime comfortable and easy with snap-free sides.'),
    ('7a7a7a7a-7a7a-47a7-87a7-7a7a7a7a7a7a', 'Velcro Sneakers', (SELECT id FROM categories WHERE name = 'Footwear'), (SELECT id FROM sizes WHERE name = '12-18M'), 4, 'Flexible little sneakers with velcro straps and grippy soles for confident walking and toddling.'),
    ('8b8b8b8b-8b8b-48b8-88b8-8b8b8b8b8b8b', 'Striped Tee', (SELECT id FROM categories WHERE name = 'Tops'), (SELECT id FROM sizes WHERE name = '18-24M'), 4, 'A casual striped tee in a breathable cotton blend that pairs easily with pants or skirts.'),
    ('9c9c9c9c-9c9c-49c9-89c9-9c9c9c9c9c9c', 'Corduroy Pants', (SELECT id FROM categories WHERE name = 'Bottoms'), (SELECT id FROM sizes WHERE name = '3T'), 3, 'Durable corduroy pants with a soft stretch waist and a cozy texture made for everyday wear.'),
    ('0d0d0d0d-0d0d-40d0-80d0-0d0d0d0d0d0d', 'Floral Romper', (SELECT id FROM categories WHERE name = 'Sets'), (SELECT id FROM sizes WHERE name = '6-12M'), 2, 'A cheerful floral romper with an easy snap closure and full-length comfort for daytime adventures.'),
    ('11e1e1e1-e1e1-41e1-81e1-1e1e1e1e1e1e', 'Fleece Hoodie', (SELECT id FROM categories WHERE name = 'Outerwear'), (SELECT id FROM sizes WHERE name = '4T'), 2, 'A cozy fleece hoodie with a roomy hood and soft lining perfect for cool outdoor play.'),
    ('22f2f2f2-f2f2-42f2-82f2-2f2f2f2f2f2f', 'Cotton Shorts', (SELECT id FROM categories WHERE name = 'Bottoms'), (SELECT id FROM sizes WHERE name = '3T'), 5, 'Breathable cotton shorts with an elastic waist and playful cut for warm-weather comfort.'),
    ('33a3a3a3-a3a3-43a3-83a3-3a3a3a3a3a3a', 'Knit Hat', (SELECT id FROM categories WHERE name = 'Accessories'), (SELECT id FROM sizes WHERE name = '12-18M'), 6, 'A soft knit cap that stays snug on cooler days without feeling scratchy against delicate skin.'),
    ('44b4b4b4-b4b4-44b4-84b4-4b4b4b4b4b4b', 'Button Down Shirt', (SELECT id FROM categories WHERE name = 'Tops'), (SELECT id FROM sizes WHERE name = '5T'), 3, 'A crisp button-down shirt with a relaxed fit and soft fabric for easy layering and tidy looks.'),
    ('55c5c5c5-c5c5-45c5-85c5-5c5c5c5c5c5c', 'Lightweight Swimsuit', (SELECT id FROM categories WHERE name = 'Swimwear'), (SELECT id FROM sizes WHERE name = '2T'), 2, 'Quick-drying swimsuit with a soft lining and easy stretch for pool days and sunny outings.'),
    ('66d6d6d6-d6d6-46d6-86d6-6d6d6d6d6d6d', 'Wool Blend Vest', (SELECT id FROM categories WHERE name = 'Outerwear'), (SELECT id FROM sizes WHERE name = '3T'), 1, 'A lightly insulated vest in a cozy wool blend that adds warmth without restricting little arms.'),
    ('77e7e7e7-e7e7-47e7-87e7-7e7e7e7e7e7e', 'Stretch Leggings', (SELECT id FROM categories WHERE name = 'Bottoms'), (SELECT id FROM sizes WHERE name = '0-3M'), 6, 'High-stretch leggings with a soft waistband and smooth cotton feel for movement and comfort.'),
    ('88f8f8f8-f8f8-48f8-88f8-8f8f8f8f8f8f', 'Plaid Pajama Bottoms', (SELECT id FROM categories WHERE name = 'Sleepwear'), (SELECT id FROM sizes WHERE name = '6-12M'), 4, 'Cozy plaid pajama bottoms with elastic waist and soft brushed fabric for restful nights.'),
    ('99a9a9a9-a9a9-49a9-89a9-9a9a9a9a9a9a', 'Light Wash Jeans', (SELECT id FROM categories WHERE name = 'Bottoms'), (SELECT id FROM sizes WHERE name = '4T'), 2, 'Classic light-wash jeans with a soft waistband and sturdy construction for active days.'),
    ('a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1', 'Little Boots', (SELECT id FROM categories WHERE name = 'Footwear'), (SELECT id FROM sizes WHERE name = '18-24M'), 1, 'Soft little boots with a flexible sole and cushioned insole for easy steps and playful walking.')
ON CONFLICT (id) DO NOTHING;

COMMIT;
