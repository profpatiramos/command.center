import { describe, expect, it } from "vitest";
import { catalog } from "../client/src/lib/catalog";
import { fillTemplate, filterCommands } from "../client/src/lib/command-utils";

describe("command utilities", () => {
  it("fills known placeholders and preserves an explicit marker for missing values", () => {
    expect(fillTemplate("Crie {tema} para {publico} em {formato}.", { tema: "um plano", publico: "empreendedores" })).toBe("Crie um plano para empreendedores em [FORMATO].");
  });

  it("combines category, platform and objective filters", () => {
    const result = filterCommands(catalog, { category: "CRIAR", platform: "Instagram", objective: "Criar" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.category === "CRIAR" && item.platform === "Instagram" && item.objective === "Criar")).toBe(true);
  });
});
