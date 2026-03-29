#!/bin/sh

# A wrapper script for dotenvx to select the .env file based on the ENVIRONMENT variable

DEFAULT_ENV="development"
SCRIPT_DIR=$(dirname "$0")

if [ -z "$ENVIRONMENT" ]
then
  echo "⚠️ Warning: ENVIRONMENT variable not set. Defaulting to '$DEFAULT_ENV'."
  CURRENT_ENV="$DEFAULT_ENV"
else
  CURRENT_ENV="$ENVIRONMENT"
fi

ROOT_ENV_FILE="${SCRIPT_DIR}/../.env.${CURRENT_ENV}"
ROOT_KEYS_FILE="${SCRIPT_DIR}/../.env.keys"
ENV_FILE=".env.${CURRENT_ENV}"

if [ ! -f "$ENV_FILE" ]
then
  echo "⚠️ Warning: Environment file '$ENV_FILE' not found for ENVIRONMENT='$CURRENT_ENV'."
fi

DOTENVX_CMD="run"

if [ "$1" = "run" ] || [ "$1" = "get" ] || [ "$1" = "set" ] || [ "$1" = "ls" ] || [ "$1" = "pro" ] || [ "$1" = "ext" ] || [ "$1" = "encrypt" ] || [ "$1" = "decrypt" ] || [ "$1" = "keys" ]
then
  DOTENVX_CMD="$1"
  shift
fi

echo "Loading environment from '$ENV_FILE'..."

if [ "$DOTENVX_CMD" = "run" ]
then
  npx dotenvx "$DOTENVX_CMD" -fk "$ROOT_KEYS_FILE" -f "$ROOT_ENV_FILE" -f "$ENV_FILE" -- "$@"
else
  npx dotenvx "$DOTENVX_CMD" -fk "$ROOT_KEYS_FILE" -f "$ROOT_ENV_FILE" -f "$ENV_FILE" "$@"
fi
