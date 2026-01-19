# Build stage
FROM golang:1.25.1-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod ./
COPY go.sum* ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o goapi main.go

# Final stage
FROM alpine:3.20

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

RUN adduser -D -u 10001 appuser

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/goapi ./goapi

# Copy swagger docs if they exist
COPY --from=builder /app/docs ./docs

USER appuser

# Expose port
EXPOSE 8080

# Prefer SIGTERM for graceful shutdown
STOPSIGNAL SIGTERM

# Run the application
CMD ["./goapi"]

