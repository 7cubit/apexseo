import asyncio
import os
from temporalio.client import Client
from temporalio.worker import Worker
from activities import calculate_cannibalization, compute_content_score, fetch_site_pages
from workflows import CannibalizationWorkflow

async def main():
    temporal_addr = os.getenv("TEMPORAL_ADDRESS", "localhost:7233")
    client = await Client.connect(temporal_addr)

    worker = Worker(
        client,
        task_queue="seo-compute-queue",
        activities=[calculate_cannibalization, compute_content_score, fetch_site_pages],
        workflows=[CannibalizationWorkflow],
    )

    print(f"Starting Python Compute Worker on {temporal_addr}...")
    await worker.run()

if __name__ == "__main__":
    asyncio.run(main())
