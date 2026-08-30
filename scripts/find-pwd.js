const { PrismaClient } = require('@prisma/client');

const passwords = [
  '1234', '12345', '123456', '12345678', '123456789', '0000', '1111',
  'admin123', 'admin', 'password', 'pass', 'postgres123', 'root123',
  'Postgres123!', 'Postgrespassword123!', 'Password123!', 'Asus', 'asus',
  '123', 'psql', 'qwerty', 'test'
];

async function testPwd(pwd) {
  const url = `postgresql://postgres:${encodeURIComponent(pwd)}@localhost:5432/postgres?schema=public`;
  const prisma = new PrismaClient({
    datasources: { db: { url } }
  });
  try {
    await prisma.$connect();
    console.log(`\n\n🎉 FOUND WORKING PASSWORD: "${pwd}"\n\n`);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    await prisma.$disconnect();
    return false;
  }
}

async function run() {
  for (const pwd of passwords) {
    process.stdout.write(`Testing: ${pwd}... `);
    const ok = await testPwd(pwd);
    if (ok) return;
  }
  console.log('None of the common passwords worked.');
}
run();
