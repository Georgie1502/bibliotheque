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

## Ladle Stories

- Launch: `npm run ladle` (opens on http://localhost:61000 by default); stop with Ctrl+C in the terminal.
- Build/preview: `npm run ladle:build` produces static stories, `npm run ladle:preview` serves the build; use for CI artifacts or sharing static snapshots.
- Locations: stories live in `src/stories` and mirror core components (AuthForm, AuthorForm, AuthorList, BookDetail, BookForm, BookList). Shared styles/providers are applied via [.ladle/components.tsx](.ladle/components.tsx) which wraps stories with the app background and imports `src/index.css`.
- Backend-free runs: existing stories stub data and callbacks (console logging, simulated latency) so they work without the API. To exercise real calls, wire the callbacks to `api/client` helpers and set `VITE_API_BASE_URL` to your backend.
- Existing scenarios:
	- AuthForm: Default; CustomCallback (custom token handling)
	- AuthorForm: Default; ErrorState (throws on submit)
	- AuthorList: Default; Empty
	- BookDetail: SelectedBook (update/delete hooks); NoSelection
	- BookForm: Default; NoAuthors
	- BookList: Default (filter/select state); EmptyState
- Troubleshooting: if port 61000 is busy, run `npm run ladle -- --port 61001`; for HMR glitches, restart the Ladle process; if styles vanish, ensure `.ladle/components.tsx` still imports `src/index.css`; stale UI issues often clear by hard-refreshing the browser cache. Open issues/PRs for new story requests or add a new file under `src/stories` following the existing patterns.

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
