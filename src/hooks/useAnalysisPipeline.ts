"use client";

import { useEffect, useRef } from "react";
import { useAlertStore } from "@/stores/alert-store";
import { useAnalysisStore } from "@/stores/analysis-store";
import { runAnalysisPipeline } from "@/lib/analysis/pipeline";

/**
 * Runs the analysis pipeline whenever alerts update.
 * Debounced to avoid re-running on every single alert.
 */
export function useAnalysisPipeline(): void {
  const alerts = useAlertStore((s) => s.alerts);
  const setAnalyses = useAnalysisStore((s) => s.setAnalyses);
  const setAnalyzing = useAnalysisStore((s) => s.setAnalyzing);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (alerts.length === 0) {
      setAnalyses([]);
      return;
    }

    // Debounce: re-analyze 500ms after the last alert update
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setAnalyzing(true);
      try {
        const analyses = runAnalysisPipeline(alerts);
        setAnalyses(analyses);
      } finally {
        setAnalyzing(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [alerts, setAnalyses, setAnalyzing]);
}
