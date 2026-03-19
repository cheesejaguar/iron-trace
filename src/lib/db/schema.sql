-- Iron Trace Database Schema (Vercel Postgres / Neon)
-- All tables include created_at and updated_at with automatic triggers.

-- ===========================================================================
-- Alerts: canonical log of all ingested red alerts
-- ===========================================================================
CREATE TABLE IF NOT EXISTS alerts (
  id            UUID PRIMARY KEY,
  timestamp     TIMESTAMPTZ NOT NULL,
  regions       JSONB NOT NULL,          -- string[]
  centroids     JSONB NOT NULL,          -- {lat, lng}[]
  threat_category TEXT NOT NULL,          -- MISSILES | HOSTILE_AIRCRAFT | UAV | ROCKETS | UNKNOWN
  countdown_seconds INTEGER NOT NULL,
  raw_payload   JSONB,
  regions_hash  TEXT NOT NULL,            -- SHA-256 of sorted regions for dedup
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT alerts_unique_event UNIQUE (timestamp, regions_hash)
);

CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_category ON alerts (threat_category);

-- ===========================================================================
-- Engagements: clustered engagement events with fitted ellipse
-- ===========================================================================
CREATE TABLE IF NOT EXISTS engagements (
  id              UUID PRIMARY KEY,
  window_start    TIMESTAMPTZ NOT NULL,
  window_end      TIMESTAMPTZ NOT NULL,
  alert_ids       UUID[] NOT NULL,
  centroid_lat    DOUBLE PRECISION,
  centroid_lng    DOUBLE PRECISION,
  ellipse_params  JSONB,                 -- {semiMajorKm, semiMinorKm, eccentricity, angle}
  classification  TEXT NOT NULL,          -- BALLISTIC_MISSILE | SHORT_RANGE_ROCKET | ...
  munition_type   TEXT,
  confidence_score DOUBLE PRECISION,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_engagements_window ON engagements (window_start DESC);
CREATE INDEX IF NOT EXISTS idx_engagements_classification ON engagements (classification);

-- ===========================================================================
-- Trajectories: back-traced arcs with confidence metadata
-- ===========================================================================
CREATE TABLE IF NOT EXISTS trajectories (
  id                    UUID PRIMARY KEY,
  engagement_id         UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  back_azimuth          DOUBLE PRECISION NOT NULL,
  arc_geojson           JSONB NOT NULL,        -- GeoJSON LineString
  uncertainty_cone      JSONB NOT NULL,        -- GeoJSON Polygon
  confidence_score      DOUBLE PRECISION NOT NULL,
  estimated_origin_region TEXT NOT NULL,        -- IRAN | LEBANON | SYRIA | UNKNOWN
  distance_km           DOUBLE PRECISION NOT NULL,
  munition_class        TEXT,
  matched_munition      TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trajectories_engagement ON trajectories (engagement_id);
CREATE INDEX IF NOT EXISTS idx_trajectories_origin ON trajectories (estimated_origin_region);

-- ===========================================================================
-- Launch Sites: reference database of known/suspected sites
-- ===========================================================================
CREATE TABLE IF NOT EXISTS launch_sites (
  id                  SERIAL PRIMARY KEY,
  name                TEXT NOT NULL,
  country             TEXT NOT NULL,
  lat                 DOUBLE PRECISION NOT NULL,
  lng                 DOUBLE PRECISION NOT NULL,
  associated_munitions TEXT[] NOT NULL,
  source              TEXT NOT NULL,
  last_updated        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================================================
-- Auto-update updated_at trigger
-- ===========================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['alerts', 'engagements', 'trajectories', 'launch_sites'])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_update_%s ON %I; CREATE TRIGGER trg_update_%s BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END;
$$;

-- ===========================================================================
-- Data retention: purge alerts older than 90 days
-- ===========================================================================
-- Run via Vercel Cron Job:
-- DELETE FROM alerts WHERE created_at < NOW() - INTERVAL '90 days';
-- DELETE FROM engagements WHERE created_at < NOW() - INTERVAL '90 days';
-- DELETE FROM trajectories WHERE created_at < NOW() - INTERVAL '90 days';
