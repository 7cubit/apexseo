import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const superAdminEmail = '7cubit@gmail.com'; // Hardcoded as per request or env
    const superAdminId = 'user_2pv...'; // Example Clerk ID, or fetch from Clerk API if possible. 
    // Since we can't fetch from Clerk easily without secret key here and knowing the user exists,
    // we will upsert by email if possible or just create a placeholder.
    // Actually, for the seed to work with Clerk, the user needs to exist in Clerk.

    console.log('Seeding database...');

    // Upsert user
    // We use a dummy ID if we don't have one, but in production we need real Clerk IDs.
    // For 'init' purposes, we might just log instructions.

    // Checking if we can upsert by email? No, ID is storage key.
    // We will assume the user sets the ID manually or logic handles it.

    // Let's create a clearer instruction log or try to seed if ENV vars present.

    console.log(`
  To complete seeding:
  1. Ensure user '${superAdminEmail}' exists in Clerk.
  2. Get their Clerk User ID.
  3. Run a custom script or manually insert into DB:
     INSERT INTO users (id, email, role, "updatedAt") VALUES ('<CLERK_ID>', '${superAdminEmail}', 'SUPER_ADMIN', NOW());
  `);

    // We can try to seed a specific ID if known, or just dummy data for dev.
    // const alice = await prisma.user.upsert({
    //   where: { email: 'alice@prisma.io' },
    //   update: {},
    //   create: {
    //     email: 'alice@prisma.io',
    //     role: UserRole.SUPER_ADMIN,
    //     id: 'user_mock_alice'
    //   },
    // })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
