import { driver, DATABASE } from '../driver';

export class GraphAlgoRepository {
  static async getPillarPages(projectId: string): Promise<string[]> {
    if (!driver) return [];
    const session = driver.session({ database: DATABASE });
    try {
      // Find top 3 pages by indegree for each cluster
      const result = await session.run(`
        MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
        WHERE p.cluster IS NOT NULL
        WITH p, COUNT { (p)<-[:LINKS_TO]-() } as indegree
        ORDER BY indegree DESC
        WITH p.cluster as cluster, collect(p.url)[0..3] as topUrls
        UNWIND topUrls as url
        RETURN url
      `, { projectId });

      return result.records.map(r => r.get('url'));
    } finally {
      await session.close();
    }
  }

  static async runPageRank(projectId: string) {
    if (!driver) return null;
    const session = driver.session({ database: DATABASE });

    try {
      // 1. Calculate OutDegree (Pre-computation)
      await session.run(`
        MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
        OPTIONAL MATCH (p)-[:LINKS_TO]->(target:Page)
        WHERE (target)-[:BELONGS_TO]->(:Project {id: $projectId})
        WITH p, count(target) as outDegree
        SET p.outDegree = CASE WHEN outDegree = 0 THEN 0.5 ELSE outDegree END 
        // 0.5 to avoid division by zero, effectively a sink node handling
      `, { projectId });

      // 2. Initialize PR
      await session.run(`
        MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
        SET p.pr = 1.0
      `, { projectId });

      // 3. Iterate (20 times)
      for (let i = 0; i < 20; i++) {
        await session.run(`
            MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
            OPTIONAL MATCH (source:Page)-[:LINKS_TO]->(p)
            WHERE (source)-[:BELONGS_TO]->(:Project {id: $projectId})
            WITH p, collect(source) as sources
            WITH p, sources, 0.85 as d
            WITH p, d, 
                 reduce(s = 0.0, x IN sources | s + x.pr / x.outDegree) as sumPr
            SET p.newPr = (1-d) + d * sumPr
        `, { projectId });

        await session.run(`
            MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
            SET p.pr = p.newPr
        `, { projectId });
      }

      // 4. Cleanup
      await session.run(`
        MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
        REMOVE p.outDegree, p.newPr
      `, { projectId });

    } catch (error) {
      console.error("PageRank failed:", error);
    } finally {
      await session.close();
    }
  }

  static async runTSPR(projectId: string, seedUrls: string[]) {
    if (!driver) return null;
    const session = driver.session({ database: DATABASE });

    try {
      // 1. Calculate OutDegree (Pre-computation)
      await session.run(`
        MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
        OPTIONAL MATCH (p)-[:LINKS_TO]->(target:Page)
        WHERE (target)-[:BELONGS_TO]->(:Project {id: $projectId})
        WITH p, count(target) as outDegree
        SET p.outDegree = CASE WHEN outDegree = 0 THEN 0.5 ELSE outDegree END
      `, { projectId });

      // 2. Initialize TSPR
      await session.run(`
        MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
        SET p.tspr = 0.0
      `, { projectId });

      // 3. Iterate (20 times)
      const seedCount = seedUrls.length || 1; // Avoid division by zero

      for (let i = 0; i < 20; i++) {
        await session.run(`
            MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
            OPTIONAL MATCH (source:Page)-[:LINKS_TO]->(p)
            WHERE (source)-[:BELONGS_TO]->(:Project {id: $projectId})
            WITH p, collect(source) as sources
            WITH p, sources, 0.85 as d, $seedUrls as seeds, $seedCount as seedCount
            WITH p, d, seeds, seedCount,
                 reduce(s = 0.0, x IN sources | s + x.tspr / x.outDegree) as sumPr,
                 CASE WHEN p.url IN seeds THEN 1.0/seedCount ELSE 0.0 END as personalization
            SET p.newTspr = (1-d) * personalization + d * sumPr
        `, { projectId, seedUrls, seedCount });

        await session.run(`
            MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
            SET p.tspr = p.newTspr
        `, { projectId });
      }

      // 4. Cleanup
      await session.run(`
        MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
        REMOVE p.outDegree, p.newTspr
      `, { projectId });

    } catch (error) {
      console.error("TSPR failed:", error);
      throw error;
    } finally {
      await session.close();
    }
  }
}
