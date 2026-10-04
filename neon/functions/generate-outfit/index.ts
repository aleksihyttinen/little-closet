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

app.post('/', async (c) => {
  // Get location and language from the request
  const body = await c.req.json<{
    latitude: number;
    longitude: number;
    language: 'en' | 'fi';
  }>();

  const { latitude, longitude, language } = body;

  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number'
  ) {
    return c.json(
      { error: 'latitude and longitude are required' },
      400,
    );
  }

  if (language !== 'en' && language !== 'fi') {
    return c.json(
      { error: 'language must be en or fi' },
      400,
    );
  }

  // Get the entire available wardrobe
  const { rows } = await pool.query(`
    SELECT
      ci.id,
      ci.name,
      c.name AS category,
      s.name AS size,
      ci.quantity
    FROM clothing_items ci
    JOIN categories c ON c.id = ci.category_id
    JOIN sizes s ON s.id = ci.size_id
    WHERE ci.quantity > 0
    ORDER BY c.name, ci.name;
  `);

  // Get current weather
  const weatherUrl = new URL(
    'https://api.open-meteo.com/v1/forecast',
  );

  weatherUrl.searchParams.set('latitude', String(latitude));
  weatherUrl.searchParams.set('longitude', String(longitude));

  weatherUrl.searchParams.set(
    'current',
    [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_gusts_10m',
    ].join(','),
  );

  weatherUrl.searchParams.set('timezone', 'auto');

  const weatherResponse = await fetch(weatherUrl);

  if (!weatherResponse.ok) {
    return c.json(
      { error: 'Failed to fetch weather' },
      502,
    );
  }

  const weather = await weatherResponse.json();

  const wardrobe = rows
    .map(
      (item) =>
        `- ${item.name} | category: ${item.category} | size: ${item.size} | quantity: ${item.quantity}`,
    )
    .join('\n');

  const response = await openai.responses.create({
    model: process.env.FOUNDRY_DEPLOYMENT!,
    instructions: `
You are a personal wardrobe assistant for a parent choosing an outfit for their baby.

Choose exactly ONE practical outfit for the current weather.

Rules:
- Use ONLY items from the available wardrobe.
- NEVER invent items.
- NEVER do web searches or guess missing weather data.
- Keep weather tips separate. They may mention non-wardrobe items such as an umbrella, stroller rain cover, or wind cover.
- Respond entirely in ${language === 'fi' ? 'Finnish' : 'English'}.
- Be concise.

Use exactly this format:

1) **Pue päälle / What to wear:** [outfit]

2) **Miksi / Why:** [brief weather-based explanation]

3) **Säävinkki / Weather tip:** [separate practical weather tip]
`,
    input: `
Current weather:
${JSON.stringify(weather.current, null, 2)}

Available wardrobe:
${wardrobe}
`,
  });

  return c.json({
    outfit: response.output_text,
    weather: {
      current: weather.current,
    },
  });
});

export default app;