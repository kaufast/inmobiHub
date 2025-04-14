#!/bin/bash

echo "Checking PostgreSQL installation and status..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install it first:"
    echo "brew install postgresql@14"
    exit 1
fi

# Check if PostgreSQL service is running
if ! pg_isready &> /dev/null; then
    echo "PostgreSQL service is not running. Starting it..."
    brew services start postgresql
    sleep 5
fi

# Check if service started successfully
if pg_isready; then
    echo "PostgreSQL is running!"
    
    # Check if database exists
    if psql -lqt | cut -d \| -f 1 | grep -qw neondb_local; then
        echo "Database 'neondb_local' exists"
    else
        echo "Database 'neondb_local' does not exist"
        echo "Creating database..."
        createdb neondb_local
    fi
    
    # Check user permissions
    echo "Checking user permissions..."
    psql -d neondb_local -c "SELECT current_user, current_database();"
else
    echo "Failed to start PostgreSQL. Please check the logs:"
    echo "brew services logs postgresql"
    exit 1
fi 