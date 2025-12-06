FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY services/data-worker/ .
RUN go mod tidy
RUN go build -o data-worker .

FROM alpine:latest

WORKDIR /app
COPY --from=builder /app/data-worker .

CMD ["./data-worker"]
