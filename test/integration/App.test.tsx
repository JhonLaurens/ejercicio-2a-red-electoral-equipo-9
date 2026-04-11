import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/components/NetworkGraph", () => ({
  NetworkGraph: ({
    onMetricsChange,
  }: {
    onMetricsChange?: (m: any, c: any[]) => void;
  }) => {
    React.useEffect(() => {
      onMetricsChange?.(
        {
          nodes: 4,
          edges: 3,
          communities: 2,
          modularity: 0.31,
          density: 0.5,
          components: 1,
          avgDegree: 1.5,
          topBridge: { name: "B", score: 0.5 },
        },
        [],
      );
    }, [onMetricsChange]);

    return <div data-testid="network-graph">NetworkGraphMock</div>;
  },
}));

import App from "../../src/App";

const nodosCsv =
  `node_id,nombre,tipo,subtipo,atributo_1,atributo_1_label,atributo_2,atributo_2_label,atributo_3,atributo_3_label,atributo_4,atributo_4_label,region\n` +
  `cand_1,Candidato 1,candidato,nacional,A,Bloque,Centro,Ideologia,0,x,0,y,Nacional\n` +
  `dep_1,Depto 1,departamento,region,A,Bloque,Centro,Ideologia,0,x,0,y,Andina\n` +
  `fr_1,Jóvenes urbanos,franja_demografica,edad,A,Bloque,Mixto,Tendencia,0,x,0,y,Nacional\n`;

const aristasCsv =
  `edge_id,origen,destino,tipo_arista,peso,votos_estimados,afinidad_bloque,fuente_dato,nota\n` +
  `e1,cand_1,dep_1,afinidad,80,100,1,test,\n` +
  `e2,dep_1,fr_1,afinidad,70,100,1,test,\n`;

describe("App integration", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("electoral_nodos.csv")) {
          return Promise.resolve({
            text: () => Promise.resolve(nodosCsv),
          }) as Promise<Response>;
        }
        return Promise.resolve({
          text: () => Promise.resolve(aristasCsv),
        }) as Promise<Response>;
      }),
    );
  });

  it("carga datos y renderiza dashboard principal", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Red Electoral 2026")).toBeInTheDocument();
    });

    expect(screen.getByTestId("network-graph")).toBeInTheDocument();
  });

  it("permite cambiar de pestaña a Comunidades", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Red Electoral 2026")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /^Comunidades$/i }));
    expect(screen.getByText(/funcion de/i)).toBeInTheDocument();
  });

  it("permite abrir modo comparación", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Red Electoral 2026")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /^Comparacion$/i }));
    expect(screen.getByText(/diferencias topologicas/i)).toBeInTheDocument();
  });

  it("permite navegar a puentes y demografias", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Red Electoral 2026")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /^Puentes$/i }));
    expect(
      screen.getByText(/centralidad de intermediacion/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Demografias$/i }));
    expect(
      screen.getByText(/comparativa de modularidad por franja demografica/i),
    ).toBeInTheDocument();
  });

  it("permite contraer y expandir paneles laterales", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Red Electoral 2026")).toBeInTheDocument();
    });

    const paramsButton = screen.getByRole("button", {
      name: /parametros de red/i,
    });
    expect(screen.getByText(/peso m[ií]nimo/i)).toBeInTheDocument();
    fireEvent.click(paramsButton);
    expect(screen.queryByText(/peso m[ií]nimo/i)).not.toBeInTheDocument();
    fireEvent.click(paramsButton);
    expect(screen.getByText(/peso m[ií]nimo/i)).toBeInTheDocument();
  });

  it("muestra mensaje cuando modo comparacion esta inactivo", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Red Electoral 2026")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /^Comparacion$/i }));

    const comparePanelButton = screen.getByRole("button", {
      name: /modo comparacion/i,
    });
    fireEvent.click(comparePanelButton);

    const toggleContainer =
      screen.getByText(/activar comparacion/i).parentElement;
    const toggleButton = toggleContainer?.querySelector("button");
    expect(toggleButton).not.toBeNull();
    fireEvent.click(toggleButton!);

    expect(screen.getByText(/ver dos grafos lado a lado/i)).toBeInTheDocument();
  });

  it("tolera error de carga y mantiene UI estable", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network fail"))),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Red Electoral 2026")).toBeInTheDocument();
    });

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
