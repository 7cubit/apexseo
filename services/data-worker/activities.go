package main

import (
	"context"
	"fmt"
    "time"
    "encoding/json"
    
    "github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type SerpData struct {
    Keyword string
    Items   []interface{}
}

func IngestSerpData(ctx context.Context, data SerpData) (string, error) {
    conn, err := GetClickHouse()
    if err != nil {
        return "", fmt.Errorf("failed to connect to ClickHouse: %w", err)
    }

    // Ensure table exists (idempotent)
    err = conn.Exec(ctx, `
        CREATE TABLE IF NOT EXISTS serp_results (
            timestamp DateTime,
            keyword String,
            rank UInt32,
            url String,
            title String,
            data String
        ) ENGINE = MergeTree() ORDER BY (keyword, timestamp)
    `)
    if err != nil {
        return "", fmt.Errorf("failed to create table: %w", err)
    }

    batch, err := conn.PrepareBatch(ctx, "INSERT INTO serp_results")
    if err != nil {
        return "", fmt.Errorf("failed to prepare batch: %w", err)
    }

    for i, item := range data.Items {
        itemMap, ok := item.(map[string]interface{})
        if !ok {
            continue
        }
        
        jsonBytes, _ := json.Marshal(item)
        
        // Basic mapping, assuming item has url/title
        url, _ := itemMap["url"].(string)
        title, _ := itemMap["title"].(string)
        
        err := batch.Append(
            time.Now(),
            data.Keyword,
            uint32(i+1),
            url,
            title,
            string(jsonBytes),
        )
        if err != nil {
            return "", err
        }
    }

    if err := batch.Send(); err != nil {
        return "", fmt.Errorf("failed to send batch: %w", err)
    }

    return fmt.Sprintf("Ingested %d items", len(data.Items)), nil
}

func GetGraphNeighbors(ctx context.Context, url string) ([]string, error) {
    driver, err := GetNeo4j()
    if err != nil {
        return nil, fmt.Errorf("failed to connect to Neo4j: %w", err)
    }

    session := driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
    defer session.Close(ctx)

    result, err := session.Run(ctx, `
        MATCH (p:Page {url: $url})-[:LINKS_TO]->(neighbor)
        RETURN neighbor.url as url
        LIMIT 10
    `, map[string]interface{}{"url": url})
    if err != nil {
        return nil, err
    }

    var neighbors []string
    for result.Next(ctx) {
        if val, ok := result.Record().Get("url"); ok {
            neighbors = append(neighbors, val.(string))
        }
    }

    return neighbors, nil
}
