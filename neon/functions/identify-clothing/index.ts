import { Hono } from 'hono';
import { attachDatabasePool } from '@neon/functions';
import { Pool } from 'pg';
import OpenAI from 'openai';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
});

attachDatabasePool(pool);

const openai = new OpenAI({
    baseURL: process.env.FOUNDRY_ENDPOINT,
    apiKey: process.env.FOUNDRY_API_KEY,
});

const app = new Hono();

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

app.post('/', async (c) => {
    try {
        const form = await c.req.formData();

        const image = form.get('image');
        const languageValue = form.get('language') || 'en';

        if (!(image instanceof File)) {
            return c.json(
                {
                    error:
                        'Missing image. Send the image as multipart/form-data field "image".',
                },
                400,
            );
        }

        if (languageValue !== 'en' && languageValue !== 'fi') {
            return c.json(
                {
                    error: 'language must be either "en" or "fi".',
                },
                400,
            );
        }

        const language = languageValue as 'en' | 'fi';

        if (!image.type.startsWith('image/')) {
            return c.json(
                {
                    error: 'The uploaded file must be an image.',
                },
                400,
            );
        }

        if (image.size > MAX_IMAGE_SIZE) {
            return c.json(
                {
                    error: 'Image must be smaller than 4 MB.',
                },
                413,
            );
        }

        const { rows: categories } = await pool.query<{
            id: string;
            name: string;
            parent_id: string | null;
        }>(`
            SELECT
                c.id,
                c.name,
                c.parent_id
            FROM categories c
            ORDER BY c.name;
        `);

        const { rows: sizes } = await pool.query<{
            id: string;
            name: string;
        }>(`
            SELECT
                s.id,
                s.name
            FROM sizes s
            ORDER BY s.sort_order, s.name;
        `);

        if (categories.length === 0) {
            return c.json(
                {
                    error: 'No categories configured in the database.',
                },
                500,
            );
        }

        if (sizes.length === 0) {
            return c.json(
                {
                    error: 'No sizes configured in the database.',
                },
                500,
            );
        }

        const imageBuffer = Buffer.from(await image.arrayBuffer());
        const imageBase64 = imageBuffer.toString('base64');
        const imageDataUrl = `data:${image.type};base64,${imageBase64}`;

        const categoryList = categories
            .map(
                (category) =>
                    `- id: ${category.id}, name: ${category.name}, parent_id: ${category.parent_id ?? 'null'
                    }`,
            )
            .join('\n');

        const sizeList = sizes
            .map((size) => `- id: ${size.id}, name: ${size.name}`)
            .join('\n');

        const languageInstruction =
            language === 'fi'
                ? 'Return the descriptive clothing name in Finnish.'
                : 'Return the descriptive clothing name in English.';
        const response = await openai.responses.create({
            model: process.env.FOUNDRY_DEPLOYMENT!,

            instructions: `
You classify baby and children's clothing from an image.

Return exactly these fields:

1. name
   - Create a **short, natural product name** for the garment.
   - Include the **garment type** and **up to 2 important visible characteristics**.
   - Prefer characteristics in this order:
     1. distinctive pattern or print
     2. main color
     3. sleeve length, if useful for identifying the garment
     4. hood, buttons, zipper, or other distinctive feature
   - **Keep the name to 2-5 words whenever possible. Never exceed 6 words.**
   - Do not list every visible detail.
   - Do not include the child's gender, age, or size unless it is necessary to identify the garment.
   - Do not invent brand names or details that cannot be seen.
   - Examples:
     - "Pink striped hoodie"
     - "Blue denim jacket"
     - "White floral dress"
     - "Red long-sleeve shirt"
     - "Black joggers"
   - ${languageInstruction}

2. size_id
   - First inspect the image carefully for a visible size label or tag.
   - If a readable size is visible, select the matching size from the
     supplied database sizes.
   - If no readable size is visible, estimate the most appropriate size
     from the supplied database sizes.
   - Never invent a size_id.
   - You MUST return one of the supplied database size IDs.

3. size_source
   - Return "tag" if the size was read from a visible clothing tag.
   - Return "estimated" if the size was estimated from the appearance
     of the garment.

4. category_id
   - Select exactly ONE category from the supplied database categories.
   - Never invent a category.
   - You MUST return one of the supplied database category IDs.
   - Choose the most specific matching category available.
   - The category must be appropriate for the actual garment shown.

Important:
- Carefully inspect visible clothing tags before estimating size.
- Do not infer an exact numeric size from appearance alone.
- If an exact size cannot be read, choose the best available size from
  the supplied database sizes.
- If the item is ambiguous, choose the most likely category.
- Keep the name short. **Do not turn the name into a full description.**
- Do not return explanations, confidence scores, or extra fields.

Available database categories:
${categoryList}

Available database sizes:
${sizeList}
            `.trim(),

            input: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'input_text',
                            text: 'Analyze this baby clothing item.',
                        },
                        {
                            type: 'input_image',
                            image_url: imageDataUrl,
                            detail: 'high',
                        },
                    ],
                },
            ],

            text: {
                format: {
                    type: 'json_schema',
                    name: 'baby_clothing_classification',
                    strict: true,
                    schema: {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            name: {
                                type: 'string',
                            },
                            size_id: {
                                type: 'string',
                            },
                            size_source: {
                                type: 'string',
                                enum: ['tag', 'estimated'],
                            },
                            category_id: {
                                type: 'string',
                            },
                        },
                        required: [
                            'name',
                            'size_id',
                            'size_source',
                            'category_id',
                        ],
                    },
                },
            },
        });

        const result = JSON.parse(response.output_text) as {
            name: string;
            size_id: string;
            size_source: 'tag' | 'estimated';
            category_id: string;
        };
        console.log("analyze-image: model response", result);
        const category = categories.find(
            (category) =>
                String(category.id) === String(result.category_id),
        );

        const size = sizes.find(
            (size) => String(size.id) === String(result.size_id),
        );

        if (!category || !size) {
            return c.json(
                {
                    error: 'Model returned an invalid category or size.',
                },
                500,
            );
        }

        return c.json({
            name: result.name,
            size_source: result.size_source,
            size: {
                id: size.id,
                name: size.name,
            },
            category: {
                id: category.id,
                name: category.name,
                parent_id: category.parent_id,
            },
        });
    } catch (error) {
        console.error("analyze-image failed:", error);

        return c.json(
            {
                error: "failed to analyze image",
            },
            500,
        );
    }
});

export default app;