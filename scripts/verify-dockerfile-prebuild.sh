#!/usr/bin/env bash
set -euo pipefail

dockerfile="${1:-Dockerfile}"

if [ ! -f "$dockerfile" ]; then
  echo "missing: $dockerfile" >&2
  exit 2
fi

prebuild_line="$(grep -nE '^RUN pnpm --filter tailchat-types build$' "$dockerfile" | head -n 1 | cut -d: -f1 || true)"
sdk_prebuild_line="$(grep -nE '^RUN pnpm --filter tailchat-server-sdk build$' "$dockerfile" | head -n 1 | cut -d: -f1 || true)"
build_line="$(grep -nE '^RUN pnpm build$' "$dockerfile" | head -n 1 | cut -d: -f1 || true)"

if [ -z "${prebuild_line:-}" ]; then
  echo "missing prebuild: RUN pnpm --filter tailchat-types build" >&2
  exit 1
fi

if [ -z "${sdk_prebuild_line:-}" ]; then
  echo "missing prebuild: RUN pnpm --filter tailchat-server-sdk build" >&2
  exit 1
fi

if [ -z "${build_line:-}" ]; then
  echo "missing build: RUN pnpm build" >&2
  exit 1
fi

if [ "$prebuild_line" -ge "$build_line" ]; then
  echo "prebuild must be before pnpm build (prebuild=$prebuild_line build=$build_line)" >&2
  exit 1
fi

if [ "$sdk_prebuild_line" -ge "$build_line" ]; then
  echo "sdk prebuild must be before pnpm build (sdk_prebuild=$sdk_prebuild_line build=$build_line)" >&2
  exit 1
fi

if [ "$prebuild_line" -ge "$sdk_prebuild_line" ]; then
  echo "tailchat-types prebuild must be before tailchat-server-sdk prebuild (types=$prebuild_line sdk=$sdk_prebuild_line)" >&2
  exit 1
fi
