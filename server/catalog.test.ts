import { describe, expect, it } from "vitest";
import { catalog } from "../client/src/lib/catalog";

describe("Command Center catalog", () => {
  it("contains the complete initial catalog and only the four required areas", () => {
    expect(catalog).toHaveLength(500);
    expect(new Set(catalog.map((command) => command.category))).toEqual(new Set(["PENSAR", "ESCREVER", "CRIAR", "CRESCER"]));
    expect(new Set(catalog.map((command) => command.command)).size).toBe(500);
  });

  it("provides reusable placeholders for every command", () => {
    const command = catalog.find((item) => item.command === "/foto-produto");
    expect(command).toBeDefined();
    expect(command?.template).toContain("{produto}");
    expect(command?.template).toContain("{proporcao}");
    expect(command?.placeholders.map((field) => field.name)).toEqual(["produto", "finalidade", "publico", "contexto", "estilo", "composicao", "iluminacao", "proporcao"]);
  });

  it("keeps task-specific instructions across commands", () => {
    const first = catalog.find((item) => item.command === "/estrategista");
    const second = catalog.find((item) => item.command === "/foto-produto");
    expect(first?.template).not.toBe(second?.template);
    expect(first?.template).toContain("matriz de decisão priorizada");
    expect(second?.template).toContain("diretor de fotografia de produto");
  });
});
