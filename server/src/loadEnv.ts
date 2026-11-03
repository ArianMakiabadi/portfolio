import { fileURLToPath } from "node:url";

// Imported first by index.ts so modules that read env at import time (log.ts) see it.
// Dev only: on the VPS systemd injects the vars and there is no .env file to load.
// Resolved from this file (src/ under tsx, dist/ when built), so server/.env is
// found whatever the working directory.
const ENV_PATH = fileURLToPath(new URL("../.env", import.meta.url));

try {
  process.loadEnvFile(ENV_PATH);
} catch {
  // No .env: rely on the real environment.
}
