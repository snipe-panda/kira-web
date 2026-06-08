"""
main.py — FastAPI backend for Kira (kira-web).

Thin HTTP layer over the existing pure-Python pipeline:
    vision.recognize_product / suggest_placements   (GPT-4o)
    image_pipeline.enhance_image_with_context / generate_placement  (gpt-image-2)

The pipeline modules are copied verbatim from the demo build and have no web
dependency. This file only handles: request parsing, image resizing, calling
the right function, and shaping the JSON/error response.

Run locally:
    cd api && uv run --with fastapi --with "uvicorn[standard]" --with openai \
        --with Pillow --with python-dotenv --with python-multipart \
        uvicorn main:app --reload --port 8000
"""

import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from image_pipeline import enhance_image_with_context, generate_placement
from utils import pil_to_bytes, resize_image
from vision import recognize_product, suggest_placements

load_dotenv()

app = FastAPI(title="Kira API", version="1.0")

# CORS — comma-separated origins in CORS_ORIGINS, default to the Vite dev server.
_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins.split(",") if o.strip()] or ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ───────────────────────────────────────────────────────────────────
async def _read_resized(file: UploadFile) -> bytes:
    """Read an uploaded image and resize it down (cost + payload control)."""
    raw = await file.read()
    import io

    resized = resize_image(io.BytesIO(raw))
    return pil_to_bytes(resized, format="PNG")


def _parse_context(raw: str | None) -> dict:
    """Parse a product_context form field (JSON string) into a dict."""
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return {}


def _result_or_error(result: dict):
    """Pipeline functions return {...} or {"error": ...}. Map errors to 502."""
    if isinstance(result, dict) and "error" in result:
        return JSONResponse(status_code=502, content={"error": result["error"]})
    return result


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "model": "gpt-image-2"}


@app.post("/api/recognize")
async def recognize(file: UploadFile = File(...)):
    """Stage 2 — GPT-4o Vision describes the product."""
    image_bytes = await _read_resized(file)
    return _result_or_error(recognize_product(image_bytes))


@app.post("/api/enhance")
async def enhance(
    file: UploadFile = File(...),
    product_context: str = Form("{}"),
    adjustment: str = Form(""),
):
    """Stage 3 — studio enhancement, guided by confirmed context."""
    image_bytes = await _read_resized(file)
    return _result_or_error(
        enhance_image_with_context(
            image_bytes=image_bytes,
            product_context=_parse_context(product_context),
            user_adjustment=adjustment,
        )
    )


@app.post("/api/placements")
async def placements(payload: dict):
    """Stage 4a — GPT-4o proposes 10 scenes in the chosen style register.

    JSON body: {"product_context": {...}, "style_register": "Modern"}
    """
    return _result_or_error(
        suggest_placements(
            product_context=payload.get("product_context", {}),
            style_register=payload.get("style_register", "Modern"),
        )
    )


@app.post("/api/place")
async def place(
    file: UploadFile = File(...),
    scene_prompt: str = Form(...),
    product_context: str = Form("{}"),
):
    """Stage 4b — render the product into the chosen lifestyle scene."""
    image_bytes = await _read_resized(file)
    return _result_or_error(
        generate_placement(
            image_bytes=image_bytes,
            scene_prompt=scene_prompt,
            product_context=_parse_context(product_context),
        )
    )


# ── Serve the built frontend (single-origin) ──────────────────────────────────
# If web/dist exists (production build), serve it at the root. API routes above
# are registered first, so they take precedence; everything else falls back to
# the static SPA. In dev (no dist) this is skipped and Vite serves the UI.
_DIST = os.path.join(os.path.dirname(__file__), "..", "web", "dist")
if os.path.isdir(_DIST):
    app.mount("/", StaticFiles(directory=_DIST, html=True), name="static")
