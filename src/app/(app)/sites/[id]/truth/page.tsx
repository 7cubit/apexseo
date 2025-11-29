import React from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const RiskRow = ({ claim, page, risk, consensus }: any) => (
    <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
        <td className="px-6 py-4">
            <div className="text-white text-sm line-clamp-2">{claim}</div>
        </td>
        <td className="px-6 py-4">
            <Badge variant={risk > 80 ? 'danger' : risk > 50 ? 'warning' : 'success'}>
                {risk}/100 Risk
            </Badge>
        </td>
        <td className="px-6 py-4">
            <div className="text-gray-400 text-xs line-clamp-2">{consensus}</div>
        </td>
        <td className="px-6 py-4">
            <Link href="#" className="text-blue-400 hover:text-blue-300 text-sm truncate block max-w-[200px]">{page}</Link>
        </td>
        <td className="px-6 py-4 text-right">
            <Button variant="ghost" size="sm">Details</Button>
        </td>
    </tr>
);

export default function TruthEnginePage() {
    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Link href="/sites/1" className="hover:text-white">shop.example.com</Link>
                        <span>/</span>
                        <span className="text-white">Truth Engine</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Truth Engine</h1>
                    <p className="text-gray-400 mt-1">Automated fact-checking and risk assessment</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-red-900/10 border-red-900/30">
                        <div className="text-red-400 text-sm font-medium mb-1">Max Risk Score</div>
                        <div className="text-3xl font-bold text-white">92<span className="text-lg text-gray-500 font-normal">/100</span></div>
                    </Card>
                    <Card>
                        <div className="text-gray-400 text-sm font-medium mb-1">High Risk Claims</div>
                        <div className="text-3xl font-bold text-white">14</div>
                    </Card>
                    <Card>
                        <div className="text-gray-400 text-sm font-medium mb-1">Pages Affected</div>
                        <div className="text-3xl font-bold text-white">5</div>
                    </Card>
                </div>

                <Card noPadding>
                    <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50">
                        <h3 className="font-semibold text-white">Detected Claims & Risks</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-3 w-1/3">Claim Text</th>
                                    <th className="px-6 py-3">Risk Score</th>
                                    <th className="px-6 py-3 w-1/3">Consensus / Evidence</th>
                                    <th className="px-6 py-3">Source Page</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <RiskRow
                                    claim="Our shoes cure plantar fasciitis instantly."
                                    risk={92}
                                    consensus="Medical consensus states orthotics may help, but 'instant cure' is scientifically unsupported."
                                    page="/products/miracle-shoe"
                                />
                                <RiskRow
                                    claim="Voted #1 running shoe by everyone."
                                    risk={75}
                                    consensus="Lack of citation or specific award body. Likely puffery."
                                    page="/blog/best-shoes-2024"
                                />
                                <RiskRow
                                    claim="Made from 100% recycled materials."
                                    risk={10}
                                    consensus="Verified against supply chain data."
                                    page="/sustainability"
                                />
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
