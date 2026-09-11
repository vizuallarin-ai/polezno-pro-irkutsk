# ADMIN.E.1 — Application smoke against restored DB

```json
{
  "at": "2026-09-11T13:13:07.164Z",
  "gate": "ADMIN.E.1",
  "sourceHost": "localhost",
  "sourceDb": "polezno_irkutsk",
  "dumpPath": "D:\\AI_WORKSPACE\\Projects\\PoleznoProIrkutsk\\.tmp-admin-e1-restore\\source_2026-09-11T13-13-07-162Z.dump",
  "tempDb": "restore_app_1789132387163",
  "port": 3017,
  "checks": [
    {
      "name": "dump_created",
      "ok": true,
      "dumpBytes": 348001
    },
    {
      "name": "restore_tables",
      "ok": true,
      "tableCount": 63,
      "pgRestoreStatus": 0
    },
    {
      "name": "aggregates_readable",
      "ok": true,
      "users": 1,
      "excursions": 8,
      "routes": 2,
      "articles": 4,
      "leads": 19,
      "media": 3
    },
    {
      "name": "health",
      "ok": true,
      "http": 200,
      "database": "up",
      "status": "ok",
      "commitSha": "unknown"
    },
    {
      "name": "route_/",
      "ok": true,
      "http": 200
    },
    {
      "name": "route_/map",
      "ok": true,
      "http": 200
    },
    {
      "name": "route_/business",
      "ok": true,
      "http": 200
    },
    {
      "name": "route_/admin",
      "ok": true,
      "http": 200
    },
    {
      "name": "route_/explore",
      "ok": true,
      "http": 200
    }
  ],
  "status": "APP_AGAINST_RESTORED_DB_PROVEN",
  "aggregates": {
    "users": 1,
    "excursions": 8,
    "routes": 2,
    "articles": 4,
    "leads": 19,
    "media": 3
  },
  "leadsStatusHistogram": [
    {
      "status": "new",
      "n": 9
    },
    {
      "status": "in_progress",
      "n": 3
    },
    {
      "status": "closed",
      "n": 4
    },
    {
      "status": "declined",
      "n": 3
    }
  ],
  "serverLogTail": "▲ Next.js 16.2.6\n- Local:         http://127.0.0.1:3017\n- Network:       http://127.0.0.1:3017\n✓ Ready in 3.8s\n[21:13:33] \u001b[33mWARN\u001b[39m: \u001b[36mNo email adapter provided. Email will be written to console. More info at https://payloadcms.com/docs/email/overview.\u001b[39m\n"
}
```
