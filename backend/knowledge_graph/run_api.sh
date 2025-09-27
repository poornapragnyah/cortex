#!/bin/bash

# Set script to exit immediately if any command fails
set -e

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 and try again."
    exit 1
fi

# Check if the virtual environment exists, if not create it
if [ ! -d "$SCRIPT_DIR/venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$SCRIPT_DIR/venv"
fi

# Activate the virtual environment
echo "Activating virtual environment..."
source "$SCRIPT_DIR/venv/bin/activate"

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r "$SCRIPT_DIR/requirements.txt"

# Check if the example_abstarcts.json file exists
if [ ! -f "$SCRIPT_DIR/example_abstarcts.json" ]; then
    echo "Warning: example_abstarcts.json not found. The API might not work correctly."
fi

# Run the Flask API
echo "Starting Flask API server on port 5000..."
cd "$SCRIPT_DIR"
python3 app.py
