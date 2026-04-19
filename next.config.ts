import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Pin Turbopack's root so it doesn't pick a parent lockfile (e.g. C:\Users\…\package-lock.json)
// and walk into the wrong folder. That mismatch caused "Access is denied" on app\dashboard panics.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
