const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Auto-load .env
if (!process.env.DATABASE_URL) {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2]?.trim() || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

async function verify() {
  const dbUrl = process.env.DATABASE_URL;
  const sql = neon(dbUrl);

  const [usersCount] = await sql.query('SELECT COUNT(*)::int as count FROM "users"');
  const [articlesCount] = await sql.query('SELECT COUNT(*)::int as count FROM "articles"');
  const [teamsCount] = await sql.query('SELECT COUNT(*)::int as count FROM "teams"');
  const [playersCount] = await sql.query('SELECT COUNT(*)::int as count FROM "players"');
  const [matchesCount] = await sql.query('SELECT COUNT(*)::int as count FROM "matches"');
  const [settingsCount] = await sql.query('SELECT COUNT(*)::int as count FROM "site_settings"');

  const tables = await sql.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  const sampleArticles = await sql.query(`
    SELECT title, source, category, "createdAt" 
    FROM "articles" 
    ORDER BY "createdAt" DESC 
    LIMIT 3;
  `);

  console.log('=================================================');
  console.log('📊 Neon Production Database Verification Summary');
  console.log('=================================================');
  console.log(`📋 Public Tables: ${tables.map(t => t.table_name).join(', ')}`);
  console.log(`👥 Users:         ${usersCount.count}`);
  console.log(`📰 Articles:      ${articlesCount.count}`);
  console.log(`🛡️  Teams:         ${teamsCount.count}`);
  console.log(`⚽ Players:       ${playersCount.count}`);
  console.log(`🏟️  Matches:       ${matchesCount.count}`);
  console.log(`⚙️  Site Settings: ${settingsCount.count}`);
  console.log('-------------------------------------------------');
  console.log('🔥 Latest Synced Headlines:');
  sampleArticles.forEach((a, i) => {
    console.log(`   ${i + 1}. [${a.source || a.category}] ${a.title}`);
  });
  console.log('=================================================');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
