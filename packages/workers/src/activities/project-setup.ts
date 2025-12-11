import {
    ProjectRepository,
    SiteRepository,
    KeywordRepository,
    CompetitorRepository,
    logger
} from '@apexseo/shared';

export interface ProjectSetupData {
    projectId: string;
    projectName: string;
    siteUrl: string;
    keywords: string[];
    competitors: string[];
    targetCountry?: string; // Future use
    targetLanguage?: string; // Future use
}

export async function createProjectGraph(data: ProjectSetupData): Promise<void> {
    logger.info(`ProjectSetup: Creating graph for project ${data.projectId}`);

    // 1. Create Project
    await ProjectRepository.createProject({
        id: data.projectId,
        name: data.projectName,
        types: [], // Default types
        createdAt: new Date().toISOString()
    });

    // 2. Create Site & Link
    const siteId = new URL(data.siteUrl).hostname; // Simple ID derivation
    await SiteRepository.createOrUpdateSite({
        id: siteId,
        url: data.siteUrl,
        projectId: data.projectId
    });
    await ProjectRepository.linkSiteToProject(data.projectId, siteId);

    // 3. Add Keywords
    if (data.keywords.length > 0) {
        await KeywordRepository.addKeywordsToProject(data.projectId, data.keywords);
    }

    // 4. Add Competitors
    if (data.competitors.length > 0) {
        await CompetitorRepository.addCompetitorsToProject(data.projectId, data.competitors);
    }

    logger.info(`ProjectSetup: Graph creation complete for ${data.projectId}`);
}

export async function initializeAnalytics(data: ProjectSetupData): Promise<void> {
    logger.info(`ProjectSetup: Initializing analytics for ${data.projectId}`);
    // Metrics placeholers - triggers specific child workflows or external API calls here
    // e.g. await DataForSEO.registerKeywords(data.keywords);
    // e.g. await SERPAnalysisWorkflow.trigger(data.keywords);
    return Promise.resolve();
}
