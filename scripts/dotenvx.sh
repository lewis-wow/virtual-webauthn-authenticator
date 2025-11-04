#!/bin/bash

# A wrapper script for dotenvx to select the .env file based on the ENVIRONMENT variable.
# Example Usage:
# ENVIRONMENT=STAGING ./dotenvx.sh npm run start
# This will execute: dotenvx -f .env.staging -- npm run start

# --- Configuration ---
# Set a default environment if the ENVIRONMENT variable is not provided.
DEFAULT_ENV="development"

# --- Script Logic ---

# 1. Determine the environment.
#    Use the value of the $ENVIRONMENT variable. If it's empty or not set, fall back to the default.
if [ -z "$ENVIRONMENT" ]; then
  echo "⚠️  Warning: ENVIRONMENT variable not set. Defaulting to '$DEFAULT_ENV'."
  CURRENT_ENV="$DEFAULT_ENV"
else
  CURRENT_ENV="$ENVIRONMENT"
fi

# 3. Construct the .env filename.
ENV_FILE=".env.${CURRENT_ENV}"

# 4. Check if the required .env file exists before attempting to use it.
# if [ ! -f "$ENV_FILE" ]; then
#   echo "❌ Error: Environment file '$ENV_FILE' not found for ENVIRONMENT='$CURRENT_ENV'."
#   exit 1
# fi

# 5. Execute the dotenvx command.
#    -f "$ENV_FILE": Specifies which environment file to load.
#    --: Separates dotenvx's options from the command you want to run.
#    "$@": Passes all arguments from this script directly to the command.
echo "Loading environment from '$ENV_FILE'..."
npx dotenvx run -f "$ENV_FILE" -- "$@"
