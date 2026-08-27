import type { Command } from "./catalog";

export function fillTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] || `[${key.toUpperCase()}]`);
}

export type CatalogFilters = { query?: string; category?: string; outputType?: string; platform?: string; objective?: string };
export function filterCommands(commands: Command[], filters: CatalogFilters) {
  const query = filters.query?.trim().toLowerCase() || "";
  return commands.filter((item) => {
    const haystack = [item.command, item.name, item.description, item.category, item.subcategory, item.objective, item.platform, ...item.tags].join(" ").toLowerCase();
    return (!query || haystack.includes(query)) && (!filters.category || filters.category === "TODAS" || item.category === filters.category) && (!filters.outputType || filters.outputType === "TODOS" || item.outputType === filters.outputType) && (!filters.platform || filters.platform === "TODAS" || item.platform === filters.platform) && (!filters.objective || filters.objective === "TODOS" || item.objective === filters.objective);
  });
}
