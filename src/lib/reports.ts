import { getStoredValue, setStoredValue } from "@/lib/client-storage";

export type ToiletReport = {
  id: string;
  type: "confirmed_seated" | "wrong_listing" | "closed" | "other";
  placeName: string;
  notes: string;
  createdAt: string;
};

const REPORTS_KEY = "seatmap.reports.queue";

export function getStoredReports(): ToiletReport[] {
  const raw = getStoredValue(REPORTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReport(report: Omit<ToiletReport, "id" | "createdAt">) {
  const next: ToiletReport = {
    ...report,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  setStoredValue(REPORTS_KEY, JSON.stringify([next, ...getStoredReports()].slice(0, 50)));
  return next;
}
