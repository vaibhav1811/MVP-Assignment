const { PrismaClient } = require('@prisma/client');

async function testUrl(url) {
  const prisma = new PrismaClient({
    datasources: { db: { url } }
  });
  try {
    await prisma.$connect();
    console.log(`SUCCESS with url: ${url}`);
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.log(`Failed for ${url}:`, err.message);
    await prisma.$disconnect();
    return false;
  }
}

async function run() {
  await testUrl("postgresql://postgres:postgrespassword@localhost:5432/marketplace_db?schema=public");
  await testUrl("postgresql://postgres:postgrespassword@localhost:5432/postgres?schema=public");
  await testUrl("postgresql://postgres:postgres@localhost:5432/marketplace_db?schema=public");
  await testUrl("postgresql://postgres:postgres@localhost:5432/postgres?schema=public");
  await testUrl("postgresql://postgres:admin@localhost:5432/marketplace_db?schema=public");
  await testUrl("postgresql://postgres:root@localhost:5432/marketplace_db?schema=public");
}
run();
