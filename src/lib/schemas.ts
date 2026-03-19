import { z } from "zod";

/** Zod schema for raw Pikud HaOref alert payload */
export const RawOrefAlertSchema = z.object({
  id: z.string(),
  cat: z.string(),
  title: z.string(),
  data: z.array(z.string()),
  desc: z.string().optional().default(""),
});

export type RawOrefAlertParsed = z.infer<typeof RawOrefAlertSchema>;

/** Schema for an array of alerts (the API returns an array) */
export const OrefAlertsResponseSchema = z.union([
  z.array(RawOrefAlertSchema),
  // Sometimes returns empty string or null when no alerts
  z.string().transform(() => []),
  z.null().transform(() => []),
]);
