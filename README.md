# Iron Trace

Real-time OSINT platform that ingests Israel's Home Front Command (Pikud HaOref) red-alert sirens, applies computational geometry to identify ballistic missile threat corridors, and reverse-traces great-circle arcs to estimate launch origins.

## Features

- **Real-time Alert Ingestion** — Connects to Pikud HaOref API via SSE with automatic reconnection and deduplication
- **Geometric Analysis Engine** — DBSCAN spatial clustering, Khachiyan minimum bounding ellipse, Vincenty geodesic back-trace
- **Munition Classification** — Decision-tree classifier matching alert patterns against known munition signatures (Emad, Shahab-3, Fattah-1, etc.)
- **Launch Origin Estimation** — Great-circle back-trace with uncertainty cones, KDE heatmap of arc intersections
- **Interactive Map** — Leaflet dark-tile map with color-coded alert markers, engagement ellipses, trajectory arcs, and launch site overlays
- **Historical Replay** — Timeline scrubber with configurable playback speed (1x–60x)
- **Demo Mode** — Synthetic alert scenarios for development without Israeli IP access

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom dark theme
- **State**: Zustand
- **Map**: Leaflet + React-Leaflet + leaflet.geodesic
- **Validation**: Zod
- **Testing**: Vitest
- **Deployment**: Vercel (Edge Functions, optional Postgres)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (demo mode)
npm run dev

# Run tests
npm test

# Production build
npm run build
```

Open [http://localhost:3000](http://localhost:3000) — the app launches in demo mode with synthetic alerts.

## Environment Variables

Copy `.env.example` and configure as needed:

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_URL` | No | Vercel Postgres connection string (enables persistence) |
| `OREF_API_URL` | No | Override Pikud HaOref endpoint (default: `oref.org.il`) |
| `ALERT_SOURCE` | No | `oref` or `demo` (default: `demo`) |

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── alerts/
│   │   │   ├── stream/     # SSE endpoint (real-time)
│   │   │   ├── ingest/     # Upstream polling
│   │   │   ├── recent/     # Last N alerts
│   │   │   └── history/    # Historical query (Postgres)
│   │   ├── trajectories/   # Trajectory CRUD
│   │   └── health/         # Liveness check
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── map/                # Leaflet map components
│   │   ├── MapContainer    # Main map with dark tiles
│   │   ├── AlertMarkers    # Pulsing color-coded markers
│   │   ├── EngagementEllipse  # Fitted ellipse overlays
│   │   ├── TrajectoryArc   # Geodesic back-trace lines
│   │   ├── LaunchHeatmap   # KDE intensity overlay
│   │   └── LaunchSiteMarkers  # Known launch sites
│   ├── layout/             # UI panels
│   │   ├── TopBar          # Header with filters
│   │   ├── LeftPanel       # Alert feed
│   │   ├── RightPanel      # Analysis details
│   │   └── BottomTimeline  # Replay controls
│   └── ui/                 # Reusable components
├── lib/
│   ├── analysis/           # Geometric analysis engine
│   │   ├── haversine       # Distance & bearing
│   │   ├── temporal-clustering  # ±15s engagement windows
│   │   ├── dbscan          # Spatial clustering (ε=25km)
│   │   ├── khachiyan       # Min-area bounding ellipse
│   │   ├── classifier      # Munition decision tree
│   │   ├── vincenty        # WGS-84 geodesic formulae
│   │   ├── back-trace      # Azimuth disambiguation + arc projection
│   │   ├── confidence      # 5-factor composite scoring
│   │   ├── kde             # Kernel density estimation
│   │   └── pipeline        # Full orchestration
│   ├── alert-sources/      # Ingestion adapters
│   ├── alert-store.ts      # In-memory store with TTL
│   ├── replay/             # Historical replay engine
│   └── db/                 # Postgres persistence (optional)
├── stores/                 # Zustand client stores
├── hooks/                  # React hooks (SSE, pipeline)
├── data/                   # Static data
│   ├── gazetteer.ts        # Israeli localities (~100 entries)
│   ├── munitions.ts        # OSINT munition signatures
│   └── launch-sites.ts     # Known launch sites
└── types/                  # TypeScript type definitions
```

## Analysis Pipeline

1. **Temporal Clustering** — Groups alerts within ±15s windows into engagement events
2. **DBSCAN** — Spatially sub-clusters each window (ε=25km, minPts=3) using haversine distance
3. **Ellipse Fitting** — Khachiyan's algorithm computes minimum bounding ellipse per cluster
4. **Classification** — Decision tree: eccentricity → semi-major axis → countdown → temporal pattern
5. **Back-Trace** — Vincenty direct formula projects great-circle arc along disambiguated back-azimuth, distance bounded by munition maximum range
6. **Confidence** — Composite score from 5 weighted factors (cluster size, eccentricity, countdown consistency, munition match, temporal gradient)

## Color Coding

| Threat | Color | Hex |
|--------|-------|-----|
| Ballistic Missile | Red | `#DC143C` |
| Cruise Missile | Orange | `#FF8C00` |
| UAV | Gold | `#FFD700` |
| Rocket | Gray | `#8B8B8B` |

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

62 unit tests covering: haversine, temporal clustering, DBSCAN, Khachiyan ellipse, munition classifier, Vincenty geodesic, back-trace, confidence scoring, KDE, pipeline integration, and alert normalization.

## License

See [LICENSE](./LICENSE).
