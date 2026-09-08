/** PM2: Next.js + Payload on Beget VPS (immutable current symlink). */
module.exports = {
  apps: [
    {
      name: "polezno",
      // Runtime must follow the atomic current pointer — never a mutable SHA checkout.
      cwd: "/var/www/polezno-current",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      max_memory_restart: "900M",
      kill_timeout: 5000,
      listen_timeout: 10000,
      exp_backoff_restart_delay: 200,
    },
  ],
};
