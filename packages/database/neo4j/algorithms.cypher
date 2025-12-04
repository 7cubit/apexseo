// 1. Project Graph for PageRank
// Create a graph projection of Pages and LINKS_TO relationships
CALL gds.graph.project(
  'pageGraph',
  'Page',
  'LINKS_TO'
);

// 2. Run PageRank
// Calculate PageRank and write it back to the 'pageRank' property
CALL gds.pageRank.write('pageGraph', {
  maxIterations: 20,
  dampingFactor: 0.85,
  writeProperty: 'pageRank'
});

// 3. Project Graph for Community Detection
// Create a graph projection of Pages and LINKS_TO relationships (undirected for community detection usually, but directed works too)
CALL gds.graph.project(
  'communityGraph',
  'Page',
  {
    LINKS_TO: {
      orientation: 'UNDIRECTED'
    }
  }
);

// 4. Run Louvain Community Detection
// Detect communities and write the 'communityId' property
CALL gds.louvain.write('communityGraph', {
  writeProperty: 'communityId'
});

// 5. Shortest Path (Dijkstra)
// Find the shortest path between two pages (Source and Target need to be defined parameters)
// MATCH (source:Page {url: $sourceUrl}), (target:Page {url: $targetUrl})
// CALL gds.shortestPath.dijkstra.stream('pageGraph', {
//     sourceNode: source,
//     targetNode: target
// })
// YIELD index, sourceNode, targetNode, totalCost, nodeIds, costs, path
// RETURN index, totalCost, nodeIds, costs, path;

// 6. Cleanup
// Drop the projected graphs to free up memory
CALL gds.graph.drop('pageGraph');
CALL gds.graph.drop('communityGraph');
