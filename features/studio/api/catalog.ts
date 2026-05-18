import { apiFetch } from "@/lib/api";
import { CATALOG_ROUTES } from "./routes";

export async function listTemplates(headers: Record<string, string>) {
  return apiFetch(CATALOG_ROUTES.templates, { headers: { ...headers } });
}

export async function listMotionPresets(headers: Record<string, string>) {
  return apiFetch(CATALOG_ROUTES.motionPresets, { headers: { ...headers } });
}

export async function listVoiceProfiles(headers: Record<string, string>) {
  return apiFetch(CATALOG_ROUTES.voiceProfiles, { headers: { ...headers } });
}
