#!/bin/bash
echo "Starting SolarGraph Pro..."

# Navigate to the directory where this script is located
cd "$(dirname "$0")"

echo "Checking and installing dependencies. This might take a minute..."
npm install

echo "========================================================="
echo "SolarGraph Pro is running at http://localhost:5173"
echo "DO NOT CLOSE THIS WINDOW while working with the app!"
echo "========================================================="

# Start dev server and open browser
npm run dev -- --open
