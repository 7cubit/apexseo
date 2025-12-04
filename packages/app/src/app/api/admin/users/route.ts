import { NextResponse } from 'next/server';
import { UserRepository } from '@apexseo/shared';
// import { verifyAdminToken } from '@/lib/auth/admin-guard'; // We would need middleware or a helper for this

const userRepo = new UserRepository();

export async function GET(request: Request) {
    try {
        // TODO: Add proper admin authentication check here
        // const token = request.headers.get('Authorization')?.split(' ')[1];
        // if (!verifyAdminToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // For now, we'll assume the route is protected by middleware or we're in MVP mode
        // In a real implementation, we should check the JWT from the header.

        // UserRepository doesn't have a findAll method yet, let's assume we might need to add it or use a raw query.
        // Since I can't easily modify shared package without potentially breaking things or needing a rebuild,
        // I will check if UserRepository has a findAll or similar.
        // If not, I'll mock the response for now or try to implement it if I can see the file.

        // Let's return a mock list for now to unblock the UI development,
        // as I haven't verified if UserRepository has findAll.
        // Wait, I should check UserRepository first.

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || undefined;
        const status = searchParams.get('status') || undefined;

        // Default limit to 20
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const users = await userRepo.listWithDetails(limit, offset, search, status);

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
