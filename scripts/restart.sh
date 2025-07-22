#!/bin/bash

set -e

echo ""
echo "🚦 [1/4] Shutting down all containers and removing volumes..."
docker compose down -v

echo ""
echo "🛠  [2/4] Building all images (no cache)..."
docker compose build --no-cache

echo ""
echo "🔼 [3/4] Starting up containers in detached mode..."
docker compose up -d

echo ""
echo "✅ [4/4] Done! Project is rebuilding & restarting in the background."
echo "    - Use 'docker compose logs -f' to watch logs."
echo ""
