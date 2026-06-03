import { getStoredValue, setStoredValue } from "@/lib/client-storage";

const HOME_SCROLL_STATE_KEY = "seatmap.homeScrollState";
const HOME_SCROLL_MAX_AGE_MS = 30 * 60 * 1000;

export function readHomeScrollY() {
  const raw = getStoredValue(HOME_SCROLL_STATE_KEY);
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw) as { savedAt?: number; scrollY?: number };
    if (!parsed.savedAt || Date.now() - parsed.savedAt > HOME_SCROLL_MAX_AGE_MS) return 0;
    return Math.max(0, Number(parsed.scrollY) || 0);
  } catch {
    return 0;
  }
}

export function writeHomeScrollY(scrollY: number) {
  setStoredValue(
    HOME_SCROLL_STATE_KEY,
    JSON.stringify({ savedAt: Date.now(), scrollY: Math.max(0, Math.round(scrollY)) }),
  );
}

export function saveCurrentHomeScroll() {
  if (typeof window === "undefined") return;
  writeHomeScrollY(window.scrollY);
}
