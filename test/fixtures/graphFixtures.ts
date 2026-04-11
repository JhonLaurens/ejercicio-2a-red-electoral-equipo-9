import Graph from "graphology";
import type { Arista, Nodo } from "../../src/types";

export const sampleNodos: Nodo[] = [
  {
    node_id: "cand_1",
    nombre: "Candidato 1",
    tipo: "candidato",
    subtipo: "nacional",
    atributo_1: "A",
    atributo_1_label: "Bloque",
    atributo_2: "Centro",
    atributo_2_label: "Ideologia",
    atributo_3: "0",
    atributo_3_label: "x",
    atributo_4: "0",
    atributo_4_label: "y",
    region: "Nacional",
  },
  {
    node_id: "dep_1",
    nombre: "Depto 1",
    tipo: "departamento",
    subtipo: "region",
    atributo_1: "A",
    atributo_1_label: "Bloque",
    atributo_2: "Centro",
    atributo_2_label: "Ideologia",
    atributo_3: "0",
    atributo_3_label: "x",
    atributo_4: "0",
    atributo_4_label: "y",
    region: "Andina",
  },
  {
    node_id: "dep_2",
    nombre: "Depto 2",
    tipo: "departamento",
    subtipo: "region",
    atributo_1: "A",
    atributo_1_label: "Bloque",
    atributo_2: "Centro",
    atributo_2_label: "Ideologia",
    atributo_3: "0",
    atributo_3_label: "x",
    atributo_4: "0",
    atributo_4_label: "y",
    region: "Caribe",
  },
  {
    node_id: "fr_1",
    nombre: "Jóvenes urbanos",
    tipo: "franja_demografica",
    subtipo: "edad",
    atributo_1: "A",
    atributo_1_label: "Bloque",
    atributo_2: "Mixto",
    atributo_2_label: "Tendencia",
    atributo_3: "0",
    atributo_3_label: "x",
    atributo_4: "0",
    atributo_4_label: "y",
    region: "Nacional",
  },
];

export const sampleAristas: Arista[] = [
  {
    edge_id: "e1",
    origen: "cand_1",
    destino: "dep_1",
    tipo_arista: "afinidad",
    peso: 80,
    votos_estimados: 100,
    afinidad_bloque: 1,
    fuente_dato: "test",
    nota: "",
  },
  {
    edge_id: "e2",
    origen: "dep_1",
    destino: "dep_2",
    tipo_arista: "afinidad",
    peso: 70,
    votos_estimados: 100,
    afinidad_bloque: 1,
    fuente_dato: "test",
    nota: "",
  },
  {
    edge_id: "e3",
    origen: "dep_2",
    destino: "fr_1",
    tipo_arista: "afinidad",
    peso: 60,
    votos_estimados: 100,
    afinidad_bloque: 1,
    fuente_dato: "test",
    nota: "",
  },
];

export function buildLineGraph(): Graph {
  const g = new Graph({ multi: false, type: "undirected" });
  g.addNode("A", { tipo: "candidato", nombre: "A" });
  g.addNode("B", { tipo: "departamento", nombre: "B" });
  g.addNode("C", { tipo: "departamento", nombre: "C" });
  g.addEdge("A", "B", { weight: 1 });
  g.addEdge("B", "C", { weight: 1 });
  return g;
}

export function buildTwoComponentsGraph(): Graph {
  const g = new Graph({ multi: false, type: "undirected" });
  g.addNode("A", { tipo: "x", nombre: "A" });
  g.addNode("B", { tipo: "x", nombre: "B" });
  g.addNode("C", { tipo: "x", nombre: "C" });
  g.addNode("D", { tipo: "x", nombre: "D" });
  g.addEdge("A", "B", { weight: 1 });
  g.addEdge("C", "D", { weight: 1 });
  return g;
}
