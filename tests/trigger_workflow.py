import asyncio
import os
import sys
import json
from temporalio.client import Client

async def main():
    if len(sys.argv) < 3:
        print("Usage: python3 trigger_workflow.py <workflow_id> <site_id> [action]")
        sys.exit(1)

    workflow_id = sys.argv[1]
    site_id = sys.argv[2]
    action = sys.argv[3] if len(sys.argv) > 3 else "start"
    
    temporal_addr = os.getenv("TEMPORAL_ADDRESS", "localhost:7233")
    client = await Client.connect(temporal_addr)

    if action == "start":
        print(f"Starting CannibalizationWorkflow for site {site_id} with ID {workflow_id}")
        handle = await client.start_workflow(
            "CannibalizationWorkflow",
            {"siteId": site_id},
            id=workflow_id,
            task_queue="seo-compute-queue",
        )
        print(f"Workflow started: {handle.id}")
    
    elif action == "describe":
        handle = client.get_workflow_handle(workflow_id)
        desc = await handle.describe()
        print(f"Status: {desc.status.name}") # e.g. RUNNING, COMPLETED, FAILED

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(main())
