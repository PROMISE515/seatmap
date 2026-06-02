import type { ToiletDTO } from "@/lib/amap";
import { getStoredValue, setStoredValue } from "@/lib/client-storage";

const SAVED_TOILETS_KEY = "seatmap.saved.toilets";

function readSaved(): ToiletDTO[] {
  const raw = getStoredValue(SAVED_TOILETS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSaved(toilets: ToiletDTO[]) {
  setStoredValue(SAVED_TOILETS_KEY, JSON.stringify(toilets.slice(0, 50)));
}

export function getSavedToilets() {
  return readSaved();
}

export function isToiletSaved(id: string) {
  return readSaved().some((item) => item.id === id);
}

export function saveToilet(toilet: ToiletDTO) {
  const saved = readSaved();
  const alreadySaved = saved.some((item) => item.id === toilet.id);
  const existing = saved.filter((item) => item.id !== toilet.id);
  writeSaved([toilet, ...existing]);
  return { alreadySaved };
}

export function removeSavedToilet(id: string) {
  writeSaved(readSaved().filter((item) => item.id !== id));
}
