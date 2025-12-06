import { DataForSEOBase } from './base';

export class BacklinksService extends DataForSEOBase {

    /**
     * Get Backlinks Summary for a domain or URL
     */
    async getSummary(target: string) {
        const endpoint = "/backlinks/summary/live";
        const payload = [{
            target,
            include_subdomains: true
        }];
        return this.request(endpoint, payload);
    }

    /**
     * Get list of backlinks
     */
    async getBacklinks(target: string, limit = 100) {
        const endpoint = "/backlinks/backlinks/live";
        const payload = [{
            target,
            limit,
            mode: "as_is",
            include_subdomains: true
        }];
        return this.request(endpoint, payload);
    }

    /**
     * Get referring domains
     */
    async getReferringDomains(target: string, limit = 100) {
        const endpoint = "/backlinks/referring_domains/live";
        const payload = [{
            target,
            limit,
            include_subdomains: true
        }];
        return this.request(endpoint, payload);
    }

    /**
     * Get anchor text distribution
     */
    async getAnchors(target: string, limit = 100) {
        const endpoint = "/backlinks/anchors/live";
        const payload = [{
            target,
            limit,
            include_subdomains: true
        }];
        return this.request(endpoint, payload);
    }
}
