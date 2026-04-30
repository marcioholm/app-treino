
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for existing tenant...');
  let tenant = await prisma.tenant.findFirst({
    where: { name: 'M&K Fitness Center' }
  });

  if (!tenant) {
    console.log('Creating M&K Fitness Center Tenant...');
    tenant = await prisma.tenant.create({
      data: {
        name: 'M&K Fitness Center'
      }
    });
  }

  const email = 'admin@traineros.com';
  const password = 'testpassword';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Checking for user ${email}...`);
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (!existingUser) {
    console.log(`Creating admin user: ${email}`);
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: 'Marci Personal',
        email: email,
        password: hashedPassword,
        role: 'OWNER_PERSONAL'
      }
    });
    console.log('Admin user created successfully!');
  } else {
    console.log('Admin user already exists. Updating password to "testpassword"...');
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword
      }
    });
  }

  // Create a demo student as well
  const studentEmail = 'aluna@demo.com';
  const existingStudent = await prisma.user.findUnique({
    where: { email: studentEmail }
  });

  if (!existingStudent) {
    console.log(`Creating demo student: ${studentEmail}`);
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: 'Aluna de Teste',
        email: studentEmail,
        password: hashedPassword,
        role: 'STUDENT'
      }
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
