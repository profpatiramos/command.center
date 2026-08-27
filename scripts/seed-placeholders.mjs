import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const source = await fs.readFile(new URL("../client/src/lib/catalog.ts", import.meta.url), "utf8");
const payload = source.split("export const catalog: Command[] = ")[1].trim().replace(/;\s*$/, "");
const catalog = JSON.parse(payload);
const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  for (const command of catalog) {
    const [rows] = await connection.execute("SELECT id FROM commands WHERE slug = ? LIMIT 1", [command.id]);
    const commandId = rows[0]?.id;
    if (!commandId) continue;
    for (const field of command.placeholders) {
      await connection.execute("INSERT INTO placeholders (commandId, name, label, type, required, options, defaultValue) SELECT ?, ?, ?, ?, ?, ?, ? FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM placeholders WHERE commandId = ? AND name = ?)", [commandId, field.name, field.label, field.type, field.required ? 1 : 0, JSON.stringify(field.options || []), field.defaultValue || null, commandId, field.name]);
    }
  }
  const [rows] = await connection.query("SELECT COUNT(*) AS count FROM placeholders");
  console.log(`Placeholder seed complete: ${rows[0].count} placeholders`);
} finally { await connection.end(); }
