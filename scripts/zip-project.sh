-#!/usr/bin/env bash

# Create a reproducible ZIP archive of the Tetris project,
# excluding node_modules, Git, virtualenvs, and other dev-only artifacts.

set -e

OUTPUT="tetris-game.zip"
EXCLUDES=(
  "**/node_modules/*"
  "**/.git/*"
  "**/.direnv/*"
  "**/.venv/*"
  "**/.envrc"
  "**/.DS_Store"
)

echo "📦 Zipping project to $OUTPUT..."

# Construct the zip exclude flags
EXCLUDE_FLAGS=()
for pattern in "${EXCLUDES[@]}"; do
  EXCLUDE_FLAGS+=("-x" "$pattern")
done

# Run zip
zip -r "$OUTPUT" . "${EXCLUDE_FLAGS[@]}"

echo "✅ Done. Output written to $OUTPUT"
