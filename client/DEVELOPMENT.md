# Development Guide for Bibliotheque Frontend (React + Vite + TS + Tailwind)

## Quick Start

1) Install dependencies

```bash
cd client
npm install
```

2) Configure API base URL (optional if you keep localhost:8000)

- Copy the example env and adjust if needed:

```bash
cp .env.example .env
```

- `VITE_API_BASE_URL` defaults to `http://localhost:8000` if unset.

3) Run dev server (hot reload)

```bash
npm run dev
```

The app serves on `http://localhost:5173` by default. API calls go to `VITE_API_BASE_URL`.

4) Build for production

```bash
npm run build
```

Build output in `dist/`.

## Project Structure

```
client/
├── src/
│   ├── api/            # Axios client + endpoints
│   ├── components/     # UI components (AuthForm, BookForm, BookList, etc.)
│   ├── types.ts        # Shared TypeScript types
│   ├── App.tsx         # Main app layout and state orchestration
│   ├── main.tsx        # React root
│   └── index.css       # Global styles & Tailwind entry
├── public/ (none by default)
├── index.html          # Vite entry
├── vite.config.ts      # Vite config
├── tailwind.config.ts  # Tailwind config
├── postcss.config.js   # PostCSS config
├── tsconfig*.json      # TypeScript configs
└── package.json        # Scripts and dependencies
```

## Core Flows

- Auth: `AuthForm` hits `/api/users/login` (and register if needed), stores JWT in `localStorage` under `bibliotheque_token`, and sets Authorization header via `setAuthToken`.
- Bootstrap: On login or existing token, `App` fetches user (`/api/users/me`), authors, and books.
- Books: CRUD via `/api/books/`; ownership is per user (backend enforces owner_id).
- Authors: Global resource via `/api/authors/`; form creates, lists are fetched and used for book association.

## Environment Variables

- `VITE_API_BASE_URL`: API root (default `http://localhost:8000`). Set in `.env` for Vite to inject at build time.

## Useful Scripts

- `npm run dev`    : start dev server with HMR
- `npm run build`  : production build
- `npm run preview`: preview the production build locally

## Styling

- Tailwind is enabled; globals in `src/index.css` set base colors and font (Space Grotesk).
- Theme tokens in `tailwind.config.ts` (colors, shadows, fonts).

## Troubleshooting

- PostCSS ESM error: ensure `postcss.config.js` uses `export default { ... }`.
- Missing API responses: verify backend at `http://localhost:8000` and JWT token validity; check browser console/network.
- CORS: backend currently allows all origins in dev; if changed, align `allow_origins` with frontend origin.

## Next Steps (optional)

- Add toasts for success/error instead of inline text.
- Add pagination/filters tied to backend `skip/limit`.
- Add optimistic UI for book edits.
- Introduce state management (React Query/Zustand) if the app grows.
