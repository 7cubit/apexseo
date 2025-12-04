import { NextResponse } from 'next/server';
import { AccountRepository } from '@apexseo/shared';

const accountRepo = new AccountRepository();

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const account = await accountRepo.getDetails(params.id);
        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }
        return NextResponse.json({ account });
    } catch (error) {
        console.error('Error fetching account details:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
