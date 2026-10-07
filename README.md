# LittleCloset

LittleCloset is a full-stack wardrobe management application for organizing children's clothing by category and size. It is multi-user: every signed-in user has their own private wardrobe, categories, and sizes.

It includes AI-assisted clothing recognition and outfit recommendations, with a Go REST API, Next.js frontend, PostgreSQL database, and serverless AI functions.

## Project Highlights

- Full-stack application with Go, Next.js, React, and PostgreSQL
- REST API with database-backed inventory management
- Serverless AI integration using Neon Functions and Microsoft Foundry
- Structured AI image analysis with database-validated categories and sizes
- AI size estimation with explicit `tag` / `estimated` classification
- Weather-aware outfit recommendations using Open-Meteo
- Finnish and English localization
- Multi-user accounts with Neon Auth and Google sign-in (JWT-verified API, per-user data isolation)
- Mobile-first responsive UI with installable PWA

## Live Demo

[LittleCloset on Render](https://little-closet.onrender.com)

> The service may take around one minute to start after a period of inactivity.

## Features

- Multi-user support: sign in with Neon Auth (Google OAuth), with all data scoped to the signed-in user
- Public read-only demo mode at `/demo`, backed by a dedicated Neon Auth user
- Clothing inventory management with user-defined categories, subcategories, and sizes
- Custom size ordering, reordered with up/down controls
- Search and filtering by name, category, and size
- Inventory dashboard and reporting
- Responsive desktop and mobile UI (table on desktop, stacked cards with sort controls on mobile, touch-sized controls)
- Inline form validation and faster repeat entry when adding items
- Account tab with language selection and sign-out
- Privacy policy and terms pages
- Progressive Web App (PWA) with offline support
- AI clothing image analysis
- AI outfit recommendations using live weather data

## AI Features

### Clothing Image Analysis

Users can take or upload a clothing photo when adding an item. The AI analyzes the image and returns:

- Clothing name
- Existing database category
- Existing database size
- Size source: `tag` or `estimated`

The analysis uses the signed-in user's categories and sizes stored in PostgreSQL, allowing the result to map directly to existing inventory records. The detected values are used to pre-fill the inventory form for user review before saving.

### Outfit Recommendations

The outfit recommendation function:

- Reads the signed-in user's wardrobe from PostgreSQL
- Retrieves live weather from Open-Meteo
- Generates an outfit recommendation using a Microsoft Foundry-hosted model
- Returns the result in the user's selected language

## Architecture

```text
Next.js / React ──── Neon Auth (sign-in, JWT)
       │
       │ HTTPS / REST (Bearer token)
       ▼
    Go API (verifies JWT, scopes by user)
       │
   ┌───┴───────────────┐
   │                   │
   ▼                   ▼
PostgreSQL        Neon Functions
                    │
              ┌─────┴─────┐
              │           │
              ▼           ▼
        PostgreSQL    Microsoft Foundry
                          │
                          │
                     Open-Meteo
                     (outfit flow)
```

The Go API verifies the Neon Auth JWT on every request (except `/health` and the session check) and uses the token subject as the user ID for all queries. It handles inventory CRUD operations and routes AI requests to Neon Functions, passing the user ID and a shared secret. The functions access PostgreSQL and, for outfit recommendations, Open-Meteo weather data before calling the AI model.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Serwist (PWA)
- **Backend:** Go, Gin, REST API
- **Auth:** Neon Auth (Better Auth) with Google OAuth, JWT verification via JWKS
- **Database:** PostgreSQL, Neon
- **AI:** Neon Functions, Microsoft Foundry
- **Weather:** Open-Meteo API
- **Deployment:** Render
- **Tooling:** Docker, Git

## Configuration

Copy `.env.example` to `.env`. The root `.env` is the single env file for the whole project: the backend, the frontend (`next.config.ts` loads it from the repo root), and the Neon Functions deployment all read it. Google OAuth is configured in the Neon Auth settings, so it needs no variables here. The backend requires:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEON_AUTH_URL` | Neon Auth base URL, used to fetch the JWKS for JWT verification |
| `DEMO_USER_ID` | Neon Auth user ID whose seeded wardrobe is exposed through the public read-only demo |
| `NEON_FUNCTION_SECRET` | Shared secret between the API and Neon Functions |
| `NEON_GENERATE_OUTFIT_FUNCTION_URL` | Outfit recommendation function URL |
| `NEON_ANALYZE_IMAGE_FUNCTION_URL` | Image analysis function URL |
| `PORT` | API port (default `8080`) |
| `FRONTEND_URL` | Allowed frontend origin (default `http://localhost:3000`) |

The frontend uses `NEON_AUTH_URL` and `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080/api/v1`). The Neon Functions use `FOUNDRY_ENDPOINT`, `FOUNDRY_API_KEY`, `FOUNDRY_DEPLOYMENT`, and `NEON_FUNCTION_SECRET`. Run Neon CLI commands from `neon/` against the root file, for example `neon deploy --env ../.env` and `neon env pull --file ../.env`, so no `.env` is created inside `neon/`.

The `/demo` route is public and read-only. Configure `DEMO_USER_ID` with a dedicated Neon Auth user that has the sample wardrobe data. Demo routes never accept a user ID from the browser and do not expose create, update, delete, or image-analysis operations.

## Project Structure

```text
littlecloset/
├── backend/        # Go API
├── frontend/       # Next.js application
├── migrations/     # Database migrations
├── neon/           # Neon Functions
├── docker-compose.yml
├── README.md
└── .env.example
```

## Status

Active development.

## Future Improvements

- Child-specific profiles within an account
- Clothing image storage
- Inventory history
- Extended analytics
- Additional AI clothing attributes