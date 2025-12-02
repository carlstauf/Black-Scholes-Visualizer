#!/usr/bin/env bash
set -euo pipefail

# Clone the target repository into a sub‑folder of the Auquant project
TARGET_DIR="${PWD}/black_scholes_visualizer"
if [ -d "$TARGET_DIR" ]; then
  echo "Removing previous clone …"
  rm -rf "$TARGET_DIR"
fi
git clone https://github.com/carlstauf/Black-Scholes-Visualizer.git "$TARGET_DIR"

# Clean the cloned repo (keep only the .git folder)
cd "$TARGET_DIR"
# Remove everything except the .git directory
# List all entries (including hidden) and delete those that are not .git
shopt -s dotglob   # include hidden files
for entry in * .*; do
  if [ "$entry" != "." ] && [ "$entry" != ".." ] && [ "$entry" != ".git" ]; then
    rm -rf "$entry"
  fi
done
shopt -u dotglob

# Copy all files from the Auquant project into the cloned repo
# (the script lives in the Auquant root, so ".." is the project root)
cp -R "${PWD}/../"* "$TARGET_DIR/"

# Commit & push
cd "$TARGET_DIR"
git add .
git commit -m "Add Auquant Gold Sentiment Engine project"
git push origin main
