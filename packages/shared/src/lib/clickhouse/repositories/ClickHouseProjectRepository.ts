import { client } from '../client';

export interface Project {
    id: string;
    name: string;
    domain: string;
    user_id: string;
    created_at: string;
    site_doctor_enabled?: boolean;
    site_doctor_cron?: string;
    rank_tracker_enabled?: boolean;
    rank_tracker_cron?: string;
}

export class ClickHouseProjectRepository {
    static async createTable() {
        if (!client) return;

        await client.command({
            query: `
                CREATE TABLE IF NOT EXISTS projects (
                    id String,
                    name String,
                    domain String,
                    user_id String,
                    created_at DateTime,
                    site_doctor_enabled UInt8 DEFAULT 1,
                    site_doctor_cron String DEFAULT '0 2 * * *',
                    rank_tracker_enabled UInt8 DEFAULT 1,
                    rank_tracker_cron String DEFAULT '0 */6 * * *'
                ) ENGINE = MergeTree()
                ORDER BY (user_id, created_at)
            `
        });
    }

    static async create(project: Project): Promise<Project> {
        if (!client) throw new Error('ClickHouse client not initialized');

        await client.insert({
            table: 'projects',
            values: [{
                id: project.id,
                name: project.name,
                domain: project.domain,
                user_id: project.user_id,
                created_at: project.created_at,
                site_doctor_enabled: project.site_doctor_enabled ?? 1,
                site_doctor_cron: project.site_doctor_cron ?? '0 2 * * *',
                rank_tracker_enabled: project.rank_tracker_enabled ?? 1,
                rank_tracker_cron: project.rank_tracker_cron ?? '0 */6 * * *'
            }],
            format: 'JSONEachRow'
        });

        return project;
    }

    static async getByUser(userId: string): Promise<Project[]> {
        if (!client) return [];

        const result = await client.query({
            query: 'SELECT * FROM projects WHERE user_id = {userId:String} ORDER BY created_at DESC',
            query_params: { userId }
        });

        const data = await result.json();
        return data.data as Project[];
    }

    static async getById(id: string): Promise<Project | null> {
        if (!client) return null;

        const result = await client.query({
            query: 'SELECT * FROM projects WHERE id = {id:String} LIMIT 1',
            query_params: { id }
        });

        const data = await result.json();
        return data.data[0] as Project || null;
    }

    static async getAll(): Promise<Project[]> {
        if (!client) return [];

        const result = await client.query({
            query: 'SELECT * FROM projects ORDER BY created_at DESC'
        });

        const data = await result.json();
        return data.data as Project[];
    }

    static async update(id: string, updates: Partial<Project>): Promise<void> {
        if (!client) return;

        const setClauses = Object.keys(updates)
            .map(key => `${key} = {${key}:String}`)
            .join(', ');

        await client.command({
            query: `ALTER TABLE projects UPDATE ${setClauses} WHERE id = {id:String}`,
            query_params: { id, ...updates }
        });
    }

    static async delete(id: string): Promise<void> {
        if (!client) return;

        await client.command({
            query: 'ALTER TABLE projects DELETE WHERE id = {id:String}',
            query_params: { id }
        });
    }
}
