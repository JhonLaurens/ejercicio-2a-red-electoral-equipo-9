import { describe, expect, it } from "vitest";
import {
  computeBetweenness,
  computeEdgeBetweenness,
  computeModularity,
  countComponents,
  getConnectedComponents,
  partitionGirvanNewman,
} from "../../src/components/NetworkGraph";
import {
  buildLineGraph,
  buildTwoComponentsGraph,
} from "../fixtures/graphFixtures";

describe("graphAlgorithms", () => {
  it("computeBetweenness identifica nodo puente en grafo lineal", () => {
    const g = buildLineGraph();
    const btw = computeBetweenness(g);
    expect(btw.B).toBeGreaterThan(btw.A);
    expect(btw.B).toBeGreaterThan(btw.C);
  });

  it("computeModularity retorna valor finito para partición simple", () => {
    const g = buildLineGraph();
    const q = computeModularity(g, { A: 0, B: 0, C: 1 });
    expect(Number.isFinite(q)).toBe(true);
  });

  it("getConnectedComponents detecta componentes correctos", () => {
    const g = buildTwoComponentsGraph();
    const comps = getConnectedComponents(g);
    expect(comps).toHaveLength(2);
    const sizes = comps.map((c) => c.length).sort((a, b) => a - b);
    expect(sizes).toEqual([2, 2]);
  });

  it("computeEdgeBetweenness produce score para aristas", () => {
    const g = buildLineGraph();
    const edges = computeEdgeBetweenness(g);
    expect(Object.keys(edges).length).toBe(2);
    Object.values(edges).forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });

  it("partitionGirvanNewman alcanza comunidades objetivo cuando es posible", () => {
    const g = buildLineGraph();
    const partition = partitionGirvanNewman(g, 2);
    const communities = new Set(Object.values(partition));
    expect(communities.size).toBeGreaterThanOrEqual(2);
  });

  it("countComponents cuenta componentes en grafo desconectado", () => {
    const g = buildTwoComponentsGraph();
    expect(countComponents(g)).toBe(2);
  });
});
