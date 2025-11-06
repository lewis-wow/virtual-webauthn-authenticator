#!/bin/sh

# --- Robust Scripting Settings ---
# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error when substituting.
set -u

# --- Argument Validation ---
# Check if the number of arguments is exactly 2
if [ "$#" -ne 2 ]; then
    echo "Error: Incorrect number of arguments." >&2
    echo "Usage: $0 <source_path> <destination_path>" >&2
    exit 1
fi

# --- Main Logic ---
SRC_PATH="$1"
DST_PATH="$2"

# Check if source exists (optional but good for CI logs)
if [ ! -e "$SRC_PATH" ]; then
    echo "Error: Source path '$SRC_PATH' does not exist." >&2
    exit 1
fi

mkdir -p "$(dirname "$DST_PATH")"

echo "Attempting to copy '$SRC_PATH' to '$DST_PATH'..."

# Use 'cp -R' to recursively copy files OR folders.
# -R: Recursive, required for folders. Works on files too.
# -p: (Optional, but recommended) Preserves permissions, modification times, etc.
cp -pR "$SRC_PATH" "$DST_PATH"

echo "Copy complete."
