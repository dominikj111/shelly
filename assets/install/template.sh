#!/bin/bash

# auto-generated by shelly project
# (shelly script)

# Check if Deno is installed in current environment
if ! command -v deno &>/dev/null; then
    echo "Deno is not installed. Please install it first."
    exit 1
fi

(
    cd "PROJECT_PATH" &&\
    deno --allow-read=PROJECT_PATH/scripts,PROJECT_PATH/assets main.ts "$(basename "$0")" "$@"
)
