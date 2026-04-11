# ======================
# STAGE 1: BUILD
# ======================
FROM golang:alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o app

# ======================
# STAGE 2: FINAL
# ======================
FROM alpine:latest

WORKDIR /app

# Install dependencies (CA Certs for HTTPS, TZData for timezones)
RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /app/app .

# Port backend
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["./app", "health"]

ENTRYPOINT ["./app"]
