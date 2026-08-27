import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const sql = await fs.readFile(new URL("./seed_commands.sql", import.meta.url), "utf8");
const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  await connection.query(sql);
  const [rows] = await connection.query("SELECT COUNT(*) AS count FROM commands");
  console.log(`Seed complete: ${rows[0].count} commands`);
} finally {
  await connection.end();
}
