// 1. Get Top Pages by PageRank in a Site
// Uses the page_rank_index
MATCH (p:Page)-[:BELONGS_TO]->(s:Site {id: $siteId})
RETURN p.url, p.title, p.pageRank
ORDER BY p.pageRank DESC
LIMIT 10;

// 2. Find Orphan Pages (No incoming internal links)
// Optimized to check degree of incoming relationships
MATCH (p:Page)-[:BELONGS_TO]->(s:Site {id: $siteId})
WHERE size((p)<-[:LINKS_TO]-()) = 0
RETURN p.url, p.title;

// 3. Cluster Analysis
// Aggregate pages by community ID
MATCH (p:Page)-[:BELONGS_TO]->(s:Site {id: $siteId})
RETURN p.communityId, count(p) as pageSize, collect(p.url)[0..5] as examples
ORDER BY pageSize DESC;

// 4. Link Depth Analysis (BFS)
// Find pages at specific depths from the home page
MATCH (home:Page {url: $homeUrl})-[:BELONGS_TO]->(s:Site {id: $siteId})
CALL apoc.path.subgraphNodes(home, {
    relationshipFilter: 'LINKS_TO>',
    minLevel: 1,
    maxLevel: 3
})
YIELD node
RETURN node.url, node.depth; // Note: depth calculation might need custom logic or expansion

// 5. Keyword Co-occurrence
// Find keywords that frequently appear together on the same pages
MATCH (k1:Keyword)<-[:HAS_KEYWORD]-(p:Page)-[:HAS_KEYWORD]->(k2:Keyword)
WHERE k1.id < k2.id
RETURN k1.text, k2.text, count(p) as frequency
ORDER BY frequency DESC
LIMIT 20;
