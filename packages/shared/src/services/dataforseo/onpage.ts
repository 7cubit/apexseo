import { DataForSEOBase } from './base';

export class OnPageService extends DataForSEOBase {

    /**
     * Run Lighthouse Audit (Instant)
     */
    async runLighthouse(url: string, for_mobile = true) {
        const endpoint = "/on_page/lighthouse/live/json";
        const payload = [{
            url,
            for_mobile
        }];
        return this.request(endpoint, payload);
    }

    /**
     * Get Instant Page Analysis
     */
    async getInstantPages(url: string) {
        const endpoint = "/on_page/instant_pages";
        const payload = [{
            url,
            enable_javascript: true,
            check_spell: true
        }];
        return this.request(endpoint, payload);
    }
}
