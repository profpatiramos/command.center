import { describe, expect, it } from "vitest";
import { normalizeImportRecord, parseCsv } from "../client/src/lib/import-utils";

describe("import utilities", () => {
  it("parses quoted commas in CSV values", () => {
    const [row] = parseCsv('slashCommand,name,description,category\n/test,"Teste, premium","Uma descrição, com vírgula",CRIAR');
    expect(row).toEqual({ slashCommand: "/test", name: "Teste, premium", description: "Uma descrição, com vírgula", category: "CRIAR" });
  });

  it("normalizes aliases and supplies safe defaults", () => {
    expect(normalizeImportRecord({ command: "/novo-comando", title: "Novo", description: "Descrição" })).toMatchObject({ slug: "novo-comando", slashCommand: "/novo-comando", name: "Novo", category: "PENSAR", promptTemplate: "Descrição", tags: "importado" });
  });
});
