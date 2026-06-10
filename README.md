# ◆ Kira Web

Mobile-first, responsive rebuild of the Kira product-studio tool — a FastAPI
backend wrapping the existing AI pipeline, with a React + Vite + Tailwind
frontend. One phone photo in, studio listing image out.

> Replaces the Streamlit demo (`product-studio-ai-demo`) to get real
> mobile-first responsive control. The AI pipeline (`api/image_pipeline.py`,
> `vision.py`, `prompts.py`, `utils.py`) is carried over unchanged — image model
> locked to **gpt-image-2 / medium**.

**Docs:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system design, API contract,
state flow · [`DESIGN.md`](./DESIGN.md) — design system, responsive strategy,
accessibility, checklist score · [`web/README.md`](./web/README.md) — frontend dev.

## Structure
```
kira-web/
├── api/          # FastAPI backend
│   ├── main.py           # routes + CORS + serves the built SPA (prod)
│   ├── image_pipeline.py # gpt-image-2 calls
│   ├── vision.py         # GPT-4o recognition + placement suggestions
│   ├── prompts.py        # prompts + STYLE_REGISTERS
│   └── utils.py
├── web/          # React + Vite + Tailwind frontend
├── Dockerfile    # single image: builds web/dist, serves api + dist
└── render.yaml   # Render blueprint
```

## API endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | liveness |
| POST | `/api/recognize` | multipart image → product description JSON |
| POST | `/api/enhance` | image + context + adjustment → studio image(s) |
| POST | `/api/placements` | JSON {context, style_register} → 10 scene ideas |
| POST | `/api/place` | image + scene_prompt + context → lifestyle image(s) |

## Run the API locally
```bash
cd api
cp .env.example .env   # add your OPENAI_API_KEY
uv run --with fastapi --with "uvicorn[standard]" --with openai --with Pillow \
  --with python-dotenv --with python-multipart \
  uvicorn main:app --reload --port 8000
```

> **Note:** `prompts.py` / pipeline modules are copied from the demo repo. The
> two are not auto-synced — prompt changes must be ported. A shared package is
> the eventual fix.

## Deploy (single Docker service serves UI + API)

The `Dockerfile` builds the frontend and serves it from FastAPI, so one service
exposes the whole app (UI at `/`, API at `/api/*`). No CORS in production.

**Render (blueprint):** render.com → New → Blueprint → pick this repo → set
`OPENAI_API_KEY` in the dashboard. `render.yaml` wires the rest (health check at
`/api/health`).

**Any Docker host (Railway / Fly / Cloud Run):**
```bash
docker build -t kira-web .
docker run -p 8000:8000 -e OPENAI_API_KEY=sk-... kira-web
# → http://localhost:8000
```

> ⚠️ The app makes real `gpt-image-2` calls (~$0.07–0.15/render) and has **no
> auth**. Before exposing a public URL, set an OpenAI **spend cap** and consider
> putting it behind access control.
