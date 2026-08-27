export type ImportRecord = Record<string, unknown>;

export function parseCsv(text: string): ImportRecord[] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]; const next = text[index + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; index += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === "," && !quoted) { row.push(cell.trim()); cell = ""; continue; }
    if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && next === "\n") index += 1; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ""; continue; }
    cell += char;
  }
  if (cell || row.length) { row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); }
  const headers = (rows.shift() || []).map((header) => header.trim());
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

export function normalizeImportRecord(item: ImportRecord) {
  const value = (key: string, fallback = "") => String(item[key] ?? fallback);
  const slashCommand = value("slashCommand", value("command"));
  const tags = Array.isArray(item.tags) ? item.tags.join(",") : value("tags", "importado");
  return { slug: value("slug", slashCommand.replace(/^\//, "")), slashCommand, name: value("name", value("title")), description: value("description"), category: value("category", "PENSAR"), subcategory: value("subcategory", "Importado"), objective: value("objective", "Criar"), outputType: value("outputType", "Texto"), platform: value("platform", "Multiplataforma"), promptTemplate: value("promptTemplate", value("template", value("description"))), tags, difficulty: value("difficulty", "Intermediário"), featured: Boolean(item.featured), placeholders: Array.isArray(item.placeholders) ? item.placeholders : [] };
}
