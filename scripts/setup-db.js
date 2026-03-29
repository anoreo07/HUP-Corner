#!/usr/bin/env node

/**
 * 🚀 Database Setup Helper
 * 
 * This script provides instructions to set up the Supabase database.
 * It reads migration files and provides step-by-step guidance.
 */

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'migrations');

console.log('\n========================================');
console.log('  🗄️  HUP Corner Database Setup Guide');
console.log('========================================\n');

console.log('📌 CRITICAL: Run these migrations before using the app!\n');

console.log('📋 Migration files found:\n');

const migrations = [
  '0001_add_role_to_profiles.sql',
  '0002_seed_admin_auth.sql',
  '0003_create_notifications_table.sql',
  '0004_create_documents_table.sql',
];

migrations.forEach((file, index) => {
  const filePath = path.join(migrationsDir, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${index + 1}. ${file}`);
});

console.log('\n📖 Instructions:\n');
console.log('1. Open Supabase Dashboard: https://app.supabase.com');
console.log('2. Select your project');
console.log('3. Go to SQL Editor (left sidebar)');
console.log('4. Click "New Query"');
console.log('5. For each migration file (in order):\n');

migrations.forEach((file, index) => {
  console.log(`   Step ${index + 1}: ${file}`);
  console.log(`   - Open: migrations/${file}`);
  console.log(`   - Copy all content`);
  console.log(`   - Paste into SQL Editor`);
  console.log(`   - Click "Run" (or Ctrl+Enter)`);
  console.log(`   - Wait for "Query successful"\n`);
});

console.log('⚠️  IMPORTANT: The "0004_create_documents_table.sql" is CRITICAL!');
console.log('   Without it, document uploads will NOT appear in admin dashboard.\n');

console.log('✅ After running all migrations:\n');
console.log('1. Run: pnpm install');
console.log('2. Run: pnpm dev');
console.log('3. Test upload: http://localhost:3000/upload');
console.log('4. View admin: http://localhost:3000/admin\n');

console.log('❓ Need help? Check: MIGRATION_DOCUMENTS_TABLE.md\n');

console.log('========================================\n');
