#!/bin/bash

# Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
  echo "Starting PostgreSQL..."
  brew services start postgresql
  sleep 5
fi

# Get the latest dumps
SCHEMA_DUMP=$(ls -t dumps/schema_*.sql | head -1)
DATA_DUMP=$(ls -t dumps/data_*.sql | head -1)

if [ -z "$SCHEMA_DUMP" ] || [ -z "$DATA_DUMP" ]; then
  echo "No dump files found in dumps directory"
  exit 1
fi

echo "Using dumps:"
echo "- Schema: $SCHEMA_DUMP"
echo "- Data: $DATA_DUMP"

# Drop and recreate local database
echo "Recreating local database..."
dropdb neondb_local --if-exists
createdb neondb_local

# Restore schema
echo "Restoring schema..."
psql -d neondb_local -f "$SCHEMA_DUMP"

# Restore data
echo "Restoring data..."
psql -d neondb_local -f "$DATA_DUMP"

echo "Database restored successfully!"
echo "You can now use: DATABASE_URL=postgresql://melchor@localhost:5432/neondb_local"
