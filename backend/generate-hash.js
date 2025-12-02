const bcrypt = require('bcrypt');

async function generateHash() {
  const hash = await bcrypt.hash('senha123', 10);
  console.log('Hash para senha123:');
  console.log(hash);
}

generateHash();
