"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const ClickHouseAlertRepository_1 = require("../clickhouse/repositories/ClickHouseAlertRepository");
class AlertService {
    static async createTable() {
        await ClickHouseAlertRepository_1.ClickHouseAlertRepository.createTable();
    }
    static async createAlert(siteId, type, message, details = '') {
        const severityMap = {
            'info': 'low',
            'warning': 'medium',
            'error': 'high'
        };
        await ClickHouseAlertRepository_1.ClickHouseAlertRepository.createAlert({
            site_id: siteId,
            type,
            severity: severityMap[type],
            message,
            details,
            status: 'new'
        });
    }
    static async getAlerts(siteId, limit = 50) {
        const alerts = await ClickHouseAlertRepository_1.ClickHouseAlertRepository.getAlerts(siteId);
        // Map repo alerts to service format if needed
        return alerts.map((a) => ({
            ...a,
            id: a.created_at, // Use created_at as ID for now
            is_read: a.status !== 'new'
        }));
    }
    static async markAsRead(alertId) {
        // We need siteId to update, but the API only passed ID. 
        // This is a limitation of the current repo update method.
        // For now, we'll assume we can't easily update without siteId.
        // Or we update the API to require siteId.
        console.warn("markAsRead requires siteId, skipping for now or need refactor");
    }
    static async markAsReadWithSiteId(siteId, alertId) {
        await ClickHouseAlertRepository_1.ClickHouseAlertRepository.updateAlertStatus(siteId, alertId, 'acknowledged');
    }
}
exports.AlertService = AlertService;
