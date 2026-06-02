import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const text = fs.readFileSync(path.join(root, ".env.local"), "utf8");
const url = text.match(/^DATABASE_URL=(.+)$/m)[1].trim();
const u = new URL(url);
const db = u.pathname.replace(/^\//, "");
const adminUrl = new URL(url);
adminUrl.pathname = "/postgres";
const client = new pg.Client({ connectionString: adminUrl.toString() });
await client.connect();
const exists = await client.query(
  "SELECT 1 FROM pg_database WHERE datname = $1",
  [db],
);
if (exists.rowCount) {
  console.log("DB_EXISTS " + db);
} else {
  await client.query(`CREATE DATABASE "${db}"`);
  console.log("DB_CREATED " + db);
}
await client.end();
