import asyncio
import os
from temporalio.client import Client
from temporalio.worker import Worker
from src.activities import fetch_html
from dotenv import load_dotenv

load_dotenv()

async def main():
    temporal_host = os.getenv('TEMPORAL_ADDRESS', 'localhost:7233')
    print(f"Connecting to Temporal at {temporal_host}...")
    
    client = await Client.connect(temporal_host)

    worker = Worker(
        client,
        task_queue="seo-tasks-queue",
        activities=[fetch_html],
    )

    print("Python Worker started. Listening on 'seo-tasks-queue'...")
    await worker.run()

if __name__ == "__main__":
    asyncio.run(main())
