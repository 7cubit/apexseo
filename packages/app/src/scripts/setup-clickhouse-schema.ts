import { createClient } from '@clickhouse/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
    url: process.env.CLICKHOUSE_URL,
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD,
});

async function setupSchema() {
    console.log("Setting up ClickHouse Schema...");

    const tables = [
        `
    CREATE TABLE IF NOT EXISTS sites (
      site_id String,
      project_id String,
      url String,
      created_at DateTime DEFAULT now(),
      last_crawled DateTime DEFAULT now(),
      page_count UInt32 DEFAULT 0,
      link_count UInt32 DEFAULT 0
    ) ENGINE = MergeTree()
    ORDER BY site_id
    `,
        `
    CREATE TABLE IF NOT EXISTS pages (
      site_id String,
      page_id String,
      url String,
      status String,
      last_crawled DateTime DEFAULT now(),
      title String,
      h1 String,
      text String,
      word_count UInt32 DEFAULT 0,
      cluster_id String,
      pr Float32 DEFAULT 0.0,
      tspr Float32 DEFAULT 0.0,
      semantic_orphan UInt8 DEFAULT 0,
      max_claim_risk Float32 DEFAULT 0.0,
      high_risk_claim_count UInt32 DEFAULT 0
    ) ENGINE = MergeTree()
    ORDER BY (site_id, page_id)
    `,
        `
    CREATE TABLE IF NOT EXISTS page_embeddings (
      site_id String,
      page_id String,
      embedding Array(Float32),
      cluster_id String
    ) ENGINE = MergeTree()
    ORDER BY (site_id, page_id)
    `,
        `
    CREATE TABLE IF NOT EXISTS clusters (
      site_id String,
      cluster_id String,
      label String,
      size UInt32 DEFAULT 0,
      centroid_embedding Array(Float32),
      avg_tspr Float32 DEFAULT 0.0,
      created_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    ORDER BY (site_id, cluster_id)
    `,
        `
    CREATE TABLE IF NOT EXISTS link_suggestions (
      site_id String,
      from_page_id String,
      to_page_id String,
      similarity Float32,
      target_tspr Float32,
      score Float32,
      created_at DateTime DEFAULT now(),
      reason String
    ) ENGINE = MergeTree()
    ORDER BY (site_id, from_page_id, score)
    `,
        `
    CREATE TABLE IF NOT EXISTS claims (
      site_id String,
      claim_id String,
      page_id String,
      text String,
      subject String,
      relation String,
      object String,
      embedding Array(Float32),
      risk_score Float32,
      consensus_match_id String,
      created_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    ORDER BY (site_id, claim_id)
    `,
        `
    CREATE TABLE IF NOT EXISTS kb_entries (
      kb_id String,
      source String,
      subject String,
      relation String,
      object String,
      embedding Array(Float32),
      created_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    ORDER BY kb_id
    `,
        `
    CREATE TABLE IF NOT EXISTS ux_sessions (
      site_id String,
      session_id String,
      persona_id String,
      goal String,
      start_page_url String,
      start_time DateTime DEFAULT now(),
      end_time DateTime DEFAULT now(),
      steps UInt32 DEFAULT 0,
      success UInt8 DEFAULT 0,
      friction_score Float32 DEFAULT 0.0
    ) ENGINE = MergeTree()
    ORDER BY (site_id, session_id)
    `,
        `
    CREATE TABLE IF NOT EXISTS ux_events (
      site_id String,
      session_id String,
      step UInt32,
      page_id String,
      url String,
      action String,
      timestamp DateTime DEFAULT now(),
      notes String
    ) ENGINE = MergeTree()
    ORDER BY (site_id, session_id, timestamp)
    `
    ];

    for (const query of tables) {
        try {
            await client.query({ query, format: 'JSONEachRow' });
            console.log("Executed table creation query.");
        } catch (error) {
            console.error("Error creating table:", error);
        }
    }

    console.log("Schema setup complete.");
    await client.close();
}

setupSchema().catch(console.error);
