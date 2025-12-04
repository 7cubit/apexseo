import { AdminRepository } from '../../shared/src/lib/neo4j/admin-repository';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Robust env loading
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

async function verifyAdmin() {
    const email = 'admin@apexseo.co';
    const password = 'Password@123';

    console.log(`Verifying admin: ${email}`);

    try {
        // Dynamic import to ensure env vars are loaded
        const { AdminRepository } = await import('../../shared/src/lib/neo4j/admin-repository');
        const repo = new AdminRepository();

        const admin = await repo.findByEmail(email);

        if (!admin) {
            console.error('❌ Admin user NOT found in database.');
            return;
        }

        console.log('✅ Admin user found:', { id: admin.id, email: admin.email, role: admin.role });

        const match = await bcrypt.compare(password, admin.password_hash);

        if (match) {
            console.log('✅ Password matches.');
        } else {
            console.error('❌ Password does NOT match.');
            console.log('Hash in DB:', admin.password_hash);
        }

    } catch (error) {
        console.error('❌ Error verifying admin:', error);
    }
}

verifyAdmin();
