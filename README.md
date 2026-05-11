# Furni Express Storefront

Full-stack e-commerce storefront built with Express, SQLite, and static HTML pages. The project follows a simple layered architecture so each responsibility stays isolated: routes handle HTTP, controllers shape requests and responses, services hold business logic, repositories store data-access logic, and `data/` contains the local persistence layer.

## Architecture

The application starts in `server.js`, loads environment variables with `dotenv`, initializes the SQLite database, and mounts the API and static-page routes.

Request flow:

1. `routes/` maps URLs to controller functions.
2. `controllers/` validate input and translate service results into HTTP responses.
3. `services/` contain the business rules for authentication, checkout, registration, and product operations.
4. `repositories/` read and write the JSON-backed data stores.
5. `data/` manages the SQLite database used for orders.

### Folder map

- `controllers/`: request handlers for auth, checkout, products, and registration.
- `routes/`: Express route definitions for API endpoints.
- `services/`: business logic and validation rules.
- `repositories/`: persistence access for users, products, and orders.
- `data/`: SQLite helpers and JSON data files.
- `css/`, `js/`, `images/`: frontend assets for the storefront pages.
- `*.html`: static storefront pages served directly by Express.

## Environment Variables

Copy `.env.example` to `.env` and keep real secrets out of version control.

Required or recommended variables:

- `PORT`: server port. Defaults to `3000`.
- `JWT_SECRET`: secret used to sign login tokens.
- `SQLITE_DB_PATH`: optional custom path for the SQLite database file.

Example `.env`:

```env
PORT=3000
JWT_SECRET=change_this_to_a_long_random_secret
SQLITE_DB_PATH=./store.db
```

## Local Setup

1. Install dependencies with `npm install`.
2. Create a `.env` file from `.env.example`.
3. Start the app with `npm start`.

## What the app does

- Serves a storefront UI at the root route and static HTML pages like `/shop.html` and `/contact.html`.
- Exposes API endpoints for products, login, registration, and checkout.
- Stores orders in SQLite and keeps user/product seed data in JSON files.
- Issues JWTs for authenticated sessions.

## Technical Highlights

- Express for routing and middleware.
- SQLite via Node's built-in `node:sqlite` module.
- Password hashing with `bcrypt`.
- Authentication tokens with `jsonwebtoken`.
- Environment-based configuration with `dotenv`.

## Notes for Employers

This project shows a separation of concerns between presentation, routing, business logic, and persistence. It is structured so the storefront can be extended with a real database, stronger auth flows, and a frontend framework without rewriting the whole backend.

## Suggested Improvements

- Replace JSON-backed repositories with a dedicated database layer for users and products.
- Add automated tests for controllers, services, and repositories.
- Add input validation middleware for API requests.
- Add deployment-specific environment variables for production.