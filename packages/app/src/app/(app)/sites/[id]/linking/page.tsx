import React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LinkSuggestionRow = ({ from, to, score, reason }: any) => (
    <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
        <td className="px-6 py-4">
            <div className="text-white font-medium truncate max-w-xs">{from}</div>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                <div className="text-blue-400 font-medium truncate max-w-xs">{to}</div>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${score}%` }}></div>
                </div>
                <span className="text-gray-400">{score}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-gray-400 text-xs">{reason}</td>
        <td className="px-6 py-4 text-right">
            <Button variant="outline" size="sm">Apply</Button>
        </td>
    </tr>
);

export default function LinkSculptorPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Link href="/sites/1" className="hover:text-white">shop.example.com</Link>
                        <span>/</span>
                        <span className="text-white">Link Sculptor</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Internal Link Suggestions</h1>
                    <p className="text-gray-400 mt-1">Boost authority flow with AI-suggested connections</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary">Export CSV</Button>
                    <Button>Auto-Apply (Beta)</Button>
                </div>
            </div>

            <Card noPadding>
                <div className="p-4 border-b border-gray-800 flex gap-4 bg-gray-900/30">
                    <select className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2">
                        <option>Min Similarity: 80%</option>
                        <option>Min Similarity: 90%</option>
                    </select>
                    <select className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2">
                        <option>Target TSPR: High</option>
                        <option>Target TSPR: Any</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-3">Source Page</th>
                                <th className="px-6 py-3">Target Page</th>
                                <th className="px-6 py-3">Impact Score</th>
                                <th className="px-6 py-3">Reason</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <LinkSuggestionRow
                                from="/blog/running-tips"
                                to="/products/pro-runner-shoe"
                                score={95}
                                reason="High semantic overlap + High target conversion"
                            />
                            <LinkSuggestionRow
                                from="/guide/winter-clothing"
                                to="/collections/winter-jackets"
                                score={88}
                                reason="Topic cluster reinforcement"
                            />
                            <LinkSuggestionRow
                                from="/about-us"
                                to="/careers"
                                score={65}
                                reason="Structural navigation gap"
                            />
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
