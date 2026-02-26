# Bibliotheque Frontend (React + Vite + TypeScript + Tailwind)

A lightweight UI for the Bibliotheque API. It lets users register, log in with JWT, manage their own books, and use global authors.

## Requirements

- Node.js 18+ and npm
- Backend running (FastAPI): see `server/README.md`
- API base URL (defaults to `http://localhost:8000`)

## Quick Start

1) Install dependencies

```bash
cd client
npm install
```

2) Configure API URL (optional)

```bash
cp .env.example .env

```

3) Run the app (with backend running)

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000 (Swagger at /docs)

4) Production build / preview

```bash
npm run build
npm run preview
```

## How It Works (aligned with API)

- Auth: `AuthForm` calls `/api/users/login` (and register) from the backend, stores the JWT in `localStorage` under `bibliotheque_token`, and sets the Authorization header for future calls.
- User context: After login or when a token already exists, `App` fetches `/api/users/me`, then loads authors and books.
- Books: CRUD hits `/api/books/` (owner-scoped). Backend enforces `owner_id`; token required.
- Authors: CRUD hits `/api/authors/` (global resource). Token required.
- Token rules: JWTs expire in 30 minutes (see backend security); send them via `Authorization: Bearer <token>`.

## Project Structure

```
client/
├── src/
│   ├── api/            # Axios client + endpoints
│   ├── components/     # AuthForm, BookForm, BookList, etc.
│   ├── types.ts        # Shared types aligned with backend schemas
│   ├── App.tsx         # Page layout + data orchestration
│   ├── main.tsx        # React root
│   └── index.css       # Tailwind entry + global styles
├── tailwind.config.ts  # Theme tokens
├── vite.config.ts      # Vite config
└── package.json        # Scripts and deps
```

## Scripts

- `npm run dev`    : Start dev server with HMR
- `npm run build`  : Type-check then build for production
- `npm run preview`: Serve the built app locally

## Environment Variables

- `VITE_API_BASE_URL` (optional): Backend root URL. Defaults to `http://localhost:8000` if unset.

## Backend Notes (from server/README.md)

- Core endpoints: `/api/users/*`, `/api/books/*`, `/api/authors/*` with JWT auth.
- Security: Change `SECRET_KEY`, restrict CORS origins, and serve via HTTPS in production.
- DB: SQLite by default; created automatically on first backend run.

## Troubleshooting

- 401/403: Token missing or expired; log in again.
- Network errors: Confirm backend is running and `VITE_API_BASE_URL` matches.
- CORS: If backend CORS is tightened, add the frontend origin there and restart backend.
- Build issues: Ensure Node.js 18+; rerun `npm install` if deps changed.
