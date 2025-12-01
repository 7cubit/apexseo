import React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SessionRow = ({ id, persona, goal, duration, result, friction }: any) => (
    <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
        <td className="px-6 py-4">
            <Link href={`/sites/1/ux/sessions/${id}`} className="text-blue-400 hover:text-blue-300 font-mono text-sm">
                {id}
            </Link>
        </td>
        <td className="px-6 py-4 text-white">{persona}</td>
        <td className="px-6 py-4 text-gray-400">{goal}</td>
        <td className="px-6 py-4 text-gray-400">{duration}</td>
        <td className="px-6 py-4">
            <Badge variant={result === 'Success' ? 'success' : 'danger'}>{result}</Badge>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${friction > 70 ? 'bg-red-500' : friction > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${friction}%` }}
                    ></div>
                </div>
                <span className="text-xs text-gray-500">{friction}/100</span>
            </div>
        </td>
        <td className="px-6 py-4 text-right">
            <Link href={`/sites/1/ux/sessions/${id}`}>
                <Button variant="ghost" size="sm">Replay</Button>
            </Link>
        </td>
    </tr>
);

export default function UXLabPage() {
    return (

        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Link href="/sites/1" className="hover:text-white">shop.example.com</Link>
                        <span>/</span>
                        <span className="text-white">UX Lab</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">UX Simulation Lab</h1>
                    <p className="text-gray-400 mt-1">Agentic user testing with AI personas</p>
                </div>
                <Button>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Run New Simulation
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Personas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold">IB</div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Impatient Buyer</div>
                                        <div className="text-xs text-gray-500">High bounce risk</div>
                                    </div>
                                </div>
                                <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-700 text-blue-600" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center font-bold">R</div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Researcher</div>
                                        <div className="text-xs text-gray-500">Deep navigation</div>
                                    </div>
                                </div>
                                <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-700 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                <span className="text-sm text-white">Find Pricing Page</span>
                                <Badge variant="default">Nav</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                <span className="text-sm text-white">Reach Checkout</span>
                                <Badge variant="success">Conv</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-900/10 border-blue-900/30 flex flex-col justify-center items-center text-center">
                    <div className="text-4xl font-bold text-white mb-2">85%</div>
                    <div className="text-blue-400 font-medium">Success Rate</div>
                    <div className="text-xs text-gray-500 mt-2">Last 20 simulations</div>
                </Card>
            </div>

            <Card noPadding>
                <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50">
                    <h3 className="font-semibold text-white">Recent Sessions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-3">Session ID</th>
                                <th className="px-6 py-3">Persona</th>
                                <th className="px-6 py-3">Goal</th>
                                <th className="px-6 py-3">Duration</th>
                                <th className="px-6 py-3">Result</th>
                                <th className="px-6 py-3">Friction</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <SessionRow id="sess_8a92b" persona="Impatient Buyer" goal="Reach Checkout" duration="45s" result="Failed" friction={85} />
                            <SessionRow id="sess_7c12d" persona="Researcher" goal="Find Pricing" duration="2m 10s" result="Success" friction={12} />
                            <SessionRow id="sess_3f55a" persona="Skimmer" goal="Find Product Spec" duration="1m 05s" result="Success" friction={25} />
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>

    );
}
