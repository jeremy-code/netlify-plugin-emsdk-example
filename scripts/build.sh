#!/usr/bin/env bash

set -o errexit -o nounset -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="${SOURCE_DIR}/pkg"

if [ ! -d "${OUTPUT_DIR}" ]; then
  mkdir -p "${OUTPUT_DIR}"
fi

# https://emscripten.org/docs/tools_reference/settings_reference.html
COMPILE_FLAGS=(
  -Oz # https://clang.llvm.org/docs/CommandGuide/clang.html#cmdoption-O0
  -g0 # Do not generate debug information
  --minify 0 # Do not minify JavaScript glue code
  --emit-tsd "${OUTPUT_DIR}/main.d.ts"
  -sENVIRONMENT="web,node"
  -sSTACK_SIZE=$((2 ** 16))
  -sINCOMING_MODULE_JS_API="[]"
  -sFILESYSTEM=0
  -sMODULARIZE=1
  -sEXPORT_ES6=1
  -sEXPORT_NAME="MainModule"
  -o "${OUTPUT_DIR}/main.js"
)

emcc \
  "${COMPILE_FLAGS[@]}" \
  "${SOURCE_DIR}/module/main.c"
