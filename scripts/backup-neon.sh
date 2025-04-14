#!/bin/bash

# Create dumps directory if it doesn't exist
mkdir -p dumps

# Get current timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "Creating database dump from Neon..."

# Set Neon DB connection details
export PGHOST="ep-nameless-glade-a5hct813.us-east-2.aws.neon.tech"
export PGDATABASE="neondb"
export PGUSER="neondb_owner"
export PGPASSWORD="npg_AUs7rx6SBYHi"
export PGSSLMODE="require"

# Create schema-only backup
pg_dump \
  --schema-only \
  --no-owner \
  --no-privileges \
  -f dumps/schema_$TIMESTAMP.sql

# Create data-only backup
pg_dump \
  --data-only \
  --no-owner \
  --no-privileges \
  -f dumps/data_$TIMESTAMP.sql

echo "Database dumps created:"
echo "- Schema: dumps/schema_$TIMESTAMP.sql"
echo "- Data: dumps/data_$TIMESTAMP.sql" 