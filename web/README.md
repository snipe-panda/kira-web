# Kira — frontend (`web/`)

React 19 + Vite + Tailwind v4 SPA for the Kira product-studio flow.

## Run (dev)
```bash
npm install
npm run dev        # http://localhost:5173, proxies /api → :8000
```
Start the API separately (see ../README.md) so `/api/*` resolves.

## Scripts
| Command | Does |
|---|---|
| `npm run dev` | Vite dev server + HMR |
| `npm run build` | typecheck (`tsc -b`) + production build → `dist/` |
| `npm run preview` | serve the production build locally |
| `npm run lint` | ESLint |

## Layout
```
src/
├── App.tsx            # shell: provider + header + stepper + stage switch
├── store.tsx         # KiraProvider context (flow state) + useKira
├── lib/              # api.ts (typed fetch client), types.ts
├── stages/           # UploadStage, IdentifyStage, EnhanceStage, PlaceStage
└── components/       # BrandHeader, Stepper, Dropzone, icons, ui.tsx primitives
```

## Design system
Tokens are Tailwind v4 CSS-first (`@theme` in `src/index.css`) — colours, fonts,
radii all map to utilities. See [`../DESIGN.md`](../DESIGN.md) for tokens,
responsive strategy, and accessibility decisions, and
[`../ARCHITECTURE.md`](../ARCHITECTURE.md) for the state flow and API contract.
