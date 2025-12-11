"""
Vector utility functions for ApexSEO content analysis.
Handles embedding generation and similarity calculations.
"""

import numpy as np
from typing import List, Optional
from sentence_transformers import SentenceTransformer
import openai
from openai import AsyncOpenAI
import os

# Initialize model once (global)
_model: Optional[SentenceTransformer] = None

def _get_model() -> SentenceTransformer:
    """Lazy load sentence transformer model."""
    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def generate_embedding_local(text: str) -> List[float]:
    """
    Generate embedding using local sentence-transformers model.
    
    Args:
        text: Input text to embed
        
    Returns:
        List of 384 float values (embedding vector)
    """
    if not text or not text.strip():
        # Return zero vector of dimension 384
        return [0.0] * 384
        
    model = _get_model()
    # clean text slightly
    clean_text = text.replace("\n", " ").strip()
    embedding = model.encode(clean_text)
    return embedding.tolist()

async def generate_embedding_openai(text: str, api_key: str) -> List[float]:
    """
    Generate embedding using OpenAI API.
    
    Args:
        text: Input text to embed
        api_key: OpenAI API key
        
    Returns:
        List of float values (embedding vector)
    """
    if not text or not text.strip():
        return []

    client = AsyncOpenAI(api_key=api_key)
    
    try:
        response = await client.embeddings.create(
            input=text.replace("\n", " "),
            model="text-embedding-3-small"
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"OpenAI Embedding Error: {e}")
        # In production might want to re-raise or return empty
        return []

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate cosine similarity using numpy.
    
    Args:
        vec1: First vector
        vec2: Second vector
        
    Returns:
        float between 0.0 and 1.0
    """
    if not vec1 or not vec2:
        return 0.0
        
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
        
    return float(np.dot(v1, v2) / (norm1 * norm2))

def calculate_centroid(embeddings: List[List[float]]) -> List[float]:
    """
    Calculate average of multiple embeddings.
    
    Args:
        embeddings: List of embedding vectors
        
    Returns:
        Centroid embedding vector
    """
    if not embeddings:
        return []
        
    matrix = np.array(embeddings)
    centroid = np.mean(matrix, axis=0)
    return centroid.tolist()

def batch_similarity_search(query_embedding: List[float], candidate_embeddings: List[List[float]], threshold: float = 0.85) -> List[int]:
    """
    Find all candidates above similarity threshold.
    
    Args:
        query_embedding: Target vector
        candidate_embeddings: List of vectors to search against
        threshold: Minimum similarity score (default 0.85)
        
    Returns:
        List of indices that match
    """
    if not query_embedding or not candidate_embeddings:
        return []
        
    query = np.array(query_embedding)
    candidates = np.array(candidate_embeddings)
    
    # Normalize query
    query_norm = np.linalg.norm(query)
    if query_norm == 0:
        return []
    query_normalized = query / query_norm
    
    # Normalize candidates
    # Handle zero norms in candidates to avoid division by zero
    candidate_norms = np.linalg.norm(candidates, axis=1)
    # Create a safe divisor (replace 0 with 1 to avoid runtime warning, outcome will be 0 anyway due to dot product)
    safe_norms = np.where(candidate_norms == 0, 1, candidate_norms)
    candidates_normalized = candidates / safe_norms[:, np.newaxis]
    
    # Dot product of normalized vectors = Cosine Similarity
    similarities = np.dot(candidates_normalized, query_normalized)
    
    # Filter indices where norm was 0 (similarity is effectively 0)
    # (Checking against threshold usually handles this if threshold > 0)
    
    # Find indices > threshold
    indices = np.where(similarities > threshold)[0]
    return indices.tolist()
