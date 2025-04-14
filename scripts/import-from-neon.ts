import pkg from 'pg';
const { Client } = pkg;
import 'dotenv/config';

// Neon DB connection details
const neonConfig = {
  connectionString: "postgresql://neondb_owner:npg_AUs7rx6SBYHi@ep-nameless-glade-a5hct813.us-east-2.aws.neon.tech/neondb?sslmode=require"
};

// Local DB connection details
const localConfig = {
  connectionString: "postgresql://melchor@localhost:5432/neondb_local"
};

async function importData() {
  const neonClient = new Client(neonConfig);
  const localClient = new Client(localConfig);

  try {
    console.log('Connecting to both databases...');
    await Promise.all([neonClient.connect(), localClient.connect()]);
    console.log('Connected successfully!');

    // Get list of tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `;
    
    const { rows: tables } = await localClient.query(tablesQuery);
    console.log('\nFound tables:', tables.map(t => t.table_name).join(', '));

    // Import data for each table
    for (const { table_name } of tables) {
      console.log(`\nImporting data for table: ${table_name}`);
      
      try {
        // Get data from Neon DB
        const { rows: data } = await neonClient.query(`SELECT * FROM ${table_name}`);
        console.log(`Found ${data.length} rows`);

        if (data.length > 0) {
          // Clear existing data in local table
          await localClient.query(`TRUNCATE TABLE ${table_name} CASCADE`);
          
          // Generate insert query
          const columns = Object.keys(data[0]).join(', ');
          const values = data.map(row => {
            const vals = Object.values(row).map(val => {
              if (val === null) return 'NULL';
              if (typeof val === 'object') return `'${JSON.stringify(val)}'`;
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              return val;
            });
            return `(${vals.join(', ')})`;
          }).join(',\n');

          if (values.length > 0) {
            const insertQuery = `
              INSERT INTO ${table_name} (${columns})
              VALUES ${values}
            `;
            await localClient.query(insertQuery);
            console.log(`Imported ${data.length} rows successfully`);
          }
        }
      } catch (error) {
        console.error(`Error importing table ${table_name}:`, error);
      }
    }

    console.log('\nImport completed!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await Promise.all([
      neonClient.end().catch(() => {}),
      localClient.end().catch(() => {})
    ]);
  }
}

importData(); 