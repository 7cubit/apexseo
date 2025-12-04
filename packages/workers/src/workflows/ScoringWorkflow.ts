
import { proxyActivities } from '@temporalio/workflow';


// Define Python activities interface
interface PythonActivities {
    run_tspr(projectId: string): Promise<any>;
    analyze_content_depth(text: string): Promise<number>;
    compute_composite_score(tspr: number, depth: number, risk: number, ux: number): Promise<number>;
}

const { run_tspr, analyze_content_depth, compute_composite_score } = proxyActivities<PythonActivities>({
    taskQueue: 'seo-python-worker-task-queue', // Python worker queue
    startToCloseTimeout: '5m',
});

interface NodeActivities {
    saveScoreToClickHouse(record: any): Promise<void>;
    getPagesForProject(projectId: string): Promise<any[]>;
}

const { saveScoreToClickHouse, getPagesForProject } = proxyActivities<NodeActivities>({
    taskQueue: 'seo-tasks-queue', // Node worker queue
    startToCloseTimeout: '1m',
});

export async function ScoringWorkflow(projectId: string): Promise<string> {
    // 1. Run TSPR (Graph Analysis)
    // This runs on the whole graph for the project
    await run_tspr(projectId);

    // 2. Get Pages to Score
    // We need to fetch pages to iterate over them. 
    // In a real app, we might batch this or use a query.
    // For this demo, we'll fetch a small list.
    // We need an activity to get pages.
    // Let's assume we have `getPagesForProject` activity.
    // Since we haven't implemented `getPagesForProject` in Node worker yet, 
    // I will implement it in the Node worker activities file next.

    // For now, let's mock the list or assume the activity exists.
    const pages = await getPagesForProject(projectId);

    for (const page of pages) {
        // 3. Analyze Content Depth (NLP)
        // We pass the text content. Assuming 'page' object has 'text' or we fetch it.
        // If page doesn't have text, we might need to fetch it from ClickHouse.
        // Let's assume `getPagesForProject` returns { url, content, ... }
        const depthScore = await analyze_content_depth(page.content || "");

        // 4. Compute Composite Score
        // Mocking TSPR score for the page (in real app, we'd query Neo4j for this page's score)
        const tsprScore = 5.0;
        const riskScore = 0;
        const uxScore = 85;

        const compositeScore = await compute_composite_score(tsprScore, depthScore, riskScore, uxScore);

        // 5. Persist Score
        await saveScoreToClickHouse({
            project_id: projectId,
            url: page.url,
            composite_score: compositeScore,
            tspr_score: tsprScore,
            depth_score: depthScore,
            ux_score: uxScore,
            risk_score: riskScore,
            created_at: new Date().toISOString()
        });
    }

    return "Scoring completed";
}
