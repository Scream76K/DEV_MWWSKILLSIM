#!/bin/bash
set -euo pipefail
work=$(cd -- "$(dirname -- "$0")" && pwd -P)
exec node "$work/harness/run-commit.cjs" "$@"
