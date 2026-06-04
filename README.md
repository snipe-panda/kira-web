# ◆ Kira Web

Mobile-first, responsive rebuild of the Kira product-studio tool — a FastAPI
backend wrapping the existing AI pipeline, with a React + Vite + Tailwind
frontend (in progress).

> Replaces the Streamlit demo (`product-studio-ai-demo`) to get real
> mobile-first responsive control. The AI pipeline (`api/image_pipeline.py`,
> `vision.py`, `prompts.py`, `utils.py`) is carried over unchanged — image model
> locked to **gpt-image-2 / medium**.

## Structure
```
kira-web/
├── api/          # FastAPI backend
│   ├── main.py           # routes + CORS
│   ├── image_pipeline.py # gpt-image-2 calls
│   ├── vision.py         # GPT-4o recognition + placement suggestions
│   ├── prompts.py        # prompts + STYLE_REGISTERS
│   └── utils.py
└── web/          # React + Vite + Tailwind frontend (Phase 2+)
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
