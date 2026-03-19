"use client";

import { useAlertStore } from "@/stores/alert-store";
import { useAnalysisStore } from "@/stores/analysis-store";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { ClassificationBadge } from "@/components/ui/ClassificationBadge";
import { EngagementClassification, ThreatCategory, type EngagementAnalysis } from "@/types";

function ConfidenceBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-iron-text/50 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-iron-ballistic/60 rounded-full transition-all"
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="text-[10px] text-iron-text/40 w-8 text-right font-mono">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

function EngagementDetail({ analysis }: { analysis: EngagementAnalysis }) {
  const ellipse = analysis.ellipses[0];
  const trajectory = analysis.trajectories[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
              analysis.classification === EngagementClassification.BALLISTIC_MISSILE
                ? "bg-iron-ballistic/20 text-iron-ballistic"
                : "bg-gray-500/20 text-gray-400"
            }`}
          >
            {analysis.classification.replace(/_/g, " ")}
          </span>
        </div>
        <div className="text-xs text-iron-text/40 font-mono">
          {analysis.munitionType}
        </div>
      </div>

      {/* Ellipse Parameters */}
      {ellipse && (
        <div>
          <h4 className="text-xs text-iron-text/50 uppercase tracking-wider mb-2">
            Ellipse Fit
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Semi-major" value={`${ellipse.semiMajorKm.toFixed(1)} km`} />
            <Stat label="Semi-minor" value={`${ellipse.semiMinorKm.toFixed(1)} km`} />
            <Stat label="Eccentricity" value={ellipse.eccentricity.toFixed(3)} />
            <Stat label="Azimuth" value={`${ellipse.angle.toFixed(1)}°`} />
          </div>
        </div>
      )}

      {/* Trajectory */}
      {trajectory && (
        <div>
          <h4 className="text-xs text-iron-text/50 uppercase tracking-wider mb-2">
            Back-Trace
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Origin" value={trajectory.estimatedOrigin} />
            <Stat label="Back-azimuth" value={`${trajectory.backAzimuth.toFixed(1)}°`} />
            <Stat label="Distance" value={`${trajectory.distanceKm.toFixed(0)} km`} />
            <Stat label="Points" value={`${analysis.engagement.alerts.length}`} />
          </div>
        </div>
      )}

      {/* Confidence */}
      <div>
        <h4 className="text-xs text-iron-text/50 uppercase tracking-wider mb-2">
          Confidence ({(analysis.confidence.total * 100).toFixed(0)}%)
        </h4>
        <div className="space-y-1.5">
          <ConfidenceBar value={analysis.confidence.clusterSize} label="Cluster" />
          <ConfidenceBar value={analysis.confidence.eccentricity} label="Eccent." />
          <ConfidenceBar value={analysis.confidence.countdownConsistency} label="Countdown" />
          <ConfidenceBar value={analysis.confidence.munitionMatch} label="Munition" />
          <ConfidenceBar value={analysis.confidence.temporalGradient} label="Temporal" />
        </div>
      </div>

      {/* Engagement alerts */}
      <div>
        <h4 className="text-xs text-iron-text/50 uppercase tracking-wider mb-1">
          Alerts ({analysis.engagement.alerts.length})
        </h4>
        <div className="space-y-0.5 max-h-32 overflow-y-auto iron-scrollbar">
          {analysis.engagement.alerts.map((a, i) => (
            <div key={i} className="text-xs text-iron-text/60 flex items-center gap-1">
              <ClassificationBadge category={a.threat_category} />
              <span className="truncate">{a.regions[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded px-2 py-1.5">
      <div className="text-[10px] text-iron-text/40 uppercase">{label}</div>
      <div className="text-sm font-mono font-bold text-iron-text">{value}</div>
    </div>
  );
}

export function RightPanel() {
  const selectedAlertId = useAlertStore((s) => s.selectedAlertId);
  const alerts = useAlertStore((s) => s.alerts);
  const selectedAlert = selectedAlertId
    ? alerts.find((a) => a.id === selectedAlertId)
    : null;

  const analyses = useAnalysisStore((s) => s.analyses);
  const selectedEngagementId = useAnalysisStore((s) => s.selectedEngagementId);
  const selectedAnalysis = selectedEngagementId
    ? analyses.find((a) => a.id === selectedEngagementId)
    : null;

  // Show layer toggles
  const showEllipses = useAnalysisStore((s) => s.showEllipses);
  const showTrajectories = useAnalysisStore((s) => s.showTrajectories);
  const showHeatmap = useAnalysisStore((s) => s.showHeatmap);
  const showLaunchSites = useAnalysisStore((s) => s.showLaunchSites);
  const toggleEllipses = useAnalysisStore((s) => s.toggleEllipses);
  const toggleTrajectories = useAnalysisStore((s) => s.toggleTrajectories);
  const toggleHeatmap = useAnalysisStore((s) => s.toggleHeatmap);
  const toggleLaunchSites = useAnalysisStore((s) => s.toggleLaunchSites);

  return (
    <CollapsiblePanel side="right" width={360} defaultOpen={false}>
      <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-iron-text">Analysis</h2>
        <span className="text-xs text-iron-text/40 font-mono">
          {analyses.length} engagements
        </span>
      </div>

      {/* Layer toggles */}
      <div className="px-3 py-2 border-b border-white/5 flex gap-2">
        <Toggle active={showEllipses} onClick={toggleEllipses} label="Ellipses" />
        <Toggle active={showTrajectories} onClick={toggleTrajectories} label="Arcs" />
        <Toggle active={showHeatmap} onClick={toggleHeatmap} label="Heatmap" />
        <Toggle active={showLaunchSites} onClick={toggleLaunchSites} label="Sites" />
      </div>

      <div className="flex-1 overflow-y-auto iron-scrollbar p-3">
        {selectedAnalysis ? (
          <EngagementDetail analysis={selectedAnalysis} />
        ) : selectedAlert ? (
          <div className="space-y-4">
            <div>
              <ClassificationBadge category={selectedAlert.threat_category} />
              <h3 className="text-lg font-bold text-iron-text mt-1">
                {selectedAlert.regions[0]}
              </h3>
              <div className="text-xs text-iron-text/40 mt-1">
                {selectedAlert.regions.length} regions, {selectedAlert.countdown_seconds}s countdown
              </div>
            </div>

            {/* List engagements that include this alert */}
            {analyses.length > 0 && (
              <div>
                <h4 className="text-xs text-iron-text/50 uppercase tracking-wider mb-2">
                  Engagements
                </h4>
                {analyses.map((a) => (
                  <EngagementListItem key={a.id} analysis={a} />
                ))}
              </div>
            )}
          </div>
        ) : analyses.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-iron-text/40 mb-3">
              Click an engagement on the map or select below:
            </p>
            {analyses.map((a) => (
              <EngagementListItem key={a.id} analysis={a} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-iron-text/30 text-center">
              Waiting for alert data
              <br />
              to run analysis pipeline...
            </p>
          </div>
        )}
      </div>
    </CollapsiblePanel>
  );
}

function Toggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${
        active
          ? "bg-white/15 text-iron-text"
          : "bg-white/5 text-iron-text/30"
      }`}
    >
      {label}
    </button>
  );
}

function EngagementListItem({ analysis }: { analysis: EngagementAnalysis }) {
  const selectEngagement = useAnalysisStore((s) => s.selectEngagement);

  return (
    <button
      onClick={() => selectEngagement(analysis.id)}
      className="w-full text-left px-2 py-2 bg-white/5 rounded hover:bg-white/10 transition-colors mb-1"
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-semibold uppercase ${
            analysis.classification === EngagementClassification.BALLISTIC_MISSILE
              ? "text-iron-ballistic"
              : "text-iron-text/50"
          }`}
        >
          {analysis.classification.replace(/_/g, " ")}
        </span>
        <span className="text-[10px] text-iron-text/40 font-mono">
          {(analysis.confidence.total * 100).toFixed(0)}%
        </span>
      </div>
      <div className="text-xs text-iron-text/60 mt-0.5">
        {analysis.engagement.alerts.length} alerts, {analysis.munitionType}
      </div>
    </button>
  );
}
