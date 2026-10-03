# LittleCloset

LittleCloset is a full-stack wardrobe management application designed for organizing a child's clothing collection by category, size, and quantity. The platform combines a practical inventory workflow with a modern, responsive interface and AI-assisted outfit recommendations.

The project is built with Go, Next.js, React, and PostgreSQL, with deployment using Render and Neon infrastructure. It is structured as a portfolio-ready product that demonstrates both backend systems design and cloud-integrated AI functionality.

## Live Demo

[LittleCloset on Render](https://little-closet.onrender.com)

Note: the service may take around one minute to start after a period of inactivity.

## Core Features

- Inventory tracking for clothing items
- Search by category, size, and quantity
- Add, edit, and remove item records
- Dashboard with inventory overview and basic reporting
- Admin authentication for secure access to editing
- Responsive UI for desktop and mobile use
- AI-powered outfit suggestions based on available wardrobe and live weather

## AI Outfit Recommendation

A key feature of the project is the AI outfit assistant, deployed as a serverless function using Neon Functions.

The workflow is as follows:

- The Neon Function reads the current wardrobe inventory from the database
- It fetches live weather data for the provided location
- It uses an AI model to generate a practical outfit recommendation
- The response is returned in English or Finnish, depending on the user's preference

This feature demonstrates a real-world integration of cloud serverless functions, external APIs, and database-backed AI logic in a production-style application.

## Tech Stack

- Frontend: Next.js, React, TypeScript
- Backend: Go, REST API
- Database: PostgreSQL via Neon
- Serverless AI: Neon Functions + Microsoft Foundry-hosted model
- External data source: Open-Meteo weather API
- Deployment: Render
- Tooling: Docker, Git

## Architecture

```text
┌───────────────────────────────────────┐
│        Next.js / React UI             │
└──────────────────────┬────────────────┘
                       │ HTTPS / REST
                       ▼
┌───────────────────────────────────────┐
│       Go API (inventory services)     │
└──────────────────────┬────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │                               │
       │                               │
       │                               │
       │                               │
       │                               │
       ▼                               ▼
┌──────────────────────┐    ┌────────────────────────────────────┐
│ /ai request path     │    │ Standard CRUD / inventory requests │
└──────────┬───────────┘    └───────────────┬────────────────────┘
           │                                │
           │                                ▼
           │              ┌───────────────────────────────────────┐
           │              │       PostgreSQL (Neon Database)      │
           │              └───────────────────────────────────────┘
           ▼
┌───────────────────────────────────────┐
│         Neon Function                 │
│   outfit recommendation endpoint      │
└──────────────┬────────────────────────┘
               │ reads inventory
               ▼
┌───────────────────────────────────────┐
│       PostgreSQL (Neon Database)      │
└──────────────────────┬────────────────┘
                       │
                       ├───────────────┐
        reads weather  │               │ gets recommendation
                       ▼               ▼
           ┌──────────────────┐  ┌──────────────────────────┐
           │ Open-Meteo API   │  │ Microsoft Foundry /      │
           │ live weather     │  │ GPT 5-mini               │
           └──────────────────┘  └──────────────────────────┘
```

The core application flow remains Go API to PostgreSQL for regular inventory operations. For AI-powered outfit requests, the Go API routes the request to a Neon Function, which queries the wardrobe data in PostgreSQL, fetches live weather from Open-Meteo, and then uses a Microsoft Foundry-hosted model to generate the recommendation.

## Project Structure

```text
littlecloset/
├── backend/        # Go API
├── frontend/       # Next.js application
├── migrations/     # Database migrations
├── neon/           # Neon Functions configuration and AI endpoint
├── docker-compose.yml
├── README.md
└── .env.example
```

## Project Status

The application is currently in active development, with a focus on a stable inventory workflow and the continued expansion of AI-powered product features.

## Future Improvements

- Multi-user support and child-specific profiles
- Clothing image management
- Inventory history and change tracking
- Extended analytics and reporting
- PWA support and offline functionality
