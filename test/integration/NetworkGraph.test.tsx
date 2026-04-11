import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NetworkGraph } from "../../src/components/NetworkGraph";
import { sampleAristas, sampleNodos } from "../fixtures/graphFixtures";

vi.mock("react-force-graph-2d", () => ({
  default: ({ onNodeClick }: { onNodeClick?: (n: any) => void }) => (
    <button
      data-testid="force-graph"
      onClick={() => onNodeClick?.({ id: "cand_1" })}
    >
      ForceGraphMock
    </button>
  ),
}));

describe("NetworkGraph integration", () => {
  it("muestra mensaje cuando no hay datos", () => {
    render(
      <NetworkGraph
        nodos={[]}
        aristas={[]}
        minWeight={50}
        resolution={1}
        onNodeClick={() => {}}
      />,
    );

    expect(
      screen.getByText(/No hay datos suficientes para renderizar el grafo/i),
    ).toBeInTheDocument();
  });

  it("emite métricas cuando recibe datos válidos", async () => {
    const onMetricsChange = vi.fn();

    render(
      <NetworkGraph
        nodos={sampleNodos}
        aristas={sampleAristas}
        minWeight={50}
        resolution={1}
        selectedDemographic="Todas"
        onNodeClick={() => {}}
        onMetricsChange={onMetricsChange}
      />,
    );

    await waitFor(() => {
      expect(onMetricsChange).toHaveBeenCalled();
    });

    const [metrics] = onMetricsChange.mock.calls[0];
    expect(metrics.nodes).toBeGreaterThan(0);
    expect(metrics.edges).toBeGreaterThan(0);
  });
});
