import { ClickHouseAlertRepository, Alert as RepoAlert } from '../clickhouse/repositories/ClickHouseAlertRepository';

export interface Alert extends RepoAlert {
    id: string; // Map created_at or generate UUID if needed, but repo uses created_at as ID
}

export class AlertService {
    static async createTable() {
        await ClickHouseAlertRepository.createTable();
    }

    static async createAlert(siteId: string, type: 'error' | 'warning' | 'info', message: string, details: string = '') {
        const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
            'info': 'low',
            'warning': 'medium',
            'error': 'high'
        };

        await ClickHouseAlertRepository.createAlert({
            site_id: siteId,
            type,
            severity: severityMap[type],
            message,
            details,
            status: 'new'
        });
    }

    static async getAlerts(siteId: string, limit: number = 50) {
        const alerts = await ClickHouseAlertRepository.getAlerts(siteId);
        // Map repo alerts to service format if needed
        return alerts.map((a: any) => ({
            ...a,
            id: a.created_at, // Use created_at as ID for now
            is_read: a.status !== 'new'
        }));
    }

    static async markAsRead(alertId: string) {
        // We need siteId to update, but the API only passed ID. 
        // This is a limitation of the current repo update method.
        // For now, we'll assume we can't easily update without siteId.
        // Or we update the API to require siteId.
        console.warn("markAsRead requires siteId, skipping for now or need refactor");
    }

    static async markAsReadWithSiteId(siteId: string, alertId: string) {
        await ClickHouseAlertRepository.updateAlertStatus(siteId, alertId, 'acknowledged');
    }
}
