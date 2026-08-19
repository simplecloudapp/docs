#!/bin/sh
set -eu

repository_root=$(git rev-parse --show-toplevel)
existing_hooks_path=$(git -C "$repository_root" config --get core.hooksPath || true)

if [ -n "$existing_hooks_path" ] && [ "$existing_hooks_path" != ".githooks" ]; then
  echo "Git hooks are already configured at $existing_hooks_path."
  echo "Move or chain those hooks before enabling .githooks."
  exit 1
fi

git -C "$repository_root" config core.hooksPath .githooks

echo "Git hooks enabled for this clone."
