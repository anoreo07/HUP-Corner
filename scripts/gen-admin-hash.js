// Usage: node scripts/gen-admin-hash.js <password>
const bcrypt = require('bcryptjs');
const [,, password] = process.argv;
if (!password) {
  console.error('Usage: node scripts/gen-admin-hash.js <password>');
  process.exit(1);
}
bcrypt.hash(password, 12).then(h => console.log(h)).catch(e => { console.error(e); process.exit(1); });
