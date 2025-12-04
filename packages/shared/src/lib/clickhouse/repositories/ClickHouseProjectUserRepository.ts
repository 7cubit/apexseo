
import { client } from '../client';

export interface ProjectUser {
    project_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    created_at: string;
}

export class ClickHouseProjectUserRepository {
    static async createTable() {
        if (!client) return;

        await client.command({
            query: `
                CREATE TABLE IF NOT EXISTS project_users (
                    project_id String,
                    user_id String,
                    role String,
                    created_at DateTime DEFAULT now()
                ) ENGINE = MergeTree()
                ORDER BY (project_id, user_id)
            `
        });
    }

    static async addMember(member: ProjectUser) {
        if (!client) return;

        await client.insert({
            table: 'project_users',
            values: [{
                ...member,
                created_at: member.created_at.replace('T', ' ').split('.')[0]
            }],
            format: 'JSONEachRow'
        });
    }

    static async removeMember(projectId: string, userId: string) {
        if (!client) return;

        await client.command({
            query: `ALTER TABLE project_users DELETE WHERE project_id = {projectId:String} AND user_id = {userId:String}`,
            query_params: { projectId, userId }
        });
    }

    static async updateRole(projectId: string, userId: string, role: string) {
        if (!client) return;

        await client.command({
            query: `ALTER TABLE project_users UPDATE role = {role:String} WHERE project_id = {projectId:String} AND user_id = {userId:String}`,
            query_params: { projectId, userId, role }
        });
    }

    static async getMembers(projectId: string): Promise<ProjectUser[]> {
        if (!client) return [];

        const result = await client.query({
            query: `SELECT * FROM project_users WHERE project_id = {projectId:String}`,
            query_params: { projectId },
            format: 'JSONEachRow'
        });

        return await result.json() as ProjectUser[];
    }

    static async getProjectsForUser(userId: string): Promise<ProjectUser[]> {
        if (!client) return [];

        const result = await client.query({
            query: `SELECT * FROM project_users WHERE user_id = {userId:String}`,
            query_params: { userId },
            format: 'JSONEachRow'
        });

        return await result.json() as ProjectUser[];
    }
}
