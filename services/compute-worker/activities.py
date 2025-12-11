from neo4j import GraphDatabase
from temporalio import activity
from clickhouse_driver import Client
from vector_utils import cosine_similarity, generate_embedding_local, calculate_centroid
import os
import logging

logger = logging.getLogger(__name__)

@activity.defn
async def calculate_cannibalization(site_id: str) -> dict:
    """
    Detect keyword cannibalization using semantic similarity.
    
    Finds pages with high content overlap (>85% similar) but
    different target keywords, indicating cannibalization.
    
    Args:
        site_id: The site ID to analyze
        
    Returns:
        {
            "conflicts": {"page_url": ["conflicting_url_1", ...]},
            "total_conflicts": int,
            "pages_analyzed": int,
            "threshold": float
        }
    """
    threshold = float(os.getenv('SIMILARITY_THRESHOLD', '0.85'))
    uri = os.getenv('NEO4J_URI')
    user = os.getenv('NEO4J_USER')
    password = os.getenv('NEO4J_PASSWORD')
    
    driver = GraphDatabase.driver(uri, auth=(user, password))
    conflicts = {}
    conflict_count = 0
    
    try:
        with driver.session() as session:
            logger.info(f"Fetching pages for site {site_id}")
            
            result = session.run("""
                MATCH (p:Page {siteId: $site_id})
                WHERE p.embedding IS NOT NULL 
                  AND p.targetKeyword IS NOT NULL
                RETURN p.id as id, 
                       p.url as url, 
                       p.embedding as embedding, 
                       p.targetKeyword as keyword
                ORDER BY p.url
            """, site_id=site_id)
            
            pages = list(result)
            logger.info(f"Found {len(pages)} pages to analyze")
            
            session.run("""
                MATCH (p:Page {siteId: $site_id})-[r:CANNIBALIZES]->()
                DELETE r
            """, site_id=site_id)
            
            for i in range(len(pages)):
                page_conflicts = []
                
                for j in range(i + 1, len(pages)):
                    p1 = pages[i]
                    p2 = pages[j]
                    
                    if p1['keyword'] == p2['keyword']:
                        continue
                    
                    similarity = cosine_similarity(p1['embedding'], p2['embedding'])
                    
                    if similarity >= threshold:
                        conflict_count += 1
                        page_conflicts.append(p2['url'])
                        
                        session.run("""
                            MATCH (p1:Page {id: $id1}), (p2:Page {id: $id2})
                            CREATE (p1)-[r:CANNIBALIZES {
                                similarity: $similarity,
                                detectedAt: datetime(),
                                keyword1: $kw1,
                                keyword2: $kw2
                            }]->(p2)
                        """, id1=p1['id'], id2=p2['id'], 
                             similarity=similarity,
                             kw1=p1['keyword'], kw2=p2['keyword'])
                        
                        logger.warning(
                            f"Cannibalization: {p1['url']} ({p1['keyword']}) "
                            f"<-> {p2['url']} ({p2['keyword']}) | "
                            f"Similarity: {similarity:.2f}"
                        )
                
                if page_conflicts:
                    conflicts[p1['url']] = page_conflicts
            
            session.run("""
                MATCH (p:Page {siteId: $site_id})
                SET p.cannibalizationStatus = CASE 
                    WHEN EXISTS((p)-[:CANNIBALIZES]-()) THEN 'conflict'
                    ELSE 'ok'
                END
            """, site_id=site_id)
            
            logger.info(f"Analysis complete: {conflict_count} conflicts found")
    
    finally:
        driver.close()
    
    return {
        "conflicts": conflicts,
        "total_conflicts": conflict_count,
        "pages_analyzed": len(pages),
        "threshold": threshold
    }

@activity.defn
async def compute_content_score(
    content: str,
    target_keyword: str,
    site_id: str,
    page_url: str
) -> float:
    """
    Score content quality against top SERP competitors.
    
    Compares user content semantic similarity to the "ideal"
    competitor profile (centroid of top 10 ranking pages).
    
    Args:
        content: Cleaned page text content
        target_keyword: Target keyword for this page
        site_id: Site identifier
        page_url: Page URL for Neo4j update
        
    Returns:
        Score from 0-100 (higher = more aligned with top competitors)
    """
    logger.info(f"Computing content score for {page_url} (keyword: {target_keyword})")
    
    user_embedding = generate_embedding_local(content)
    
    ch_client = Client(
        host=os.getenv('CLICKHOUSE_HOST', 'localhost'),
        port=int(os.getenv('CLICKHOUSE_PORT', '9000')),
        user=os.getenv('CLICKHOUSE_USER', 'default'),
        password=os.getenv('CLICKHOUSE_PASSWORD', ''),
        database=os.getenv('CLICKHOUSE_DATABASE', 'apexseo')
    )
    
    score = 50.0
    competitor_embeddings = []
    
    try:
        query = """
            SELECT page_url, embedding 
            FROM serp_results 
            WHERE keyword = %(keyword)s 
            AND embedding IS NOT NULL
            ORDER BY position ASC 
            LIMIT 10
        """
        
        results = ch_client.execute(query, {'keyword': target_keyword})
        
        if len(results) > 0:
            competitor_embeddings = [row[1] for row in results]
            logger.info(f"Found {len(competitor_embeddings)} competitor embeddings")
            
            ideal_profile = calculate_centroid(competitor_embeddings)
            similarity = cosine_similarity(user_embedding, ideal_profile)
            score = round(similarity * 100, 2)
            logger.info(f"Content score calculated: {score}/100")
        else:
             logger.warning(f"No SERP data found for keyword: {target_keyword}")
             score = 50.0
        
    finally:
        ch_client.disconnect()
        

    
    uri = os.getenv('NEO4J_URI')
    neo_user = os.getenv('NEO4J_USER')
    neo_password = os.getenv('NEO4J_PASSWORD')
    driver = GraphDatabase.driver(uri, auth=(neo_user, neo_password))
    
    try:
        with driver.session() as session:
            session.run("""
                MATCH (p:Page {siteId: $site_id, url: $url})
                SET p.contentScore = $score,
                    p.contentScoreUpdatedAt = datetime(),
                    p.competitorCount = $comp_count
            """, site_id=site_id, url=page_url, score=score, 
                 comp_count=len(competitor_embeddings))
            
            logger.info(f"Updated Neo4j with content score for {page_url}")
    
    finally:
        driver.close()
    
    return score

@activity.defn
async def fetch_site_pages(site_id: str) -> list:
    """
    Fetch all pages for a site to enable scoring.
    """
    uri = os.getenv('NEO4J_URI')
    user = os.getenv('NEO4J_USER')
    password = os.getenv('NEO4J_PASSWORD')
    driver = GraphDatabase.driver(uri, auth=(user, password))
    
    try:
        with driver.session() as session:
            result = session.run("""
                MATCH (p:Page {siteId: $site_id})
                RETURN p.url as url, 
                       p.content as content, 
                       p.targetKeyword as target_keyword
            """, site_id=site_id)
            
            return [dict(record) for record in result]
    finally:
        driver.close()
