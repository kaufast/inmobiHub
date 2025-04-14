#!/bin/bash

# Create dumps directory
mkdir -p dumps

# Get current timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "Creating database dump from Neon..."

# Create schema-only backup
PGPASSWORD=$PGPASSWORD pg_dump \
  -h $PGHOST \
  -U $PGUSER \
  -d $PGDATABASE \
  --schema-only \
  -F c \
  -f dumps/schema_$TIMESTAMP.dump

# Create data-only backup
PGPASSWORD=$PGPASSWORD pg_dump \
  -h $PGHOST \
  -U $PGUSER \
  -d $PGDATABASE \
  --data-only \
  -F c \
  -f dumps/data_$TIMESTAMP.dump

echo "Database dumps created:"
echo "- Schema: dumps/schema_$TIMESTAMP.dump"
echo "- Data: dumps/data_$TIMESTAMP.dump"
