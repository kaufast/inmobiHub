#!/bin/bash

# Exit on error
set -e

# Install dependencies in the root directory
echo "Installing root dependencies..."
npm install

# Build the client
echo "Building client..."
cd client
npm install
npm run build
cd ..

# Build the server
echo "Building server..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/api

# Ensure the database schema is up to date
echo "Updating database schema..."
npx prisma generate
npx prisma db push

# Log completion
echo "Vercel build process completed successfully!"