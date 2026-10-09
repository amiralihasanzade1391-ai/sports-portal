const { neon } = require('@neondatabase/serverless');
const { execSync } = require('child_process');

async function main() {
  console.log('Generating PostgreSQL DDL migration from Prisma schema...');
  const ddl = execSync(
    'npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script',
    { encoding: 'utf8' }
  );

  const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_OI1FvhfmNG2Y@ep-dark-math-b2cdfynk.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require';
  console.log('Connecting to Neon via Serverless HTTP (port 443)...');
  const sql = neon(dbUrl);

  console.log('Executing DDL statements on Neon PostgreSQL...');
  
  // Split statements by semicolon
  const rawStatements = ddl.split(';');

  for (let i = 0; i < rawStatements.length; i++) {
    const raw = rawStatements[i].trim();
    if (!raw) continue;

    // Filter out pure comment blocks
    const lines = raw.split('\n').filter(l => !l.trim().startsWith('--')).join('\n').trim();
    if (!lines) continue;

    try {
      await sql.query(lines);
      const firstLine = lines.split('\n')[0].substring(0, 50);
      console.log(`  ✓ Executed: ${firstLine}...`);
    } catch (err) {
      if (err.message && (err.message.includes('already exists') || err.message.includes('duplicate key'))) {
        console.log(`  [Info] Already exists: ${lines.split('\n')[0].substring(0, 50)}...`);
      } else {
        console.error(`  [Error] Failed executing statement:`, lines, err);
        throw err;
      }
    }
  }

  console.log('\n✅ All DDL statements executed successfully!');

  // Verify created tables
  const tables = await sql.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log('\n📋 Public tables in Neon database:');
  console.log(tables.map(t => t.table_name));
}

main().catch(err => {
  console.error('Fatal deployment error:', err);
  process.exit(1);
});
