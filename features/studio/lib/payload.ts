import { API_BASE } from "@/lib/api";

/** Nest `{ success: true, data: { ... } }` → inner object; else root. */
export function unwrapPayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  if (
    root.success === true &&
    root.data !== undefined &&
    typeof root.data === "object" &&
    root.data !== null
  ) {
    return root.data as Record<string, unknown>;
  }
  return root;
}

export function readId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const raw = d.projectId ?? d.id ?? d._id;
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  if (d.data && typeof d.data === "object") return readId(d.data);
  return null;
}

export function normalizeAssetUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw) return null;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return `${API_BASE}${raw}`;
  return raw;
}

export function readNumber(raw: unknown): number | null {
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function readString(raw: unknown): string | null {
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

export function readProgress(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const p = (data as Record<string, unknown>).progress;
  if (typeof p !== "number" || Number.isNaN(p)) return null;
  return Math.min(100, Math.max(0, p));
}

export function readTotalCost(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const raw = d.totalCost ?? d.total_cost ?? d.cost;
  if (typeof raw === "number" && !Number.isNaN(raw)) return raw;
  if (typeof raw === "string") {
    const n = parseFloat(raw.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function readBooleanFavorite(raw: unknown): boolean {
  if (typeof raw === "boolean") return raw;
  if (raw === 1 || raw === "1" || raw === "true") return true;
  return false;
}

export function isCompletedStatus(status: string | undefined): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === "completed" || s === "complete" || s === "done";
}

export function projectsFromListPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;

  const roots: Record<string, unknown>[] = [];
  if (data && typeof data === "object") {
    roots.push(data as Record<string, unknown>);
    const inner = unwrapPayload(data);
    if (inner && inner !== data) roots.push(inner);
  }

  for (const d of roots) {
    if (Array.isArray(d.data)) return d.data as unknown[];
    if (Array.isArray(d.projects)) return d.projects;
    if (Array.isArray(d.images)) return d.images;
    if (Array.isArray(d.items)) return d.items;
    if (Array.isArray(d.results)) return d.results;
  }

  return [];
}
