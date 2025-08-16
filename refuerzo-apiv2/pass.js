const bcrypt = require('bcryptjs');

async function gen() {
  const plain = '123456';
  const hash  = await bcrypt.hash(plain, 10);
  console.log(hash);
}
gen();