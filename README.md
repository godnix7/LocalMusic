# LOCAL MUSIC 🎵

A completely free, feature-rich music streaming platform designed to be a community-driven alternative to Spotify Premium.

## 🚀 Vision
Our mission is to make high-quality music streaming accessible to everyone, everywhere, for free. No ads on core features, no paywalls, and no compromises on audio quality.

---

## 🏗️ Project Structure
This is a monorepo containing multiple associated services and applications:
- **`apps/api`**: Common Backend for all platforms (Fastify + TypeScript).
- **`apps/web`**: React-based desktop-class web player.
- **`apps/mobile`**: Expo-based mobile application.
- **`packages/shared`**: Shared TypeScript types and business logic.
- **`packages/ui`**: Shared design system and UI components.

---

## 📡 Default Port Mapping
The following ports are used across the development environment to ensure service isolation:

| Service | Port | Description |
| :--- | :--- | :--- |
| **Backend API** | `3001` | Main Fastify API server |
| **Web Frontend** | `3000` | Vite Web Application |
| **Mobile (Metro)** | `8081` | Expo/React Native bundler |
| **CockroachDB** | `26257` | Primary SQL Database |
| **Keycloak (Auth)**| `8080` | Identity and Access Management |
| **Elasticsearch** | `9200` | Catalogue Search Engine |
| **Cassandra** | `9042` | Listening History & Metrics |
| **Neo4j** | `7474` | Social Graph Database |
| **Redis** | `6379` | Cache & Session Store |

---

## 🛠️ Development Setup
1. **Prerequisites**: Node.js v24+, npm 11+
2. **Install Dependencies**: 
   ```bash
   npm install
   ```
3. **Run Backend**:
   ```bash
   npm run dev --filter @local-music/api
   ```
4. **Run Web**:
   ```bash
   npm run dev --filter @local-music/web
   ```

---

## 📄 License
This project is for educational and community-driven purposes. Check the [LocalMusic_PRD.md](./LocalMusic_PRD.md) for detailed requirements and specifications.
