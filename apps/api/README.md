# Local Music Backend

This is the common backend for both the Local Music web platform and mobile applications. It is built for high performance, scalability, and seamless multi-platform support.

## Tech Stack
- **Framework:** Fastify (for sub-2s latency)
- **Language:** TypeScript
- **Runtime:** Node.js (v24.11.0)
- **Monorepo Management:** npm Workspaces (configured for monorepo development)
- **Pipelines:** Turbo (for efficient builds and testing)

## Main Services (Post-Launch Targets)
- **API Gateway:** Entry point for all requests.
- **Auth Service:** Keycloak-based authentication.
- **Catalogue Service:** Manages metadata for 100M+ tracks using CockroachDB.
- **Stream Service:** Audio streaming via HLS/DASH.
- **Recommendation Engine:** Python-based ML service integration.
- **Social Service:** Real-time social graph using Neo4j and WebSockets.
- **Analytics:** Kafka/Flink/ClickHouse pipeline for metrics.

## Getting Started
1. Install dependencies: `npm install`
2. Run in development: `npm run dev --filter @local-music/api`

## Project Structure
- `src/app.ts`: Application configuration and plugin registration.
- `src/server.ts`: Entry point.
- `src/routes/`: API endpoint definitions.
- `src/plugins/`: Database/Auth initializations.
- `src/services/`: Business logic.
