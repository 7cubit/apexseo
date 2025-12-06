import { DataForSEOConfig } from './base';
import { KeywordsService } from './keywords';
import { SerpService } from './serp';
import { BacklinksService } from './backlinks';
import { OnPageService } from './onpage';

export class DataForSEO {
    public keywords: KeywordsService;
    public serp: SerpService;
    public backlinks: BacklinksService;
    public onPage: OnPageService;

    constructor(config: DataForSEOConfig) {
        this.keywords = new KeywordsService(config);
        this.serp = new SerpService(config);
        this.backlinks = new BacklinksService(config);
        this.onPage = new OnPageService(config);
    }
}

// Default instance factory for easy use
export function createDataForSEOClient() {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;

    if (!login || !password) {
        throw new Error("Missing DataForSEO credentials (DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD)");
    }

    return new DataForSEO({ login, password });
}
