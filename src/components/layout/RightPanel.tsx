"use client";

import { useAlertStore } from "@/stores/alert-store";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { ClassificationBadge } from "@/components/ui/ClassificationBadge";

export function RightPanel() {
  const selectedId = useAlertStore((s) => s.selectedAlertId);
  const alerts = useAlertStore((s) => s.alerts);
  const selectedAlert = selectedId
    ? alerts.find((a) => a.id === selectedId)
    : null;

  return (
    <CollapsiblePanel side="right" width={360} defaultOpen={false}>
      <div className="px-3 py-2.5 border-b border-white/10">
        <h2 className="text-sm font-semibold text-iron-text">Analysis</h2>
      </div>
      <div className="flex-1 overflow-y-auto iron-scrollbar p-3">
        {selectedAlert ? (
          <div className="space-y-4">
            {/* Alert header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ClassificationBadge category={selectedAlert.threat_category} />
                <span className="text-xs text-iron-text/40 font-mono">
                  {selectedAlert.id.slice(0, 16)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-iron-text">
                {selectedAlert.regions[0]}
              </h3>
            </div>

            {/* Regions */}
            <div>
              <h4 className="text-xs text-iron-text/50 uppercase tracking-wider mb-1">
                Affected Regions ({selectedAlert.regions.length})
              </h4>
              <div className="space-y-0.5">
                {selectedAlert.regions.map((r, i) => (
                  <div key={i} className="text-sm text-iron-text/80">
                    {r}
                  </div>
                ))}
              </div>
            </div>

            {/* Parameters */}
            <div>
              <h4 className="text-xs text-iron-text/50 uppercase tracking-wider mb-1">
                Parameters
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded px-2 py-1.5">
                  <div className="text-[10px] text-iron-text/40 uppercase">
                    Countdown
                  </div>
                  <div className="text-sm font-mono font-bold text-iron-text">
                    {selectedAlert.countdown_seconds}s
                  </div>
                </div>
                <div className="bg-white/5 rounded px-2 py-1.5">
                  <div className="text-[10px] text-iron-text/40 uppercase">
                    Centroids
                  </div>
                  <div className="text-sm font-mono font-bold text-iron-text">
                    {selectedAlert.centroids.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement analysis placeholder */}
            <div className="border border-white/10 rounded p-3">
              <h4 className="text-xs text-iron-text/50 uppercase tracking-wider mb-2">
                Engagement Analysis
              </h4>
              <p className="text-xs text-iron-text/30">
                Select a clustered engagement to view ellipse parameters,
                back-azimuth, trajectory arc, and confidence score.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-iron-text/30 text-center">
              Select an alert from the feed
              <br />
              to view analysis details
            </p>
          </div>
        )}
      </div>
    </CollapsiblePanel>
  );
}
