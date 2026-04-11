import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/components/NetworkGraph", () => ({
  NetworkGraph: () => <div data-testid="network-graph">NetworkGraphMock</div>,
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

describe("E2E-like flujo usuario", () => {
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

  it("flujo: carga -> pestaña puentes -> comparación -> vuelve a resumen", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Red Electoral 2026")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /^Puentes$/i }));
    expect(
      screen.getByText(/centralidad de intermediacion/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Comparacion$/i }));
    expect(screen.getByText(/diferencias topologicas/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Resumen$/i }));
    expect(screen.getByText(/lectura rapida/i)).toBeInTheDocument();
  }, 15000);
});
