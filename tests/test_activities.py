import pytest
import numpy as np
from unittest.mock import Mock, patch, MagicMock
import asyncio

# Import functions to test
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'services', 'compute-worker'))

from vector_utils import (
    generate_embedding_local,
    cosine_similarity,
    calculate_centroid,
    batch_similarity_search
)
from activities import (
    calculate_cannibalization,
    compute_content_score
)

# Test fixtures
@pytest.fixture
def sample_embeddings():
    """Sample embeddings for testing."""
    return [
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
    ]

@pytest.fixture
def mock_neo4j_driver():
    """Mock Neo4j driver for testing."""
    with patch('activities.GraphDatabase.driver') as mock_driver:
        mock_session = MagicMock()
        mock_driver.return_value.session.return_value.__enter__.return_value = mock_session
        yield mock_driver, mock_session

@pytest.fixture
def mock_clickhouse_client():
    """Mock ClickHouse client for testing."""
    with patch('activities.Client') as mock_client:
        yield mock_client

class TestVectorUtils:
    """Test suite for vector utility functions."""
    
    def test_identical_texts_return_perfect_similarity(self):
        """Identical texts should have cosine similarity of 1.0."""
        text = "This is a test sentence about SEO optimization and content marketing."
        
        emb1 = generate_embedding_local(text)
        emb2 = generate_embedding_local(text)
        
        similarity = cosine_similarity(emb1, emb2)
        
        assert isinstance(similarity, float), "Similarity must be a float"
        assert 0.99 <= similarity <= 1.01, f"Expected ~1.0, got {similarity}"
    
    def test_different_topics_have_low_similarity(self):
        """Completely different topics should have low similarity."""
        emb1 = generate_embedding_local("Python programming tutorial for beginners")
        emb2 = generate_embedding_local("Chocolate cake recipe with vanilla frosting")
        
        similarity = cosine_similarity(emb1, emb2)
        
        assert similarity < 0.3, f"Expected low similarity, got {similarity}"
    
    def test_similar_content_detected(self):
        """Similar SEO content should have high similarity."""
        emb1 = generate_embedding_local("Best keyword research tools for SEO in 2024")
        emb2 = generate_embedding_local("Top SEO keyword research software and tools")
        
        similarity = cosine_similarity(emb1, emb2)
        
        assert similarity > 0.65, f"Expected high similarity, got {similarity}"
    
    def test_centroid_calculation(self, sample_embeddings):
        """Centroid should be the average of input embeddings."""
        centroid = calculate_centroid(sample_embeddings)
        expected = [0.333, 0.333, 0.333]
        
        np.testing.assert_array_almost_equal(centroid, expected, decimal=2)
    
    def test_centroid_with_two_vectors(self):
        """Centroid of two vectors should be their midpoint."""
        embeddings = [
            [1.0, 0.0],
            [0.0, 1.0]
        ]
        centroid = calculate_centroid(embeddings)
        expected = [0.5, 0.5]
        
        np.testing.assert_array_almost_equal(centroid, expected, decimal=2)
    
    def test_batch_similarity_search_finds_matches(self):
        """Should return indices of vectors above threshold."""
        query = [1.0, 0.0, 0.0]
        candidates = [
            [0.9, 0.1, 0.0],   # High similarity (index 0)
            [0.1, 0.9, 0.0],   # Low similarity
            [0.95, 0.05, 0.0], # High similarity (index 2)
            [0.0, 0.0, 1.0],   # Low similarity
        ]
        
        matches = batch_similarity_search(query, candidates, threshold=0.85)
        
        assert matches == [0, 2], f"Expected indices [0, 2], got {matches}"
    
    def test_batch_similarity_search_no_matches(self):
        """Should return empty list when no vectors exceed threshold."""
        query = [1.0, 0.0, 0.0]
        candidates = [
            [0.1, 0.9, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 0.0, 1.0],
        ]
        
        matches = batch_similarity_search(query, candidates, threshold=0.95)
        
        assert matches == [], f"Expected empty list, got {matches}"
    
    def test_empty_string_handling(self):
        """Empty strings should not crash and return valid embedding."""
        emb = generate_embedding_local("")
        
        assert isinstance(emb, list), "Must return a list"
        assert len(emb) == 384, f"Expected 384 dimensions, got {len(emb)}"
        assert all(isinstance(x, float) for x in emb), "All values must be floats"
    
    def test_very_long_text_handling(self):
        """Should handle very long texts without error."""
        long_text = "SEO optimization " * 1000  # 2000+ words
        
        emb = generate_embedding_local(long_text)
        
        assert isinstance(emb, list)
        assert len(emb) == 384
    
    def test_cosine_similarity_range(self):
        """Cosine similarity should always be between -1 and 1."""
        emb1 = generate_embedding_local("random text one")
        emb2 = generate_embedding_local("random text two")
        
        similarity = cosine_similarity(emb1, emb2)
        
        assert -1.0 <= similarity <= 1.0, f"Similarity {similarity} out of valid range"
    
    def test_cosine_similarity_symmetry(self):
        """Similarity(A, B) should equal Similarity(B, A)."""
        emb1 = generate_embedding_local("first text")
        emb2 = generate_embedding_local("second text")
        
        sim1 = cosine_similarity(emb1, emb2)
        sim2 = cosine_similarity(emb2, emb1)
        
        assert abs(sim1 - sim2) < 0.0001, "Cosine similarity must be symmetric"

class TestCannibalizationActivity:
    """Test suite for calculate_cannibalization activity."""
    
    @pytest.mark.asyncio
    async def test_cannibalization_detection_basic(self, mock_neo4j_driver):
        """Test basic cannibalization detection logic."""
        mock_driver, mock_session = mock_neo4j_driver
        
        # Mock Neo4j query results - two similar pages with different keywords
        mock_pages = [
            {
                'id': 'page1',
                'url': 'https://example.com/page1',
                'embedding': [1.0, 0.0, 0.0],
                'keyword': 'seo tools'
            },
            {
                'id': 'page2',
                'url': 'https://example.com/page2',
                'embedding': [0.95, 0.05, 0.0],  # Very similar to page1
                'keyword': 'keyword research'  # Different keyword
            }
        ]
        
        mock_session.run.return_value = iter(mock_pages)
        
        # Call function
        result = await calculate_cannibalization('test-site-123')
        
        # Assertions
        assert 'conflicts' in result
        assert 'total_conflicts' in result
        assert 'pages_analyzed' in result
        assert result['pages_analyzed'] == 2
        assert result['total_conflicts'] >= 0
    
    @pytest.mark.asyncio
    async def test_no_cannibalization_different_content(self, mock_neo4j_driver):
        """Test that different content doesn't trigger false positives."""
        mock_driver, mock_session = mock_neo4j_driver
        
        # Mock pages with very different embeddings
        mock_pages = [
            {
                'id': 'page1',
                'url': 'https://example.com/page1',
                'embedding': [1.0, 0.0, 0.0],
                'keyword': 'seo tools'
            },
            {
                'id': 'page2',
                'url': 'https://example.com/page2',
                'embedding': [0.0, 1.0, 0.0],  # Orthogonal
                'keyword': 'content marketing'
            }
        ]
        
        mock_session.run.return_value = iter(mock_pages)
        
        result = await calculate_cannibalization('test-site-123')
        
        assert result['total_conflicts'] == 0
        assert result['conflicts'] == {}
    
    @pytest.mark.asyncio
    async def test_same_keyword_not_cannibalization(self, mock_neo4j_driver):
        """Test that similar pages targeting the same keyword are not flagged."""
        mock_driver, mock_session = mock_neo4j_driver
        
        mock_pages = [
            {
                'id': 'page1',
                'url': 'https://example.com/page1',
                'embedding': [1.0, 0.0, 0.0],
                'keyword': 'seo tools'
            },
            {
                'id': 'page2',
                'url': 'https://example.com/page2',
                'embedding': [0.95, 0.05, 0.0],
                'keyword': 'seo tools'  # Same keyword
            }
        ]
        
        mock_session.run.return_value = iter(mock_pages)
        
        result = await calculate_cannibalization('test-site-123')
        
        # Should not flag as cannibalization (same keyword is intentional)
        assert result['total_conflicts'] == 0
    
    @pytest.mark.asyncio
    async def test_empty_site_handling(self, mock_neo4j_driver):
        """Test handling of site with no pages."""
        mock_driver, mock_session = mock_neo4j_driver
        
        mock_session.run.return_value = iter([])  # No pages
        
        result = await calculate_cannibalization('empty-site')
        
        assert result['pages_analyzed'] == 0
        assert result['total_conflicts'] == 0
        assert result['conflicts'] == {}

class TestContentScoreActivity:
    """Test suite for compute_content_score activity."""
    
    @pytest.mark.asyncio
    @patch('activities.generate_embedding_local')
    async def test_content_score_calculation(self, mock_gen_embed, mock_clickhouse_client, mock_neo4j_driver):
        """Test content scoring against competitors."""
        mock_ch = mock_clickhouse_client
        mock_driver, mock_session = mock_neo4j_driver
        
        # Mock embedding generation to return 3D vector compatible with mock data
        mock_gen_embed.return_value = [0.99, 0.01, 0.0]
        
        # Mock ClickHouse results - competitor embeddings
        mock_serp_results = [
            ('https://competitor1.com', [1.0, 0.0, 0.0]),
            ('https://competitor2.com', [0.9, 0.1, 0.0]),
            ('https://competitor3.com', [0.95, 0.05, 0.0]),
        ]
        
        mock_ch.return_value.execute.return_value = mock_serp_results
        
        # Call function with similar content
        score = await compute_content_score(
            content="This is content about SEO tools and optimization",
            target_keyword="seo tools",
            site_id="test-site",
            page_url="https://example.com/page"
        )
        
        # Assertions
        assert isinstance(score, float)
        assert 0.0 <= score <= 100.0, f"Score {score} out of valid range"
    
    @pytest.mark.asyncio
    @patch('activities.generate_embedding_local')
    async def test_no_competitor_data_returns_neutral_score(self, mock_gen_embed, mock_clickhouse_client, mock_neo4j_driver):
        """Test that missing competitor data returns score of 50."""
        mock_ch = mock_clickhouse_client
        mock_driver, mock_session = mock_neo4j_driver
        
        mock_gen_embed.return_value = [1.0, 0.0, 0.0]
        
        # Mock empty ClickHouse results
        mock_ch.return_value.execute.return_value = []
        
        score = await compute_content_score(
            content="Test content",
            target_keyword="nonexistent keyword",
            site_id="test-site",
            page_url="https://example.com/page"
        )
        
        assert score == 50.0, "Should return neutral score when no competitor data"
    
    @pytest.mark.asyncio
    @patch('activities.generate_embedding_local')
    async def test_neo4j_update_called(self, mock_gen_embed, mock_clickhouse_client, mock_neo4j_driver):
        """Test that Neo4j is updated with the calculated score."""
        mock_ch = mock_clickhouse_client
        mock_driver, mock_session = mock_neo4j_driver
        
        mock_gen_embed.return_value = [1.0, 0.0, 0.0]
        
        mock_ch.return_value.execute.return_value = [
            ('https://comp.com', [1.0, 0.0, 0.0])
        ]
        
        score = await compute_content_score(
            content="Test content",
            target_keyword="test",
            site_id="site-1",
            page_url="https://example.com/test"
        )
        
        # Verify Neo4j session.run was called
        assert mock_session.run.called, "Neo4j update query should be called"
