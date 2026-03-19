"use client";

import { useAlertStore } from "@/stores/alert-store";
import { useAnalysisStore } from "@/stores/analysis-store";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { ClassificationBadge } from "@/components/ui/ClassificationBadge";
import { EngagementClassification, ThreatCategory, type EngagementAnalysis } from "@/types";

/** Dynamic color for confidence bars based on value */
function confidenceColor(value: number): string {
  if (value >= 0.7) return "bg-green-500";
  if (value >= 0.4) return "bg-amber-500";
  return "bg-red-500";
}

function confidenceTextColor(value: number): string {
  if (value >= 0.7) return "text-green-400";
  if (value >= 0.4) return "text-amber-400";
  return "text-red-400";
}

function ConfidenceBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-iron-text/45 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${confidenceColor(value)}`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className={`text-[10px] w-8 text-right font-mono ${confidenceTextColor(value)}`}>
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
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              analysis.classification === EngagementClassification.BALLISTIC_MISSILE
                ? "bg-iron-ballistic/15 text-iron-ballistic border border-iron-ballistic/20"
                : "bg-white/[0.06] text-iron-text/50 border border-white/[0.06]"
            }`}
          >
            {analysis.classification === EngagementClassification.BALLISTIC_MISSILE && (
              <span className="w-1.5 h-1.5 rounded-full bg-iron-ballistic animate-pulse" />
            )}
            {analysis.classification.replace(/_/g, " ")}
          </span>
        </div>
        <div className="text-[11px] text-iron-text/35 font-mono">
          {analysis.munitionType}
        </div>
      </div>

      {/* Ellipse Parameters */}
      {ellipse && (
        <div>
          <SectionHeader label="Ellipse Fit" />
          <div className="grid grid-cols-2 gap-1.5">
            <Stat label="Semi-major" value={`${ellipse.semiMajorKm.toFixed(1)} km`} />
            <Stat label="Semi-minor" value={`${ellipse.semiMinorKm.toFixed(1)} km`} />
            <Stat
              label="Eccentricity"
              value={ellipse.eccentricity.toFixed(3)}
              highlight={ellipse.eccentricity > 0.7}
            />
            <Stat label="Azimuth" value={`${ellipse.angle.toFixed(1)}°`} />
          </div>
        </div>
      )}

      {/* Trajectory */}
      {trajectory && (
        <div>
          <SectionHeader label="Back-Trace" />
          <div className="grid grid-cols-2 gap-1.5">
            <Stat
              label="Origin"
              value={trajectory.estimatedOrigin}
              highlight
            />
            <Stat label="Back-azimuth" value={`${trajectory.backAzimuth.toFixed(1)}°`} />
            <Stat label="Distance" value={`${trajectory.distanceKm.toFixed(0)} km`} />
            <Stat label="Alert points" value={`${analysis.engagement.alerts.length}`} />
          </div>
        </div>
      )}

      {/* Confidence */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionHeader label="Confidence" />
          <span className={`text-sm font-bold font-mono ${confidenceTextColor(analysis.confidence.total)}`}>
            {(analysis.confidence.total * 100).toFixed(0)}%
          </span>
        </div>
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
        <SectionHeader label={`Alerts (${analysis.engagement.alerts.length})`} />
        <div className="space-y-0.5 max-h-32 overflow-y-auto iron-scrollbar">
          {analysis.engagement.alerts.map((a, i) => (
            <div key={i} className="text-[11px] text-iron-text/50 flex items-center gap-1.5 py-0.5">
              <ClassificationBadge category={a.threat_category} />
              <span className="truncate">{a.regions[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <h4 className="text-[10px] text-iron-text/35 uppercase tracking-widest font-semibold mb-2">
      {label}
    </h4>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white/[0.04] rounded-md px-2.5 py-2 border border-white/[0.04]">
      <div className="text-[9px] text-iron-text/30 uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-mono font-bold mt-0.5 ${
        highlight ? "text-iron-ballistic" : "text-iron-text/90"
      }`}>
        {value}
      </div>
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
      <div className="px-3 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-iron-text/40">
            <path d="M2 12L7 2l5 10H2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <h2 className="text-xs font-semibold text-iron-text uppercase tracking-wider">Analysis</h2>
        </div>
        <span className="text-[10px] text-iron-text/30 font-mono">
          {analyses.length} eng.
        </span>
      </div>

      {/* Layer toggles */}
      <div className="px-3 py-2 border-b border-white/[0.04] flex gap-1.5">
        <LayerToggle active={showEllipses} onClick={toggleEllipses} label="Ellipses" />
        <LayerToggle active={showTrajectories} onClick={toggleTrajectories} label="Arcs" />
        <LayerToggle active={showHeatmap} onClick={toggleHeatmap} label="Heatmap" />
        <LayerToggle active={showLaunchSites} onClick={toggleLaunchSites} label="Sites" />
      </div>

      <div className="flex-1 overflow-y-auto iron-scrollbar p-3">
        {selectedAnalysis ? (
          <EngagementDetail analysis={selectedAnalysis} />
        ) : selectedAlert ? (
          <div className="space-y-4">
            <div>
              <ClassificationBadge category={selectedAlert.threat_category} />
              <h3 className="text-base font-bold text-iron-text mt-2">
                {selectedAlert.regions[0]}
              </h3>
              <div className="text-[11px] text-iron-text/35 mt-1 font-mono">
                {selectedAlert.regions.length} regions &middot; {selectedAlert.countdown_seconds}s countdown
              </div>
            </div>

            {analyses.length > 0 && (
              <div>
                <SectionHeader label="Engagements" />
                <div className="space-y-1.5">
                  {analyses.map((a) => (
                    <EngagementListItem key={a.id} analysis={a} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : analyses.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[11px] text-iron-text/30 mb-3">
              Select an engagement to view details:
            </p>
            <div className="space-y-1.5">
              {analyses.map((a) => (
                <EngagementListItem key={a.id} analysis={a} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-iron-text/15">
                <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs text-iron-text/25">No analysis data</p>
              <p className="text-[10px] text-iron-text/15 mt-0.5">Waiting for alert clusters...</p>
            </div>
          </div>
        )}
      </div>
    </CollapsiblePanel>
  );
}

function LayerToggle({
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
      className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all duration-200 border ${
        active
          ? "bg-white/[0.08] border-white/[0.12] text-iron-text/80"
          : "bg-transparent border-white/[0.04] text-iron-text/25 hover:text-iron-text/40"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function EngagementListItem({ analysis }: { analysis: EngagementAnalysis }) {
  const selectEngagement = useAnalysisStore((s) => s.selectEngagement);
  const isBallistic = analysis.classification === EngagementClassification.BALLISTIC_MISSILE;

  return (
    <button
      onClick={() => selectEngagement(analysis.id)}
      className={`w-full text-left px-2.5 py-2 rounded-md border transition-all duration-150 ${
        isBallistic
          ? "bg-iron-ballistic/[0.06] border-iron-ballistic/15 hover:bg-iron-ballistic/10"
          : "bg-white/[0.03] border-white/[0.04] hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${
            isBallistic ? "text-iron-ballistic" : "text-iron-text/40"
          }`}
        >
          {analysis.classification.replace(/_/g, " ")}
        </span>
        <span className={`text-[10px] font-mono font-bold ${confidenceTextColor(analysis.confidence.total)}`}>
          {(analysis.confidence.total * 100).toFixed(0)}%
        </span>
      </div>
      <div className="text-[11px] text-iron-text/40 mt-0.5 font-mono">
        {analysis.engagement.alerts.length} alerts &middot; {analysis.munitionType}
      </div>
    </button>
  );
}
