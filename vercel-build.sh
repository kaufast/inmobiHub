#!/bin/bash

# Install dependencies in the root directory
npm install

# Build the client
cd client
npm install
npm run build
cd ..

# Build the server
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/api

# Ensure the database schema is up to date
# npm run db:push

# Log completion
echo "Vercel build process completed successfully!"