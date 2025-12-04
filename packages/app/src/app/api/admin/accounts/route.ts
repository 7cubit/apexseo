import { NextResponse } from 'next/server';
import { AccountRepository } from '@apexseo/shared';

const accountRepo = new AccountRepository();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || undefined;
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const accounts = await accountRepo.listWithSubscription(limit, offset, search);

        return NextResponse.json({ accounts });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
