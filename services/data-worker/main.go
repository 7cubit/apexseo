package main

import (
	"log"
    "os"

	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

func main() {
    // Connect to Temporal
    clientOptions := client.Options{
        HostPort: os.Getenv("TEMPORAL_ADDRESS"),
    }
    if clientOptions.HostPort == "" {
        clientOptions.HostPort = "localhost:7233"
    }

	c, err := client.Dial(clientOptions)
	if err != nil {
		log.Fatalln("Unable to create client", err)
	}
	defer c.Close()

	w := worker.New(c, "seo-data-queue", worker.Options{})

	w.RegisterActivity(IngestSerpData)
	w.RegisterActivity(GetGraphNeighbors)

	err = w.Run(worker.InterruptCh())
	if err != nil {
		log.Fatalln("Unable to start worker", err)
	}
}
