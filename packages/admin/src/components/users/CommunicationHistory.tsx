'use client';

interface SentEmail {
    id: string;
    subject: string;
    sentAt: string;
    openedAt?: string;
    clickedAt?: string;
    campaignId?: string;
}

interface CommunicationHistoryProps {
    emails: SentEmail[];
}

export function CommunicationHistory({ emails }: CommunicationHistoryProps) {
    if (!emails || emails.length === 0) {
        return <div className="text-gray-500 italic">No communication history.</div>;
    }

    return (
        <div className="bg-white rounded shadow overflow-hidden">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left">Subject</th>
                        <th className="px-6 py-3 text-left">Sent Date</th>
                        <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {emails.map(email => (
                        <tr key={email.id}>
                            <td className="px-6 py-4">{email.subject}</td>
                            <td className="px-6 py-4">{new Date(email.sentAt).toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">Sent</span>
                                    {email.openedAt && <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs">Opened</span>}
                                    {email.clickedAt && <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs">Clicked</span>}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
