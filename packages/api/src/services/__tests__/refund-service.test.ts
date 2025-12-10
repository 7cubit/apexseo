import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RefundService } from '../refund-service';
import { prisma, InvoiceStatus } from '@apexseo/database';
import { stripe } from '../../lib/stripe';

// Mock Modules
vi.mock('@apexseo/database', () => ({
    prisma: {
        invoice: {
            findUnique: vi.fn(),
        },
        refund: {
            create: vi.fn(),
        }
    },
    InvoiceStatus: {
        PAID: 'PAID',
        DRAFT: 'DRAFT',
    }
}));

const { mockedRetrieve, mockedCreate } = vi.hoisted(() => {
    return {
        mockedRetrieve: vi.fn(),
        mockedCreate: vi.fn()
    }
});

vi.mock('../../lib/stripe', () => ({
    stripe: {
        invoices: {
            retrieve: mockedRetrieve,
        },
        refunds: {
            create: mockedCreate,
        }
    }
}));

describe('RefundService', () => {
    let refundService: RefundService;

    beforeEach(() => {
        refundService = new RefundService();
        vi.clearAllMocks();
    });

    it('should throw if invoice not found', async () => {
        (prisma.invoice.findUnique as any).mockResolvedValue(null);
        await expect(refundService.createRefund('inv_123')).rejects.toThrow('Invoice not found');
    });

    it('should throw if invoice is not paid', async () => {
        (prisma.invoice.findUnique as any).mockResolvedValue({ id: 'inv_123', status: 'DRAFT' });
        await expect(refundService.createRefund('inv_123')).rejects.toThrow('Cannot refund an unpaid invoice');
    });

    it('should process refund successfully for valid invoice', async () => {
        const mockInvoice = {
            id: 'inv_123',
            status: 'PAID',
            amountPaid: 100,
            createdAt: new Date() // Just now, so < 90 days
        };
        (prisma.invoice.findUnique as any).mockResolvedValue(mockInvoice);

        mockedRetrieve.mockResolvedValue({
            charge: 'ch_123'
        });

        mockedCreate.mockResolvedValue({
            id: 're_123'
        });

        const result = await refundService.createRefund('inv_123', 50, 'Customer Request');

        expect(mockedCreate).toHaveBeenCalledWith(expect.objectContaining({
            charge: 'ch_123',
            amount: 5000 // 50 * 100
        }));

        expect(prisma.refund.create).toHaveBeenCalled();
        expect(result).toEqual({ id: 're_123' });
    });
});
