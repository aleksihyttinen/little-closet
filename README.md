# LittleCloset

LittleCloset is a personal inventory application for managing a baby's clothing collection by **category, size, and quantity**.

The project is built as a full-stack application using **Go, Next.js, React, and PostgreSQL**. The initial version is designed for a single admin user, with the architecture allowing for future expansion.

## Features

* View clothing inventory
* Add, edit, and remove clothing items
* Organize items by category and size
* Track quantities
* Search and filter inventory
* Dashboard with inventory statistics
* Admin authentication
* Responsive UI

## Tech Stack

* **Frontend:** Next.js, React, TypeScript
* **Backend:** Go, REST API
* **Database:** PostgreSQL
* **Development:** Docker, Git

## Architecture

```text
Next.js / React
      │
      │ REST API
      ▼
   Go API
      │
      │ SQL
      ▼
 PostgreSQL
```

## Project Structure

```text
littlecloset/
├── backend/       # Go API
├── frontend/      # Next.js application
├── migrations/    # Database migrations
├── docs/          # Project documentation
└── docker-compose.yml
```

## Status

🚧 **In development**

The current focus is the core inventory functionality and a clean, maintainable full-stack architecture.

## Future Improvements

* Multiple children / users
* Clothing images
* Inventory history
* PWA support
* Additional reporting and statistics
