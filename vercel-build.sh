#!/bin/bash

# Build the frontend
npm run build

# Ensure the database schema is up to date
# npm run db:push

# Log completion
echo "Vercel build process completed successfully!"