import React from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TimelineStep = ({ step, action, url, note, status }: any) => (
    <div className="relative pl-8 pb-8 last:pb-0">
        <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center z-10 ${status === 'error' ? 'bg-red-900 text-red-400' : 'bg-blue-900 text-blue-400'}`}>
            <span className="text-xs font-bold">{step}</span>
        </div>
        <div className="absolute left-3 top-6 bottom-0 w-px bg-gray-800 last:hidden"></div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-white">{action}</div>
                <div className="text-xs text-gray-500 font-mono">{url}</div>
            </div>
            {note && (
                <div className="text-sm text-gray-400 bg-gray-950/50 p-2 rounded border border-gray-800/50">
                    <span className="text-blue-400 font-medium text-xs uppercase tracking-wider mr-2">Persona Thought:</span>
                    {note}
                </div>
            )}
        </div>
    </div>
);

export default function UXSessionReplayPage() {
    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Link href="/sites/1/ux" className="hover:text-white">UX Lab</Link>
                            <span>/</span>
                            <span className="text-white">Session sess_8a92b</span>
                        </div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-3">
                            Impatient Buyer Journey
                            <Badge variant="danger">Failed</Badge>
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                    </div>
                </div>

                <div className="flex gap-6 flex-1 min-h-0">
                    {/* Timeline Sidebar */}
                    <div className="w-1/3 overflow-y-auto pr-2">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Session Timeline</h3>
                        <div className="pt-2">
                            <TimelineStep
                                step="1"
                                action="Landed on Homepage"
                                url="/"
                                note="Page loaded in 1.2s. Hero banner is clear."
                                status="success"
                            />
                            <TimelineStep
                                step="2"
                                action="Clicked 'Shop Now'"
                                url="/collections/all"
                                note="Looking for running shoes. Navigation is intuitive."
                                status="success"
                            />
                            <TimelineStep
                                step="3"
                                action="Filtered by 'Size 10'"
                                url="/collections/all?size=10"
                                note="Filter applied correctly."
                                status="success"
                            />
                            <TimelineStep
                                step="4"
                                action="Clicked Product"
                                url="/products/speed-runner"
                                note="Product image looks good. Price is hidden?"
                                status="warning"
                            />
                            <TimelineStep
                                step="5"
                                action="Attempted Add to Cart"
                                url="/products/speed-runner"
                                note="Button disabled? Can't find size selector. Frustrated."
                                status="error"
                            />
                            <TimelineStep
                                step="6"
                                action="Abandoned Session"
                                url="/products/speed-runner"
                                note="Leaving site due to inability to purchase."
                                status="error"
                            />
                        </div>
                    </div>

                    {/* Replay Viewport */}
                    <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 flex flex-col overflow-hidden">
                        <div className="h-10 bg-gray-950 border-b border-gray-800 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            </div>
                            <div className="flex-1 text-center text-xs text-gray-500 font-mono bg-gray-900 rounded py-1 mx-4">
                                https://shop.example.com/products/speed-runner
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center bg-gray-800/50 relative">
                            <div className="text-gray-500 flex flex-col items-center">
                                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p>Snapshot / DOM Replay Visualization</p>
                                <p className="text-xs mt-2 opacity-70">(Placeholder for actual replay engine)</p>
                            </div>

                            {/* Overlay for friction point */}
                            <div className="absolute bottom-20 right-20 w-64 bg-red-900/90 backdrop-blur text-white p-4 rounded-lg border border-red-500 shadow-xl">
                                <div className="font-bold text-sm mb-1 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Friction Detected
                                </div>
                                <p className="text-gray-300 mb-2">&quot;Where is the pricing page? I can&apos;t find it anywhere.&quot;</p>
                                <p className="text-xs">User rage-clicked &quot;Add to Cart&quot; 3 times. Element appears unclickable.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
