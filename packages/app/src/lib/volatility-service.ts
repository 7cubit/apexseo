import { ClickHouseRankRepository } from './clickhouse/repositories/ClickHouseRankRepository';

export interface VolatilityData {
    keyword: string;
    volatility_index: number;
    avg_daily_change: number;
    status: 'Stable' | 'Moderate' | 'High';
}

export interface VolatilityReport {
    global_volatility: number;
    market_volatility: number; // New field
    global_status: 'Calm' | 'Breezy' | 'Stormy';
    keywords: VolatilityData[];
    serp_features: any[]; // New field
    alerts: string[]; // New field
}

export class VolatilityService {
    static async getReport(siteId: string): Promise<VolatilityReport> {
        const [stats, marketEvi, serpFeatures] = await Promise.all([
            ClickHouseRankRepository.getVolatilityStats(siteId),
            ClickHouseRankRepository.getMarketVolatilityStats(siteId),
            ClickHouseRankRepository.getSerpFeatureHistory(siteId)
        ]);

        const keywords: VolatilityData[] = (stats as any[]).map(s => ({
            keyword: s.keyword,
            volatility_index: parseFloat(s.volatility_index.toFixed(2)),
            avg_daily_change: parseFloat(s.avg_daily_change.toFixed(2)),
            status: this.getStatus(s.volatility_index)
        }));

        const globalVolatility = keywords.length > 0
            ? keywords.reduce((sum, k) => sum + k.volatility_index, 0) / keywords.length
            : 0;

        // Generate Alerts
        const alerts: string[] = [];
        if (globalVolatility >= 4.0) {
            alerts.push(`🚨 High Global Volatility (EVI ${globalVolatility.toFixed(2)}). Possible Algorithm Update.`);
        }
        if ((marketEvi as number) >= 4.0) {
            alerts.push(`🌊 Market-Wide Storm Detected (Market EVI ${(marketEvi as number).toFixed(2)}).`);
        }
        const criticalKeywords = keywords.filter(k => k.volatility_index >= 5.0);
        if (criticalKeywords.length > 0) {
            alerts.push(`⚠️ Critical Volatility for ${criticalKeywords.length} keywords (e.g., "${criticalKeywords[0].keyword}").`);
        }

        return {
            global_volatility: parseFloat(globalVolatility.toFixed(2)),
            market_volatility: parseFloat((marketEvi as number).toFixed(2)),
            global_status: this.getGlobalStatus(globalVolatility),
            keywords,
            serp_features: serpFeatures as any[],
            alerts
        };
    }

    private static getStatus(vi: number): 'Stable' | 'Moderate' | 'High' {
        // EVI Thresholds: < 1.5 (Stable), 1.5-4.0 (Moderate), >= 4.0 (High)
        if (vi >= 4.0) return 'High';
        if (vi >= 1.5) return 'Moderate';
        return 'Stable';
    }

    private static getGlobalStatus(vi: number): 'Calm' | 'Breezy' | 'Stormy' {
        if (vi >= 4.0) return 'Stormy';
        if (vi >= 1.5) return 'Breezy';
        return 'Calm';
    }
}
