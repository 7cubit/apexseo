from datetime import timedelta
from temporalio import workflow

# Import activity definitions
with workflow.unsafe.imports_passed_through():
    from activities import calculate_cannibalization, compute_content_score, fetch_site_pages

@workflow.defn
class CannibalizationWorkflow:
    @workflow.run
    async def run(self, input: dict):
        site_id = input["siteId"]
        
        # 1. Run Cannibalization Analysis
        await workflow.execute_activity(
            calculate_cannibalization,
            site_id,
            start_to_close_timeout=timedelta(minutes=5)
        )
        
        # 2. Run Content Scoring
        # First fetch pages that need scoring
        pages = await workflow.execute_activity(
            fetch_site_pages,
            site_id,
            start_to_close_timeout=timedelta(minutes=1)
        )
        
        # Score each page (sequentially for simplicity, or gather for parallel)
        for page in pages:
            if page.get('content') and page.get('target_keyword'):
                await workflow.execute_activity(
                    compute_content_score,
                    args=[page['content'], page['target_keyword'], site_id, page['url']],
                    start_to_close_timeout=timedelta(minutes=2)
                )
        
        return "Analysis and Scoring Complete"
