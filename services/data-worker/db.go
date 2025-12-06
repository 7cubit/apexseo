package main

import (
    "context"
    "fmt"
    "os"
    "sync"
    "time"

    "github.com/ClickHouse/clickhouse-go/v2"
    "github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

var (
    chConn    clickhouse.Conn
    neoDriver neo4j.DriverWithContext
    once      sync.Once
)

func InitDB() error {
    var err error
    once.Do(func() {
        // Initialize ClickHouse
        chAddr := os.Getenv("CLICKHOUSE_ADDR")
        if chAddr == "" {
            chAddr = "localhost:9000"
        }

        chConn, err = clickhouse.Open(&clickhouse.Options{
            Addr: []string{chAddr},
            Auth: clickhouse.Auth{
                Database: "default",
                Username: "default",
                Password: "",
            },
            Debug: true,
            DialTimeout: 10 * time.Second,
        })
        if err != nil {
            return
        }

        if err = chConn.Ping(context.Background()); err != nil {
            return
        }

        // Initialize Neo4j
        neoUri := os.Getenv("NEO4J_URI")
        if neoUri == "" {
            neoUri = "bolt://localhost:7687"
        }
        
        neoDriver, err = neo4j.NewDriverWithContext(
            neoUri,
            neo4j.BasicAuth("neo4j", "password", ""),
        )
    })
    return err
}

func GetClickHouse() (clickhouse.Conn, error) {
    if chConn == nil {
        if err := InitDB(); err != nil {
            return nil, fmt.Errorf("failed to init db: %w", err)
        }
    }
    return chConn, nil
}

func GetNeo4j() (neo4j.DriverWithContext, error) {
    if neoDriver == nil {
        if err := InitDB(); err != nil {
            return nil, fmt.Errorf("failed to init db: %w", err)
        }
    }
    return neoDriver, nil
}
