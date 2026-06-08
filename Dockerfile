# ── Stage 1: build the React frontend ────────────────────────────────────────
FROM node:24-slim AS web
WORKDIR /web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# ── Stage 2: API + static frontend, single process ───────────────────────────
FROM python:3.12-slim
WORKDIR /app
COPY api/requirements.txt ./api/requirements.txt
RUN pip install --no-cache-dir -r api/requirements.txt
COPY api/ ./api/
COPY --from=web /web/dist ./web/dist

# Run from api/ so `from image_pipeline import ...` resolves and main.py finds
# ../web/dist. FastAPI serves the built SPA at / and the API at /api/*.
WORKDIR /app/api
EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
