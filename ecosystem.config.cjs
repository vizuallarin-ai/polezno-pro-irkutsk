/** PM2: Next.js + Payload на Beget VPS */
module.exports = {
  apps: [
    {
      name: "polezno",
      cwd: "/var/www/polezno",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
