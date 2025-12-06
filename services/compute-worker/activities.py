from temporalio import activity
from textblob import TextBlob
import random

@activity.defn
async def calculate_cannibalization(domain: str) -> dict:
    print(f"Calculating cannibalization for {domain}")
    
    # Mock logic: In reality, this would query Vector DB for semantic overlap
    # For now, we simulate finding some conflicts
    conflicts = []
    if "example" in domain:
        conflicts = [
            {"page1": "/blog/seo-tips", "page2": "/guides/seo-basics", "overlap_score": 0.85},
            {"page1": "/pricing", "page2": "/plans", "overlap_score": 0.92}
        ]
    
    return {
        "score": 0.85 if not conflicts else 0.65,
        "conflicts": conflicts
    }

@activity.defn
async def compute_content_score(content: str, keyword: str) -> float:
    print(f"Computing content score for keyword: {keyword}")
    
    blob = TextBlob(content)
    
    # 1. Keyword Density Check
    word_count = len(blob.words)
    if word_count == 0:
        return 0.0
        
    keyword_count = content.lower().count(keyword.lower())
    density = (keyword_count / word_count) * 100
    
    # 2. Sentiment Analysis (just for fun/signal)
    sentiment = blob.sentiment.polarity # -1 to 1
    
    # 3. Readability (avg sentence length)
    avg_sentence_len = sum(len(s.words) for s in blob.sentences) / len(blob.sentences) if blob.sentences else 0
    
    # Scoring Algorithm
    score = 50.0 # Base
    
    # Density bonus (target 1-2%)
    if 0.5 <= density <= 2.5:
        score += 20
    elif density > 2.5:
        score -= 10 # Keyword stuffing
        
    # Length bonus
    if word_count > 1000:
        score += 20
    elif word_count > 500:
        score += 10
        
    # Sentiment bonus (positive is generally better for marketing)
    if sentiment > 0:
        score += 5
        
    # Cap at 100
    return min(100.0, max(0.0, score))
