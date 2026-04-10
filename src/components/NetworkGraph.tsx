// Importaciones de librerías para el manejo de grafos, clustering y renderizado.
// Graphology provee la estructura de grafo, louvain detecta comunidades y
// ForceGraph2D dibuja el grafo en canvas con física de fuerzas.
import Graph from "graphology";
import louvain from "graphology-communities-louvain";
import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Arista, BridgeRankingEntry, CommunityInfo, GraphMetrics, Nodo } from "../types";

// Props del componente NetworkGraph:
// - nodos/aristas: datos de entrada del grafo
// - minWeight/resolution: filtros y parámetros de Louvain
// - algorithm/targetCommunities: se usan para el modo comparativo
// - selectedDemographic: franja demográfica seleccionada
// - removedNodeIds: conjunto de nodos eliminados para analisis de puentes
// - onMetricsChange: callback para enviar métricas al componente padre
interface NetworkGraphProps {
  nodos: Nodo[];
  aristas: Arista[];
  minWeight: number;
  resolution: number;
  algorithm?: "louvain" | "girvan-newman";
  targetCommunities?: number;
  onNodeClick: (node: any) => void;
  selectedDemographic?: string;
  removedNodeIds?: Set<string>;
  onMetricsChange?: (
    metrics: GraphMetrics,
    communities: CommunityInfo[],
  ) => void;
}

// Paleta de colores para pintar las comunidades detectadas en el grafo.
const COLOR_PALETTE = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#9333ea",
  "#0891b2",
  "#e11d48",
  "#4f46e5",
  "#059669",
  "#ca8a04",
  "#7c3aed",
  "#0d9488",
  "#db2777",
  "#6366f1",
  "#15803d",
  "#ea580c",
  "#8b5cf6",
  "#0284c7",
  "#be185d",
  "#65a30d",
];

// Calcula la centralidad de intermediación (betweenness) para cada nodo.
// Usa el algoritmo de Brandes con distancias ponderadas por el peso de la arista.
function computeBetweenness(G: Graph): Record<string, number> {
  const nodes = G.nodes();
  const n = nodes.length;
  const centrality: Record<string, number> = {};
  nodes.forEach((v) => {
    centrality[v] = 0;
  });

  for (const s of nodes) {
    const stack: string[] = [];
    const predecessors: Record<string, string[]> = {};
    nodes.forEach((v) => {
      predecessors[v] = [];
    });

    const sigma: Record<string, number> = {};
    nodes.forEach((v) => {
      sigma[v] = 0;
    });
    sigma[s] = 1;

    const dist: Record<string, number> = {};
    nodes.forEach((v) => {
      dist[v] = Number.POSITIVE_INFINITY;
    });
    dist[s] = 0;

    const unvisited = new Set(nodes);
    while (unvisited.size > 0) {
      let current: string | null = null;
      let currentDist = Number.POSITIVE_INFINITY;
      unvisited.forEach((v) => {
        if (dist[v] < currentDist) {
          currentDist = dist[v];
          current = v;
        }
      });

      if (current === null || currentDist === Number.POSITIVE_INFINITY) break;
      unvisited.delete(current);
      stack.push(current);

      G.forEachNeighbor(current, (w) => {
        if (!unvisited.has(w)) return;
        const edge = G.edge(current as string, w);
        const weight = Number(G.getEdgeAttribute(edge, "weight") ?? 1);
        const distance = 1 / Math.max(weight, 1e-9);
        const alt = dist[current as string] + distance;

        if (alt < dist[w] - 1e-12) {
          dist[w] = alt;
          sigma[w] = sigma[current as string];
          predecessors[w] = [current as string];
        } else if (Math.abs(alt - dist[w]) <= 1e-12) {
          sigma[w] += sigma[current as string];
          predecessors[w].push(current as string);
        }
      });
    }

    const delta: Record<string, number> = {};
    nodes.forEach((v) => {
      delta[v] = 0;
    });

    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of predecessors[w]) {
        delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      }
      if (w !== s) {
        centrality[w] += delta[w];
      }
    }
  }

  nodes.forEach((v) => {
    centrality[v] /= 2;
  });
  const norm = n > 2 ? 2 / ((n - 1) * (n - 2)) : 1;
  nodes.forEach((v) => {
    centrality[v] *= norm;
  });
  return centrality;
}

// Calcula la modularidad de la partición de comunidades.
// Mide la densidad interna de aristas frente a una red aleatoria equivalente.
function computeModularity(
  G: Graph,
  communities: Record<string, number>,
): number {
  if (G.size === 0) return 0;
  let m = 0;
  G.forEachEdge((edge, attrs) => {
    m += Number(attrs.weight ?? 1);
  });
  if (m === 0) return 0;
  const twoM = 2 * m;
  let q = 0;
  const degrees: Record<string, number> = {};
  G.forEachNode((node) => {
    let weightedDegree = 0;
    G.forEachNeighbor(node, (neighbor) => {
      const edge = G.edge(node, neighbor);
      weightedDegree += Number(G.getEdgeAttribute(edge, "weight") ?? 1);
    });
    degrees[node] = weightedDegree;
  });

  G.forEachNode((u) => {
    G.forEachNode((v) => {
      if (communities[u] !== communities[v]) return;
      const aij = G.hasEdge(u, v)
        ? Number(G.getEdgeAttribute(G.edge(u, v), "weight") ?? 1)
        : 0;
      q += aij - (degrees[u] * degrees[v]) / twoM;
    });
  });
  return q / twoM;
}

// Extrae los componentes conectados del grafo.
// Cada componente representa un subgrafo en el que todos los nodos están conectados.
function getConnectedComponents(G: Graph): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];

  G.forEachNode((start) => {
    if (visited.has(start)) return;
    const queue = [start];
    const component: string[] = [];

    while (queue.length > 0) {
      const node = queue.shift()!;
      if (visited.has(node)) continue;
      visited.add(node);
      component.push(node);
      G.forEachNeighbor(node, (neighbor) => {
        if (!visited.has(neighbor)) queue.push(neighbor);
      });
    }

    components.push(component);
  });

  return components;
}

// Calcula el betweenness de aristas necesario para Girvan-Newman.
// Es la cantidad de caminos más cortos que atraviesan cada arista.
function computeEdgeBetweenness(G: Graph): Record<string, number> {
  const result: Record<string, number> = {};
  const nodes = G.nodes();

  G.forEachEdge((edge) => {
    result[edge] = 0;
  });

  for (const s of nodes) {
    const stack: string[] = [];
    const preds: Record<string, string[]> = {};
    const sigma: Record<string, number> = {};
    const dist: Record<string, number> = {};

    nodes.forEach((v) => {
      preds[v] = [];
      sigma[v] = 0;
      dist[v] = -1;
    });

    sigma[s] = 1;
    dist[s] = 0;
    const queue: string[] = [s];

    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);
      G.forEachNeighbor(v, (w) => {
        if (dist[w] < 0) {
          queue.push(w);
          dist[w] = dist[v] + 1;
        }
        if (dist[w] === dist[v] + 1) {
          sigma[w] += sigma[v];
          preds[w].push(v);
        }
      });
    }

    const delta: Record<string, number> = {};
    nodes.forEach((v) => {
      delta[v] = 0;
    });

    while (stack.length > 0) {
      const w = stack.pop()!;
      preds[w].forEach((v) => {
        const coeff = (sigma[v] / sigma[w]) * (1 + delta[w]);
        const edge = G.edge(v, w);
        if (edge) {
          result[edge] = (result[edge] ?? 0) + coeff;
        }
        delta[v] += coeff;
      });
    }
  }

  Object.keys(result).forEach((edge) => {
    result[edge] /= 2;
  });

  return result;
}

// Algoritmo de Girvan-Newman para dividir el grafo en comunidades.
// Elimina iterativamente la arista con mayor betweenness hasta alcanzar el número deseado de componentes.
function partitionGirvanNewman(
  G: Graph,
  targetCommunities: number,
): Record<string, number> {
  const work = G.copy();
  const target = Math.max(
    2,
    Math.min(targetCommunities, Math.max(2, work.order)),
  );

  while (work.size > 0) {
    const components = getConnectedComponents(work);
    if (components.length >= target) break;

    const edgeBw = computeEdgeBetweenness(work);
    let maxEdge = "";
    let maxValue = -1;
    Object.entries(edgeBw).forEach(([edge, value]) => {
      if (value > maxValue) {
        maxValue = value;
        maxEdge = edge;
      }
    });

    if (!maxEdge) break;
    work.dropEdge(maxEdge);
  }

  const partition: Record<string, number> = {};
  const components = getConnectedComponents(work);
  components.forEach((nodes, idx) => {
    nodes.forEach((node) => {
      partition[node] = idx;
    });
  });

  return partition;
}

// Cuenta cuantos componentes conectados tiene el grafo.
function countComponents(G: Graph): number {
  const visited = new Set<string>();
  let count = 0;
  G.forEachNode((node) => {
    if (visited.has(node)) return;
    count++;
    const queue = [node];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      G.forEachNeighbor(current, (neighbor) => {
        if (!visited.has(neighbor)) queue.push(neighbor);
      });
    }
  });
  return count;
}

// Componente principal que muestra el grafo interactivo.
// Recibe los datos, aplica filtros, calcula métricas y renderiza con ForceGraph2D.
export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodos,
  aristas,
  minWeight,
  resolution,
  algorithm = "louvain",
  targetCommunities = 4,
  onNodeClick,
  selectedDemographic,
  removedNodeIds,
  onMetricsChange,
}) => {
  const fgRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Ajusta dinámicamente el tamaño del canvas cuando cambia el contenedor.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reconstruye el grafo cada vez que cambian los datos o filtros.
  useEffect(() => {
    if (!nodos.length || !aristas.length) return;

    const G = new Graph({ multi: false, type: "undirected" });

    // Si se seleccionó una franja demográfica, reduce el grafo a candidatos,
    // departamentos y esa franja específica.
    let validNodeIds = new Set(nodos.map((n) => n.node_id));
    if (selectedDemographic && selectedDemographic !== "Todas") {
      const demoNode = nodos.find((n) => n.nombre === selectedDemographic);
      if (demoNode) {
        validNodeIds = new Set(
          nodos
            .filter(
              (n) =>
                n.tipo === "candidato" ||
                n.tipo === "departamento" ||
                n.node_id === demoNode.node_id,
            )
            .map((n) => n.node_id),
        );
      }
    }

    if (removedNodeIds) {
      removedNodeIds.forEach((id) => validNodeIds.delete(id));
    }

    // Agrega los nodos válidos al grafo.
    nodos.forEach((n) => {
      if (validNodeIds.has(n.node_id)) {
        G.addNode(n.node_id, { ...n });
      }
    });

    // Agrega aristas que superen el umbral de peso mínimo.
    aristas.forEach((a) => {
      if (validNodeIds.has(a.origen) && validNodeIds.has(a.destino)) {
        if (Number(a.peso) >= minWeight) {
          if (!G.hasEdge(a.origen, a.destino)) {
            G.addEdge(a.origen, a.destino, { weight: Number(a.peso), ...a });
          }
        }
      }
    });

    // Elimina nodos aislados sin conexiones.
    G.forEachNode((node) => {
      if (G.degree(node) === 0) G.dropNode(node);
    });

    // Si el grafo quedó vacío después de filtrar, emitir métricas vacías.
    if (G.order === 0) {
      setGraphData({ nodes: [], links: [] });
      onMetricsChange?.(
        {
          nodes: 0,
          edges: 0,
          communities: 0,
          modularity: 0,
          density: 0,
          components: 0,
          avgDegree: 0,
          topBridge: null,
          bridgeRanking: [],
        },
        [],
      );
      return;
    }

    try {
      // Detecta comunidades usando Louvain o Girvan-Newman.
      const communities =
        algorithm === "louvain"
          ? louvain(G, { resolution })
          : partitionGirvanNewman(G, targetCommunities);
      const mod = computeModularity(G, communities);
      const betweenness = computeBetweenness(G);
      const components = countComponents(G);

      const sortedBridgeEntries = Object.entries(betweenness)
        .filter(([, score]) => score > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      const bridgeNodeIds = new Set(sortedBridgeEntries.map(([node]) => node));
      let maxBtw = 0;
      let topBridgeId = "";
      if (sortedBridgeEntries.length > 0) {
        topBridgeId = sortedBridgeEntries[0][0];
        maxBtw = sortedBridgeEntries[0][1];
      }

      let totalDegree = 0;
      G.forEachNode((node) => {
        totalDegree += G.degree(node);
      });

      const density =
        G.order > 1 ? (2 * G.size) / (G.order * (G.order - 1)) : 0;

      // Agrupa los nodos por comunidad para generar información adicional.
      const communityNodes: Record<number, string[]> = {};
      Object.entries(communities).forEach(([node, cid]) => {
        if (!communityNodes[cid]) communityNodes[cid] = [];
        communityNodes[cid].push(node);
      });

      const communityInfos: CommunityInfo[] = Object.entries(communityNodes)
        .map(([cidStr, members]) => {
          const cid = Number(cidStr);
          const typeCounts: Record<string, number> = {};
          members.forEach((m) => {
            const attrs = G.getNodeAttributes(m);
            const t = attrs.tipo || "?";
            typeCounts[t] = (typeCounts[t] || 0) + 1;
          });
          const dominant =
            Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
            "?";
          const names = members
            .map((m) => G.getNodeAttributes(m).nombre || m)
            .slice(0, 5);

          let internalWeight = 0;
          const memberSet = new Set(members);
          G.forEachEdge((edge, attrs, source, target) => {
            if (memberSet.has(source) && memberSet.has(target)) {
              internalWeight += Number(attrs.weight || 0);
            }
          });

          return {
            id: cid,
            size: members.length,
            dominantType: dominant,
            keyMembers: names,
            internalWeight: Math.round(internalWeight / 2),
          };
        })
        .sort((a, b) => b.size - a.size);

      const topBridgeName = topBridgeId
        ? G.getNodeAttributes(topBridgeId).nombre || topBridgeId
        : "";

      const bridgeRanking: BridgeRankingEntry[] = sortedBridgeEntries.map(
        ([nodeId, score]) => {
          const attrs = G.getNodeAttributes(nodeId);
          return {
            nodeId,
            name: attrs.nombre || nodeId,
            tipo: attrs.tipo || "?",
            score,
          };
        },
      );

      onMetricsChange?.(
        {
          nodes: G.order,
          edges: G.size,
          communities: new Set(Object.values(communities)).size,
          modularity: mod,
          density,
          components,
          avgDegree: G.order > 0 ? totalDegree / G.order : 0,
          topBridge: topBridgeId
            ? { name: topBridgeName, score: maxBtw }
            : null,
          bridgeRanking,
        },
        communityInfos,
      );

      // Construye la lista de nodos y enlaces para el renderizador ForceGraph2D.
      const gNodes: any[] = [];
      G.forEachNode((node, attributes) => {
        const comm = communities[node];
        const btwScore = betweenness[node] || 0;
        gNodes.push({
          id: node,
          ...attributes,
          community: comm,
          color: COLOR_PALETTE[comm % COLOR_PALETTE.length],
          val: 3 + btwScore * 50,
          betweenness: btwScore,
          degree: G.degree(node),
          isBridge: bridgeNodeIds.has(node),
        });
      });

      const gLinks: any[] = [];
      G.forEachEdge((edge, attributes, source, target) => {
        gLinks.push({
          source,
          target,
          weight: attributes.weight,
          ...attributes,
        });
      });

      setGraphData({ nodes: gNodes, links: gLinks });
    } catch (error) {
      console.error("Error processing graph:", error);
    }
  }, [
    nodos,
    aristas,
    minWeight,
    resolution,
    selectedDemographic,
    removedNodeIds,
    onMetricsChange,
    algorithm,
    targetCommunities,
  ]);

  useEffect(() => {
    if (!fgRef.current) return;
    const fg = fgRef.current;
    fg.d3Force("charge")?.strength(-300);
    fg.d3Force("link")?.distance(80);
    fg.d3ReheatSimulation();
  }, [graphData]);

  const paintNode = (
    node: any,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
  ) => {
    const size = node.val || 5;
    const color = node.color || "#999";
    const highlight = node.isBridge;

    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = highlight ? "#f59e0b" : "#1e293b";
    ctx.lineWidth = highlight ? 3 / globalScale : 1.2 / globalScale;

    if (node.tipo === "candidato") {
      drawStar(ctx, node.x, node.y, 5, size * 1.6, size * 0.7);
    } else if (node.tipo === "departamento") {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    } else if (node.tipo === "medio") {
      const s = size * 0.9;
      ctx.beginPath();
      ctx.rect(node.x - s, node.y - s, s * 2, s * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      drawDiamond(ctx, node.x, node.y, size * 1.2);
    }

    if (highlight) {
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 4 / globalScale;
      if (node.tipo === "candidato") {
        ctx.beginPath();
        let rot = (Math.PI / 2) * 3;
        const spikes = 5;
        const outerR = size * 2.2;
        const innerR = size * 1.0;
        const step = Math.PI / spikes;
        ctx.moveTo(node.x, node.y - outerR);
        for (let i = 0; i < spikes; i++) {
          ctx.lineTo(
            node.x + Math.cos(rot) * outerR,
            node.y + Math.sin(rot) * outerR,
          );
          rot += step;
          ctx.lineTo(
            node.x + Math.cos(rot) * innerR,
            node.y + Math.sin(rot) * innerR,
          );
          rot += step;
        }
        ctx.closePath();
        ctx.stroke();
      } else if (node.tipo === "departamento") {
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 2.5, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (node.tipo === "medio") {
        const s = size * 0.9 + 2.5;
        ctx.beginPath();
        ctx.rect(node.x - s, node.y - s, s * 2, s * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        const outer = size * 1.6;
        ctx.moveTo(node.x, node.y - outer);
        ctx.lineTo(node.x + outer, node.y);
        ctx.lineTo(node.x, node.y + outer);
        ctx.lineTo(node.x - outer, node.y);
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Muestra etiquetas solo cuando el zoom es suficientemente grande.
    if (globalScale > 1.2) {
      const fontSize = Math.max(10 / globalScale, 2);
      ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#0f172a";
      ctx.fillText(node.nombre || node.id, node.x, node.y + size + 2);
    }
    ctx.restore();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-inner"
    >
      {/* Si hay datos, renderiza el grafo interactivo; si no, muestra un mensaje de filtro. */}
      {graphData.nodes.length > 0 ? (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeCanvasObject={paintNode}
          nodeLabel={(node: any) =>
            `<div style="padding:4px 8px;background:#0f172a;color:#f8fafc;border-radius:6px;font-size:12px;max-width:220px">
              <b>${node.nombre || node.id}</b><br/>
              Tipo: ${node.tipo || "-"}<br/>
              Comunidad: ${node.community ?? "-"}<br/>
              Intermediacion: ${(node.betweenness || 0).toFixed(4)}${
                node.isBridge ? '<br/><i style="color:#facc15">Click para eliminar este puente</i>' : ''
              }
            </div>`
          }
          onNodeClick={onNodeClick}
          linkColor={() => "rgba(148, 163, 184, 0.25)"}
          linkWidth={(link: any) =>
            Math.max(0.3, (Number(link.weight) / 100) * 2.5)
          }
          cooldownTicks={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          onEngineStop={() => fgRef.current?.zoomToFit(400, 80)}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-slate-400">
          No hay datos suficientes para renderizar el grafo con estos filtros.
        </div>
      )}

      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-sm p-2.5 rounded-lg shadow border border-slate-200 text-[11px] flex gap-3 items-center">
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <polygon
              points="6,0 7.8,4.2 12,4.6 8.8,7.4 9.7,12 6,9.8 2.3,12 3.2,7.4 0,4.6 4.2,4.2"
              fill="none" stroke="#64748b" strokeWidth="1.5"
            />
          </svg>
          Candidato
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-500 bg-transparent inline-block"></span>
          Departamento
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <polygon points="5,0 10,5 5,10 0,5" fill="none" stroke="#64748b" strokeWidth="1.5" />
          </svg>
          Franja
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 border-2 border-slate-500 bg-transparent inline-block"></span>
          Medio
        </span>
      </div>
    </div>
  );
};

// Dibuja una estrella de 5 puntas para representar a los candidatos.
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerR: number,
  innerR: number,
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// Dibuja un rombo para representar franjas demográficas.
function drawDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx + size, cy);
  ctx.lineTo(cx, cy + size);
  ctx.lineTo(cx - size, cy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
