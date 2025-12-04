import os
import time
import requests
import clickhouse_connect
from temporalio import activity
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from .scoring import calculate_tspr, cluster_content, calculate_content_depth, calculate_composite_score
from urllib.robotparser import RobotFileParser

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
async def fetch_robots_txt(domain_url: str) -> str:
    activity.logger.info(f"Fetching robots.txt for: {domain_url}")
    try:
        parsed = urlparse(domain_url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        robots_url = urljoin(base_url, "/robots.txt")
        
        response = requests.get(robots_url, timeout=10)
        if response.status_code == 200:
            return response.text
        return ""
    except Exception as e:
        activity.logger.warn(f"Failed to fetch robots.txt: {e}")
        return ""

@activity.defn
async def can_fetch(url: str, robots_content: str) -> bool:
    if not robots_content:
        return True
        
    try:
        rp = RobotFileParser()
        rp.parse(robots_content.splitlines())
        return rp.can_fetch("ApexSEO-Crawler/1.0", url)
    except Exception as e:
        activity.logger.warn(f"Error parsing robots.txt: {e}")
        return True

@activity.defn
async def fetch_html(url: str) -> dict:
    activity.logger.info(f"Fetching URL: {url}")
    
    try:
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
        
        return {
            "url": url,
            "status": status_code,
            "html": html,
            "headers": response_headers
        }

    except Exception as e:
        activity.logger.error(f"Failed to fetch {url}: {e}")
        raise e

@activity.defn
async def parse_html(html: str, url: str) -> dict:
    activity.logger.info(f"Parsing HTML for: {url}")
    try:
        soup = BeautifulSoup(html, 'html.parser')
        
        title = soup.title.string if soup.title else ""
        h1 = soup.find('h1').get_text().strip() if soup.find('h1') else ""
        
        # Extract meta description
        meta_desc = ""
        meta_tag = soup.find('meta', attrs={'name': 'description'})
        if meta_tag:
            meta_desc = meta_tag.get('content', '')

        # Extract canonical
        canonical_url = ""
        canonical_tag = soup.find('link', attrs={'rel': 'canonical'})
        if canonical_tag:
            canonical_url = canonical_tag.get('href', '')
            # Resolve relative canonicals
            canonical_url = urljoin(url, canonical_url)

        # Extract links
        links = []
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            text = a_tag.get_text().strip()
            rel = a_tag.get('rel', [])
            
            try:
                absolute_url = urljoin(url, href)
                parsed_base = urlparse(url)
                parsed_link = urlparse(absolute_url)
                
                is_internal = parsed_link.netloc == parsed_base.netloc
                
                links.append({
                    "url": absolute_url,
                    "text": text[:100], # Limit text length
                    "isInternal": is_internal,
                    "rel": " ".join(rel) if isinstance(rel, list) else str(rel)
                })
            except Exception:
                continue

        # Clean body text
        # Remove scripts and styles
        for script in soup(["script", "style"]):
            script.decompose()
        text = soup.get_text(separator=' ', strip=True)

        return {
            "url": url,
            "title": title,
            "h1": h1,
            "metaDescription": meta_desc,
            "canonicalUrl": canonical_url,
            "links": links,
            "text": text,
            "wordCount": len(text.split())
        }
    except Exception as e:
        activity.logger.error(f"Failed to parse HTML: {e}")
        raise e

@activity.defn
async def run_tspr(project_id: str) -> dict:
    return calculate_tspr(project_id)

@activity.defn
async def analyze_content_depth(text: str) -> float:
    return calculate_content_depth(text)

@activity.defn
async def compute_clusters(embeddings: list[dict]) -> list[dict]:
    return cluster_content(embeddings)

@activity.defn
async def compute_composite_score(tspr: float, depth: float, risk: float, ux: float) -> float:
    return calculate_composite_score(tspr, depth, risk, ux)
