#!/bin/zsh

paths_to_delete=(
  "./node_modules"
  "./dist"
  "./doc"
  "./tmp"
  "./yarn-error.log"
  "./yarn.lock"
  "./package-lock.json"
  "./lerna-debug.log"
)

for path in "${paths_to_delete[@]}"; do
  rm -rf $path
done
