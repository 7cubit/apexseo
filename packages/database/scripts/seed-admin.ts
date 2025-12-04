import { AdminRepository, AdminRole } from '@apexseo/shared';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const adminRepo = new AdminRepository();

async function seedAdmin() {
    const email = 'admin@apexseo.co';
    const password = 'Password@123';

    console.log(`Seeding admin user: ${email}`);

    try {
        // Check if admin already exists
        const existingAdmin = await adminRepo.findByEmail(email);
        if (existingAdmin) {
            console.log('Admin user already exists.');
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const admin = await adminRepo.create({
            email,
            password_hash: passwordHash,
            role: AdminRole.SUPER_ADMIN,
            is_active: true,
            // For testing purposes, we might want to skip 2FA or set a known secret
            // But the current auth service requires 2FA if secret is present.
            // Let's leave it empty for now to test the "first login" or "no 2FA" flow if implemented,
            // OR set a dummy secret if we want to test the 2FA flow.
            // The user didn't specify 2FA secret, so let's assume they want to login.
            // Looking at AdminAuthService:
            // if (admin.two_factor_secret) { return { require2fa: true }; }
            // else { return { require2fa: false, token: ... }; }
            // So omitting it will allow direct login.
        });

        console.log(`Admin user created successfully with ID: ${admin.id}`);
    } catch (error) {
        console.error('Error seeding admin user:', error);
    } finally {
        // Close driver connection if needed, but AdminRepository uses a singleton driver
        // process.exit(0);
    }
}

seedAdmin().then(() => {
    console.log('Seeding complete.');
    process.exit(0);
});
