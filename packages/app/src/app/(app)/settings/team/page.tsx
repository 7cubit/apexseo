
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TeamMembersTable } from '@/components/settings/TeamMembersTable';
import { InviteUserModal } from '@/components/settings/InviteUserModal';
import { useToast } from '@/components/ui/use-toast';
import { useParams } from 'next/navigation';

export default function TeamSettingsPage() {
    const [members, setMembers] = useState([]);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const { toast } = useToast();
    // Assuming we have a project ID in context or URL, for now hardcoding or getting from somewhere
    // In a real app, this would likely be under /projects/[id]/settings/team
    // But the path is /settings/team, implying a "current project" context.
    // Let's assume we fetch the "current" project ID from an API or store.
    // For this implementation, I'll fetch the first project for the user.
    const [projectId, setProjectId] = useState<string | null>(null);

    useEffect(() => {
        // Fetch current project
        fetch('/api/projects')
            .then(res => res.json())
            .then(data => {
                if (data.projects && data.projects.length > 0) {
                    setProjectId(data.projects[0].id);
                }
            });
    }, []);

    const fetchMembers = async () => {
        if (!projectId) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/members`);
            const data = await res.json();
            setMembers(data.members);
        } catch (error) {
            console.error('Failed to fetch members', error);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [projectId]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
                    <p className="text-muted-foreground">
                        Manage your team members and their roles.
                    </p>
                </div>
                <Button onClick={() => setIsInviteModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Member
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                    <TeamMembersTable
                        members={members}
                        projectId={projectId}
                        onUpdate={fetchMembers}
                    />
                </CardContent>
            </Card>

            <InviteUserModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                projectId={projectId}
                onSuccess={() => {
                    fetchMembers();
                    setIsInviteModalOpen(false);
                    toast({ title: 'Member invited successfully' });
                }}
            />
        </div>
    );
}
