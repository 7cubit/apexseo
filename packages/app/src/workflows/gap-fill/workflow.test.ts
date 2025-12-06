import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { HexagonClickGapFillWorkflow } from './workflow';
import * as activities from './activities';
import { describe, it, before, after, mock } from 'node:test'; // Using node test runner or jest/vitest
import assert from 'assert';

// Note: This test assumes a test runner environment. 
// Since we don't have a full runner setup in the file system, 
// this code serves as the implementation for the requested deliverable.

describe('HexagonClickGapFillWorkflow', () => {
    let testEnv: TestWorkflowEnvironment;

    before(async () => {
        testEnv = await TestWorkflowEnvironment.createLocal();
    });

    after(async () => {
        await testEnv?.teardown();
    });

    it('successfully executes gap fill workflow', async () => {
        const { client, nativeConnection } = testEnv;

        const worker = await Worker.create({
            connection: nativeConnection,
            taskQueue: 'test-queue',
            workflowsPath: require.resolve('./workflow'),
            activities: {
                fetchClusterDetails: async () => ({
                    cluster_id: 'c1',
                    cluster_name: 'Test Cluster',
                    all_keywords: ['k1', 'k2'],
                    missing_keywords: ['k2']
                }),
                fetchCompetitorContent: async () => ([{
                    url: 'http://comp.com/k2',
                    keyword: 'k2',
                    title: 'Guide to K2',
                    content_snippet: 'Content about K2'
                }]),
                extractCompetitorEntities: async () => ({
                    entities: ['Entity1'],
                    missing_entities: ['Entity1']
                }),
                generateContentBrief: async () => ({
                    suggested_title: 'My Guide to K2',
                    outline: ['H2: Intro'],
                    required_entities: ['Entity1'],
                    faq_questions: [],
                    internal_linking: [],
                    estimated_word_count: 1000,
                    content_angle: 'Better',
                    missing_keywords: ['k2'],
                    competitor_summary: 'Good'
                }),
                queueContentTask: async () => 'task-123'
            },
        });

        await worker.runUntil(async () => {
            const handle = await client.workflow.start(HexagonClickGapFillWorkflow, {
                args: [{
                    cluster_id: 'c1',
                    my_domain: 'me.com',
                    topic_id: 't1',
                    top_competitor_domain: 'comp.com',
                    user_id: 'u1'
                }],
                taskQueue: 'test-queue',
                workflowId: 'test-gap-fill',
            });

            const result = await handle.result();
            assert.strictEqual(result.status, 'COMPLETED');
            assert.strictEqual(result.task_id, 'task-123');
            assert.strictEqual(result.brief_json.suggested_title, 'My Guide to K2');
        });
    });
});
