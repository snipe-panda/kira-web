# ARCHITECTURE — Kira Web

Two tiers, one repo. A FastAPI backend wraps the AI pipeline; a React/Vite
frontend owns the four-stage flow. In production both are served by a single
process (FastAPI serves the built SPA), so there is no CORS and one URL.

```
┌──────────────────────────────────────────┐        ┌────────────────────────────┐
│ web/  React + Vite + Tailwind (SPA)       │        │ api/  FastAPI               │
│  • 4-stage flow, client-held state        │  /api  │  • thin endpoints           │
│  • Kira design system (Tailwind @theme)   │ ─────► │  • image resize + dispatch  │
│  • calls same-origin /api/*               │ ◄───── │  • → pipeline modules       │
└──────────────────────────────────────────┘  JSON  └──────────────┬─────────────┘
                                                                    │
                          image_pipeline.py (gpt-image-2)  ◄────────┤
                          vision.py (GPT-4o)               ◄────────┤
                          prompts.py · utils.py            ◄────────┘
```

## Backend (`api/`)

A thin HTTP layer — it parses the request, resizes the image, calls the right
pipeline function, and shapes the JSON. Pipeline errors map to HTTP 502.

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/health` | — | `{status, model}` |
| POST | `/api/recognize` | multipart `file` | recognition JSON |
| POST | `/api/enhance` | multipart `file`, `product_context`, `adjustment` | `{images: [b64]}` |
| POST | `/api/placements` | JSON `{product_context, style_register}` | `{placements: [...]}` |
| POST | `/api/place` | multipart `file`, `scene_prompt`, `product_context` | `{images: [b64]}` |

- **Stateless.** The client re-sends the image + confirmed context on each call;
  the server keeps nothing between requests.
- **`image_pipeline.py`, `vision.py`, `prompts.py`, `utils.py`** are carried
  over unchanged from the Streamlit builds (no web dependency). The image model
  is locked to **gpt-image-2 / medium / 1024×1024**.
- **Single-origin serving.** When `web/dist` exists, `main.py` mounts it at `/`
  via `StaticFiles(html=True)`. API routes are registered first, so they win;
  everything else falls back to the SPA. In dev (no `dist`) Vite serves the UI
  and proxies `/api` → `:8000`.

## Frontend (`web/src/`)

```
src/
├── App.tsx              # shell: provider + header + stepper + stage switch
├── store.tsx           # KiraProvider context — the whole flow state + goto/reset
├── lib/
│   ├── api.ts          # typed fetch client (errors surfaced from {error})
│   └── types.ts        # Stage, ProductContext, Recognition, Placement
├── stages/             # one component per stage
│   ├── UploadStage     # hero + dropzone + preview
│   ├── IdentifyStage   # auto-recognise → editable form
│   ├── EnhanceStage    # auto-render → before/after + refine
│   └── PlaceStage      # style register + 10 cards → generate
└── components/
    ├── BrandHeader · Stepper · Dropzone · icons
    └── ui.tsx          # Button, StageHeader, ImageFrame, ImageSkeleton,
                        #   Spinner, Note, ErrorBanner, Tag, downloadB64, SPIN
```

### State flow
All flow state lives in one React context (`KiraProvider` / `useKira`):
`stage`, `file`, `recognition`, `productContext`, `enhanceResult`, `adjustment`,
`styleRegister`, `placements`, `selectedPlacement`, `placementResult`. Stages
read/write it and call `goto(stage)`; `reset()` clears everything.

### Stage flow
```
upload ──Continue──► identify ──Continue──► enhance ──Browse──► place
   │  (sets file)      │ (auto GPT-4o,        │ (auto gpt-image-2,   │ (style register,
   │                   │  edit, save context) │  before/after,refine)│  10 cards, generate)
   └───────────────────┴──────────── reset ◄──┴──────────────────────┘
```

### Why a StrictMode ref-guard
Stages auto-run their API call on entry via `useEffect`. React 19 StrictMode
double-invokes effects in dev, which would **double-spend** on the expensive
gpt-image-2 calls. Each stage guards with a `useRef(false)` flag so the call
fires once; explicit re-runs (buttons) call the runner directly.

### Image handling
Uploaded files are sent as-is (the server resizes). Generated images come back
as base64 and render via `data:image/png;base64,…`. Downloads use a synthetic
`<a download>` from the same data URL. `ImageFrame` reserves a square slot so
images don't shift layout on decode; `ImageSkeleton` holds that footprint while
a render is in flight.

## Deploy
Single Docker image (`Dockerfile`): stage 1 builds `web/dist` with Node, stage 2
runs `uvicorn` serving the API + that `dist`. `render.yaml` is a Render blueprint
(health check `/api/health`, `OPENAI_API_KEY` as an unsynced secret). See README.

## Known seams
- `prompts.py` + pipeline modules are **copied** into three repos (dev, demo,
  kira-web) and not auto-synced — prompt changes must be ported. A shared
  package is the eventual fix.
- The app has **no auth** and spends real money per render — gate any public URL
  and set an OpenAI spend cap.
