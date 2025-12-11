import vector_utils
import numpy as np

def test_vectors():
    print("Testing Vector Utils...")
    
    # 1. Embedding Shape
    text = "SEO is important for ranking."
    emb = vector_utils.generate_embedding_local(text)
    print(f"Embedding length: {len(emb)}")
    assert len(emb) == 384, "Expected 384 dimensions for all-MiniLM-L6-v2"
    
    # 2. Similarity
    # "SEO" should be similar to "Search Engine Optimization"
    # "Banana" should be less similar
    e1 = vector_utils.generate_embedding_local("SEO strategies")
    e2 = vector_utils.generate_embedding_local("Search Engine Optimization tips")
    e3 = vector_utils.generate_embedding_local("Banana recipes")
    
    sim_high = vector_utils.cosine_similarity(e1, e2)
    sim_low = vector_utils.cosine_similarity(e1, e3)
    
    print(f"Similarity (SEO vs SEO): {sim_high:.4f}")
    print(f"Similarity (SEO vs Banana): {sim_low:.4f}")
    
    assert sim_high > 0.4, "Expected high similarity"
    assert sim_low < 0.3, "Expected low similarity"
    assert sim_high > sim_low, "Expected SEO to be closer to SEO than Banana"

    # 3. Centroid
    print("\nTesting Centroid...")
    embeddings = [e1, e2, e3]
    centroid = vector_utils.calculate_centroid(embeddings)
    assert len(centroid) == 384, "Centroid should have same dimension"
    
    # Centroid should be somewhat similar to all (or at least valid)
    dist_to_e1 = vector_utils.cosine_similarity(centroid, e1)
    print(f"Centroid Similarity to e1: {dist_to_e1:.4f}")
    assert dist_to_e1 > 0, "Centroid should have positive similarity"

    # 4. Batch Search
    print("\nTesting Batch Search...")
    # e1 is "SEO strategies"
    # e2 is "Search Engine Optimization tips" (Should match)
    # e3 is "Banana recipes" (Should NOT match)
    
    # Search for something like e1
    query = vector_utils.generate_embedding_local("Marketing and SEO")
    
    candidates = [e1, e2, e3]
    # Expect e1 and e2 to be high, e3 to be low
    matches = vector_utils.batch_similarity_search(query, candidates, threshold=0.3)
    print(f"Indices found (threshold 0.3): {matches}")
    
    assert 0 in matches, "Should match e1"
    assert 1 in matches, "Should match e2"
    # e3 might or might not match depending on noise, but let's check high threshold
    
    matches_high = vector_utils.batch_similarity_search(query, candidates, threshold=0.8)
    print(f"Indices found (threshold 0.8): {matches_high}")
    # Might find 0 or none depending on strictness, but let's ensure code runs
    
    print("✅ Vector Logic Verified")

if __name__ == "__main__":
    test_vectors()
