/** PM2: Next.js + Payload on Beget VPS (immutable current symlink).
 *
 * OBS.1: do NOT use `script: "npm", args: "start"`.
 * That spawns `sh -c next start` and leaves orphan `next-server` on :3000
 * after `pm2 restart` (EADDRINUSE + restart storm).
 * See docs/incidents/2026-09-09-pm2-eaddrinuse.md
 *
 * Keep in sync with lib/runtime-lifecycle.mjs `buildPoleznoPm2App()`.
 * Live dump may still run npm wrapper until OPS.2 applies this file via
 * scripts/runtime-restart-safe.sh (no silent production restart in OBS.1).
 * OPS.2 (2026-09-09): direct-Next applied live; `pm2 save` persists this contract.
 */
module.exports = {
  apps: [
    {
      name: "polezno",
      cwd: "/var/www/polezno-current",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 3000,
      exp_backoff_restart_delay: 1000,
      kill_timeout: 8000,
      listen_timeout: 15000,
      max_memory_restart: "900M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
