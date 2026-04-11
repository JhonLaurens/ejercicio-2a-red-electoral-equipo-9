import { describe, expect, it } from "vitest";

import { cn } from "../../src/lib/utils";

describe("utils cn", () => {
  it("une clases simples", () => {
    expect(cn("p-2", "text-sm")).toBe("p-2 text-sm");
  });

  it("fusiona clases de tailwind con conflicto", () => {
    expect(cn("p-2", "p-4", "text-sm", "text-lg")).toBe("p-4 text-lg");
  });

  it("soporta valores condicionales", () => {
    expect(cn("base", false && "hidden", null, undefined, "active")).toBe(
      "base active",
    );
  });
});
