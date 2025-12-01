import os
import time
import requests
import clickhouse_connect
from temporalio import activity
from datetime import datetime

# Initialize ClickHouse client
def get_clickhouse_client():
    return clickhouse_connect.get_client(
        host=os.getenv('CLICKHOUSE_HOST', 'localhost'),
        port=int(os.getenv('CLICKHOUSE_PORT', 8123)),
        username=os.getenv('CLICKHOUSE_USER', 'default'),
        password=os.getenv('CLICKHOUSE_PASSWORD', ''),
        secure=os.getenv('CLICKHOUSE_SECURE', 'False').lower() == 'true'
    )

@activity.defn
async def fetch_html(url: str) -> dict:
    activity.logger.info(f"Fetching URL: {url}")
    
    try:
        # Respect robots.txt (simplified for now, ideally use a library)
        # Fetch content
        headers = {
            'User-Agent': 'ApexSEO-Crawler/1.0'
        }
        response = requests.get(url, headers=headers, timeout=30)
        
        status_code = response.status_code
        html = response.text
        response_headers = dict(response.headers)
        
        # Persist to ClickHouse
        try:
            client = get_clickhouse_client()
            
            # Ensure table exists
            client.command("""
                CREATE TABLE IF NOT EXISTS raw_crawl_log (
                    url String,
                    html String,
                    headers String,
                    status UInt16,
                    timestamp DateTime
                ) ENGINE = MergeTree()
                ORDER BY (timestamp, url)
            """)
            
            client.insert('raw_crawl_log', 
                [[url, html, str(response_headers), status_code, datetime.now()]], 
                column_names=['url', 'html', 'headers', 'status', 'timestamp']
            )
            activity.logger.info(f"Saved {url} to ClickHouse")
            
        except Exception as e:
            activity.logger.error(f"Failed to save to ClickHouse: {e}")
            # We don't fail the activity just because DB write failed, but maybe we should?
            # For now, let's return the result so the workflow can proceed.
        
        return {
            "url": url,
            "status": status_code,
            "html": html,
            "headers": response_headers
        }

    except Exception as e:
        activity.logger.error(f"Failed to fetch {url}: {e}")
        raise e
