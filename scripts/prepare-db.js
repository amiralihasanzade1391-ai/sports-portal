const fs = require('fs');
const path = require('path');

const explicitArg = process.argv[2];

let targetProvider = null;
if (explicitArg === 'postgresql' || explicitArg === 'postgres') {
  targetProvider = 'postgresql';
} else if (explicitArg === 'sqlite') {
  targetProvider = 'sqlite';
} else {
  // Infer from environment or .env
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
      if (match) {
        dbUrl = match[1];
      }
    }
  }

  const isPostgres = dbUrl && (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'));
  targetProvider = isPostgres ? 'postgresql' : 'sqlite';
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const regex = /datasource\s+db\s*\{\s*provider\s*=\s*"(sqlite|postgresql)"/;
const match = schema.match(regex);

if (match) {
  const currentProvider = match[1];
  if (currentProvider !== targetProvider) {
    console.log(`[prepare-db] Switching Prisma provider from '${currentProvider}' to '${targetProvider}'...`);
    schema = schema.replace(
      /datasource\s+db\s*\{\s*provider\s*=\s*"(sqlite|postgresql)"/,
      `datasource db {\n  provider = "${targetProvider}"`
    );
    fs.writeFileSync(schemaPath, schema, 'utf8');
    console.log(`[prepare-db] Successfully updated schema.prisma datasource to '${targetProvider}'.`);
  } else {
    console.log(`[prepare-db] Prisma provider is already '${targetProvider}'.`);
  }
} else {
  console.warn('[prepare-db] Could not find datasource provider pattern in schema.prisma');
}
