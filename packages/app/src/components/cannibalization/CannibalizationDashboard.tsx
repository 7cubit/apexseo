'use client';

import React, { useState, useEffect } from 'react';
import { CannibalizationService, CannibalizationIssue, CompetingPage } from '../../lib/services/CannibalizationService';
import { VolatilityTracker } from './VolatilityTracker';
import { ConflictResolutionModal } from './ConflictResolutionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Filter, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, AlertCircle, Swords } from 'lucide-react';

export function CannibalizationDashboard() {
    const [issues, setIssues] = useState<CannibalizationIssue[]>([]);
    const [selectedIssue, setSelectedIssue] = useState<CannibalizationIssue | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<{ keyword: string, pages: CompetingPage[] } | null>(null);

    const service = new CannibalizationService();

    useEffect(() => {
        service.getCannibalizationReport('project-1').then(data => {
            setIssues(data);
            if (data.length > 0) setSelectedIssue(data[0]);
        });
    }, []);

    const toggleRow = (keyword: string) => {
        if (expandedRow === keyword) {
            setExpandedRow(null);
        } else {
            setExpandedRow(keyword);
            const issue = issues.find(i => i.keyword === keyword);
            if (issue) setSelectedIssue(issue);
        }
    };

    const handleResolve = (issue: CannibalizationIssue) => {
        setModalData({ keyword: issue.keyword, pages: issue.pages });
        setIsModalOpen(true);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="px-6 py-4 bg-white dark:bg-gray-900 border-b flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Swords className="w-5 h-5 text-purple-600" />
                            Keyword Cannibalization Report
                        </h1>
                        <p className="text-sm text-gray-500">Identify and resolve pages competing for the same keywords</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select defaultValue="project-1">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Project" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="project-1">ApexSEO Space</SelectItem>
                                <SelectItem value="project-2">Client A</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" /> Export CSV
                        </Button>
                    </div>
                </header>

                {/* Conflict Matrix */}
                <div className="flex-1 overflow-auto p-6">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30px]"></TableHead>
                                    <TableHead>Keyword</TableHead>
                                    <TableHead>Conflict Status</TableHead>
                                    <TableHead>Volume</TableHead>
                                    <TableHead>Best Rank</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {issues.map((issue) => (
                                    <React.Fragment key={issue.keyword}>
                                        <TableRow
                                            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${expandedRow === issue.keyword ? 'bg-gray-50 dark:bg-gray-900' : ''}`}
                                            onClick={() => toggleRow(issue.keyword)}
                                        >
                                            <TableCell>
                                                {expandedRow === issue.keyword ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </TableCell>
                                            <TableCell className="font-medium">{issue.keyword}</TableCell>
                                            <TableCell>
                                                <Badge variant={issue.status === 'critical' ? 'destructive' : issue.status === 'warning' ? 'secondary' : 'outline'} className={issue.status === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}>
                                                    {issue.pageCount} Pages Competing
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{issue.volume.toLocaleString()}</TableCell>
                                            <TableCell>#{issue.bestRank}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={(e) => { e.stopPropagation(); handleResolve(issue); }}>
                                                    Resolve Conflict
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expandable Details */}
                                        {expandedRow === issue.keyword && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="p-0 bg-gray-50 dark:bg-gray-900/50">
                                                    <div className="p-4 pl-12 space-y-3">
                                                        <h4 className="text-sm font-semibold text-gray-500 uppercase">Competing Pages</h4>
                                                        {issue.pages.map(page => (
                                                            <div key={page.id} className="flex items-center justify-between bg-white dark:bg-black p-3 rounded border shadow-sm">
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-sm">{page.title}</div>
                                                                    <div className="text-xs text-blue-500 truncate">{page.url}</div>
                                                                </div>
                                                                <div className="flex items-center gap-6 text-sm">
                                                                    <div className="text-center">
                                                                        <div className="text-xs text-gray-500">Rank</div>
                                                                        <div className="font-bold">#{page.currentRank}</div>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <div className="text-xs text-gray-500">Traffic</div>
                                                                        <div className="font-bold">{page.traffic}</div>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <div className="text-xs text-gray-500">Updated</div>
                                                                        <div className="font-bold">{page.lastUpdated}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>

            {/* Right Sidebar: Volatility Tracker */}
            <div className="w-[350px] border-l bg-white dark:bg-gray-900 flex flex-col">
                {selectedIssue ? (
                    <VolatilityTracker keyword={selectedIssue.keyword} />
                ) : (
                    <div className="p-6 text-center text-gray-500 mt-20">
                        <AlertCircle className="w-10 h-10 mx-auto mb-4 opacity-50" />
                        <p>Select a keyword to view volatility history</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalData && (
                <ConflictResolutionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    keyword={modalData.keyword}
                    pages={modalData.pages}
                />
            )}
        </div>
    );
}
