
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

interface Member {
    user_id: string;
    role: string;
    created_at: string;
    // In real app, we'd join with users table to get name/email
    // For now, we'll display user_id or a mock email
}

interface TeamMembersTableProps {
    members: Member[];
    projectId: string | null;
    onUpdate: () => void;
}

export function TeamMembersTable({ members, projectId, onUpdate }: TeamMembersTableProps) {
    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!projectId) return;
        try {
            await fetch(`/api/projects/${projectId}/members/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            onUpdate();
        } catch (error) {
            console.error('Failed to update role', error);
        }
    };

    const handleRemove = async (userId: string) => {
        if (!projectId) return;
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            await fetch(`/api/projects/${projectId}/members/${userId}`, {
                method: 'DELETE'
            });
            onUpdate();
        } catch (error) {
            console.error('Failed to remove member', error);
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {members.map((member) => (
                    <TableRow key={member.user_id}>
                        <TableCell>
                            <div className="font-medium">{member.user_id}</div>
                            {/* <div className="text-sm text-muted-foreground">email@example.com</div> */}
                        </TableCell>
                        <TableCell>
                            <Select
                                defaultValue={member.role}
                                onValueChange={(val) => handleRoleChange(member.user_id, val)}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="owner">Owner</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </TableCell>
                        <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleRemove(member.user_id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
                {members.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No team members found. Invite someone to get started.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
