
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_URL = 'http://localhost:4000';
const SECRET = process.env.NEXTAUTH_SECRET || 'supersecret';

async function verifyAuth() {
    console.log('🛡️  Starting Zero-Trust Security Audit...\n');

    // 1. Attack: No Token
    console.log('⚔️  ATTACK: Request without Token');
    try {
        const res = await fetch(`${API_URL}/projects`);
        if (res.status === 401) {
            console.log('✅ BLOCKED: 401 Unauthorized (As expected)');
        } else {
            console.log(`❌ FAILED: Expected 401, got ${res.status}`);
        }
    } catch (err) {
        console.error('Request failed', err);
    }

    // 2. Attack: Forged Token
    console.log('\n⚔️  ATTACK: Request with Forged Token');
    try {
        const forgedToken = jwt.sign({ id: 'hacker', orgId: 'evil_corp' }, 'wrong_secret');
        const res = await fetch(`${API_URL}/projects`, {
            headers: { Authorization: `Bearer ${forgedToken}` }
        });
        if (res.status === 401 || res.status === 403) { // fastify-jwt might return 401 or similar
            const body = await res.json();
            console.log(`✅ BLOCKED: ${res.status} Unauthorized`);
            console.log(`   Reason: ${(body as any).message}`);
        } else {
            console.log(`❌ FAILED: Expected 401, got ${res.status}`);
        }
    } catch (err) {
        console.error('Request failed', err);
    }

    // 3. Legitimate Access: Valid Token
    console.log('\n🔑 ACCESS: Request with Valid Token');
    try {
        const validToken = jwt.sign(
            { id: 'security-officer', orgId: 'apex_defense', email: 'sec@apex.co' },
            SECRET,
            { expiresIn: '1h' }
        );
        const res = await fetch(`${API_URL}/projects`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });

        if (res.status === 200) {
            const data = await res.json();
            console.log('✅ GRANTED: 200 OK');
            console.log(`   Projects found: ${(data as any).projects?.length ?? 0}`);
        } else {
            console.log(`❌ FAILED: Expected 200, got ${res.status}`);
            console.log(await res.text());
        }
    } catch (err) {
        console.error('Request failed', err);
    }
}

verifyAuth();
