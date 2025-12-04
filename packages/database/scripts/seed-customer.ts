import dotenv from 'dotenv';
import path from 'path';

// Load env vars BEFORE importing anything that uses them
const envPath = path.resolve(process.cwd(), '.env');
console.log('DEBUG: CWD:', process.cwd());
console.log('DEBUG: Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error('DEBUG: Error loading .env:', result.error);
}
console.log('DEBUG: NEO4J_URI:', process.env.NEO4J_URI ? 'Set' : 'Unset');

async function seedCustomer() {
    // Dynamic imports to ensure env vars are loaded first
    const { UserRepository } = await import('../../shared/src/lib/neo4j/user-repository');
    const bcrypt = (await import('bcrypt')).default;

    const userRepo = new UserRepository();

    try {
        const email = 'customer@apexseo.co';
        const password = 'Password@123';
        const password_hash = await bcrypt.hash(password, 10);

        const existing = await userRepo.findByEmail(email);
        if (existing) {
            console.log(`Customer user ${email} already exists.`);
            return;
        }

        console.log(`Seeding customer user: ${email}`);
        const user = await userRepo.create({
            email,
            password_hash,
            name: 'Test Customer',
            is_suspended: false,
            image: ''
        });

        console.log(`Customer user created successfully with ID: ${user.id}`);
    } catch (error) {
        console.error('Failed to seed customer user:', error);
        process.exit(1);
    }
}

seedCustomer();
