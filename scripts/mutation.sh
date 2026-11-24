#!/usr/bin/env bash
# Runs Stryker on the in-scope files this branch changed since its merge-base
# with the base branch, incrementally. CI, agent-review and local runs all call
# this script, so they agree on scope.
# See docs/adr/0002-adopt-stryker-mutation-testing.md.
# Usage: scripts/mutation.sh [--list] [base]
#   base     defaults to $MUTATION_BASE, then origin/main
#   --list   print the files to mutate and exit without running Stryker
set -euo pipefail

list_only=false
base="${MUTATION_BASE:-origin/main}"
for arg in "$@"; do
  case "$arg" in
    --list) list_only=true ;;
    -*)
      echo "Unknown option: $arg" >&2
      exit 2
      ;;
    *) base="$arg" ;;
  esac
done

# git prints paths from the repo root, so work from there.
cd "$(git rev-parse --show-toplevel)"

merge_base="$(git merge-base "$base" HEAD)"

# Changed files, without deleted ones.
changed="$(git diff --name-only --diff-filter=d "$merge_base"...HEAD)"

# Test → sibling rule: a changed X.test.ts(x) adds its colocated X.ts(x).
candidates="$changed"
while IFS= read -r file; do
  case "$file" in
    *.test.ts | *.test.tsx)
      sibling="${file%.test.*}.${file##*.}"
      if [ -f "$sibling" ]; then
        candidates+=$'\n'"$sibling"
      fi
      ;;
  esac
done <<<"$changed"

in_scope() {
  case "$1" in
    src/features/lessons/registry.ts) return 1 ;;
    src/lessons/* | *.mdx | .sandcastle/*) return 1 ;;
    src/test-utils/* | src/*/test-utils/*) return 1 ;;
    src/main.tsx | *.test.ts | *.test.tsx) return 1 ;;
  esac
  case "$1" in
    *.ts | *.tsx) ;;
    *) return 1 ;;
  esac
  case "$1" in
    src/features/* | src/app/* | src/pages/* | src/common/*) return 0 ;;
    src/components/ui/*) return 0 ;;
  esac
  return 1
}

files=()
while IFS= read -r file; do
  if [ -n "$file" ] && in_scope "$file"; then
    files+=("$file")
  fi
done < <(printf '%s\n' "$candidates" | sort -u)

if [ "${#files[@]}" -eq 0 ]; then
  echo "nothing to mutate"
  exit 0
fi

if [ "$list_only" = true ]; then
  printf '%s\n' "${files[@]}"
  exit 0
fi

# Outside `pnpm`, fall back to this repo's own Stryker.
PATH="$PATH:$(cd "$(dirname "$0")/.." && pwd)/node_modules/.bin"
if ! command -v stryker >/dev/null 2>&1; then
  echo "stryker not found. Install the dependencies with: pnpm install" >&2
  exit 1
fi
mutate="$(
  IFS=,
  echo "${files[*]}"
)"
exec stryker run --incremental --mutate "$mutate"
