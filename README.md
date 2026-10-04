# LittleCloset

LittleCloset is a full-stack wardrobe management application for organizing children's clothing by category, size, and quantity.

It includes AI-assisted clothing recognition and outfit recommendations, with a Go REST API, Next.js frontend, PostgreSQL database, and serverless AI functions.

## Project Highlights

- Full-stack application with Go, Next.js, React, and PostgreSQL
- REST API with database-backed inventory management
- Serverless AI integration using Neon Functions and Microsoft Foundry
- Structured AI image analysis with database-validated categories and sizes
- AI size estimation with explicit `tag` / `estimated` classification
- Weather-aware outfit recommendations using Open-Meteo
- Finnish and English localization
- Responsive UI with admin authentication

## Live Demo

[LittleCloset on Render](https://little-closet.onrender.com)

> The service may take around one minute to start after a period of inactivity.

## Features

- Clothing inventory management
- Search and filtering by name, category, and size
- Inventory dashboard and reporting
- Responsive desktop and mobile UI
- AI clothing image analysis
- AI outfit recommendations using live weather data

## AI Features

### Clothing Image Analysis

Users can take or upload a clothing photo when adding an item. The AI analyzes the image and returns:

- Clothing name
- Existing database category
- Existing database size
- Size source: `tag` or `estimated`

The analysis uses the categories and sizes stored in PostgreSQL, allowing the result to map directly to existing inventory records. The detected values are used to pre-fill the inventory form for user review before saving.

### Outfit Recommendations

The outfit recommendation function:

- Reads the current wardrobe from PostgreSQL
- Retrieves live weather from Open-Meteo
- Generates an outfit recommendation using a Microsoft Foundry-hosted model
- Returns the result in the user's selected language

## Architecture

```text
Next.js / React
       │
       │ HTTPS / REST
       ▼
    Go API
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

The Go API handles standard inventory CRUD operations and routes AI requests to Neon Functions. The functions access PostgreSQL and, for outfit recommendations, Open-Meteo weather data before calling the AI model.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend:** Go, Gin, REST API
- **Database:** PostgreSQL, Neon
- **AI:** Neon Functions, Microsoft Foundry
- **Weather:** Open-Meteo API
- **Deployment:** Render
- **Tooling:** Docker, Git

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

- Multi-user support and child-specific profiles
- Clothing image storage
- Inventory history
- Extended analytics
- PWA and offline support
- Additional AI clothing attributes