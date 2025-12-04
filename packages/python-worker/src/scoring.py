
import numpy as np
from sklearn.cluster import KMeans
import logging

logger = logging.getLogger(__name__)

def calculate_tspr(project_id: str) -> dict:
    """
    Simulates running Topic-Sensitive PageRank on Neo4j.
    In a real implementation, this would call the Neo4j GDS library.
    Returns a dictionary mapping URL to TSPR score.
    """
    logger.info(f"Calculating TSPR for project {project_id}")
    # Mock implementation: Return random scores for demo
    # In production: driver.session().run("CALL gds.pageRank.write(...)")
    return {"status": "success", "message": "TSPR calculated"}

def cluster_content(embeddings: list[dict]) -> list[dict]:
    """
    Clusters content based on embeddings using K-Means.
    embeddings: list of {url: str, embedding: list[float]}
    Returns: list of {url: str, cluster_id: int}
    """
    if not embeddings:
        return []

    logger.info(f"Clustering {len(embeddings)} pages")
    
    # Extract vectors
    X = np.array([item['embedding'] for item in embeddings])
    
    # Determine K (simple heuristic: sqrt(N/2) or max 5)
    n_clusters = min(5, max(2, int(len(embeddings) ** 0.5)))
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    kmeans.fit(X)
    
    results = []
    for i, item in enumerate(embeddings):
        results.append({
            "url": item['url'],
            "cluster_id": int(kmeans.labels_[i])
        })
        
    return results

def calculate_content_depth(text: str) -> float:
    """
    Calculates a simple content depth score based on length and entity density.
    This is a heuristic placeholder for a more advanced NLP model.
    """
    if not text:
        return 0.0
        
    word_count = len(text.split())
    # Simple logistic function to map word count to 0-100
    # 500 words -> ~50, 1000 words -> ~88, 2000 words -> ~98
    score = 100 / (1 + np.exp(-0.002 * (word_count - 500)))
    
    return float(score)

def calculate_composite_score(tspr: float, depth: float, risk: float = 0, ux: float = 100) -> float:
    """
    Calculates the final Experience-Authority Score.
    Weights: TSPR (Authority) 40%, Depth (Content) 40%, UX 20%, Risk (Penalty)
    """
    # Normalize TSPR to 0-100 if it isn't already (assuming raw PR is small, scaling needed)
    # For this mock, assume TSPR input is already 0-100 equivalent or we scale it.
    # Let's assume TSPR is 0-10.
    authority_score = min(100, tspr * 10)
    
    weighted_score = (authority_score * 0.4) + (depth * 0.4) + (ux * 0.2)
    final_score = max(0, weighted_score - risk)
    
    return float(final_score)
