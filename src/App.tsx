/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Graph from "graphology";
import louvain from "graphology-communities-louvain";
import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  GitMerge,
  Info,
  LayoutDashboard,
  Settings,
  Users,
  Zap,
} from "lucide-react";
import Papa from "papaparse";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NetworkGraph } from "./components/NetworkGraph";
import {
  Arista,
  CommunityInfo,
  DemographicComparison,
  GraphMetrics,
  Nodo,
} from "./types";

function computeModularitySimple(
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

export default function App() {
  const logoDark = "/assets/logo_dark_theme.png";

  const [nodos, setNodos] = useState<Nodo[]>([]);
  const [aristas, setAristas] = useState<Arista[]>([]);
  const [loading, setLoading] = useState(true);

  const [minWeight, setMinWeight] = useState(5);
  const [resolution, setResolution] = useState(1.0);
  const [selectedDemographic, setSelectedDemographic] = useState("Todas");
  const [removedNodeId, setRemovedNodeId] = useState<string | undefined>();
  const [compareMode, setCompareMode] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "communities" | "bridges" | "demographics" | "compare"
  >("overview");

  const [compareMinWeight, setCompareMinWeight] = useState(5);
  const [compareResolution, setCompareResolution] = useState(1.5);
  const [compareAlgorithm, setCompareAlgorithm] = useState<
    "louvain" | "girvan-newman"
  >("louvain");
  const [compareTargetCommunities, setCompareTargetCommunities] = useState(4);

  const [metrics, setMetrics] = useState<GraphMetrics | null>(null);
  const [communities, setCommunities] = useState<CommunityInfo[]>([]);
  const [compareMetrics, setCompareMetrics] = useState<GraphMetrics | null>(
    null,
  );
  const [compareCommunities, setCompareCommunities] = useState<CommunityInfo[]>(
    [],
  );

  const [sidebarSection, setSidebarSection] = useState({
    params: true,
    demo: true,
    bridges: true,
    compare: false,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [nodosRes, aristasRes] = await Promise.all([
          fetch("/electoral_nodos.csv"),
          fetch("/electoral_aristas.csv"),
        ]);
        const nodosText = await nodosRes.text();
        const aristasText = await aristasRes.text();

        const nodosData = Papa.parse(nodosText, {
          header: true,
          skipEmptyLines: true,
        }).data as Nodo[];
        const aristasData = Papa.parse(aristasText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        }).data as Arista[];

        setNodos(nodosData);
        setAristas(aristasData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const demographics = useMemo(
    () => [
      "Todas",
      ...nodos
        .filter((n) => n.tipo === "franja_demografica")
        .map((n) => n.nombre),
    ],
    [nodos],
  );

  const handleMainMetrics = useCallback(
    (m: GraphMetrics, c: CommunityInfo[]) => {
      setMetrics(m);
      setCommunities(c);
    },
    [],
  );

  const handleCompareMetrics = useCallback(
    (m: GraphMetrics, c: CommunityInfo[]) => {
      setCompareMetrics(m);
      setCompareCommunities(c);
    },
    [],
  );

  const demographicComparisons = useMemo((): DemographicComparison[] => {
    if (!nodos.length || !aristas.length) return [];

    const franjas = nodos.filter((n) => n.tipo === "franja_demografica");
    return franjas
      .map((franja) => {
        const G = new Graph({ multi: false, type: "undirected" });
        const validIds = new Set(
          nodos
            .filter(
              (n) =>
                n.tipo === "candidato" ||
                n.tipo === "departamento" ||
                n.node_id === franja.node_id,
            )
            .map((n) => n.node_id),
        );

        validIds.forEach((id) => {
          const n = nodos.find((nd) => nd.node_id === id);
          if (n) G.addNode(id, { ...n });
        });

        aristas.forEach((a) => {
          if (
            validIds.has(a.origen) &&
            validIds.has(a.destino) &&
            Number(a.peso) >= minWeight
          ) {
            if (
              G.hasNode(a.origen) &&
              G.hasNode(a.destino) &&
              !G.hasEdge(a.origen, a.destino)
            ) {
              G.addEdge(a.origen, a.destino, { weight: Number(a.peso) });
            }
          }
        });

        G.forEachNode((node) => {
          if (G.degree(node) === 0) G.dropNode(node);
        });

        if (G.order === 0 || G.size === 0) {
          return {
            name: franja.nombre,
            subtipo: franja.subtipo,
            tendency: franja.atributo_2 || "-",
            modularity: 0,
            communities: 0,
            edges: 0,
          };
        }

        try {
          const comm = louvain(G, { resolution });
          const mod = computeModularitySimple(G, comm);
          return {
            name: franja.nombre,
            subtipo: franja.subtipo,
            tendency: franja.atributo_2 || "-",
            modularity: mod,
            communities: new Set(Object.values(comm)).size,
            edges: G.size,
          };
        } catch {
          return {
            name: franja.nombre,
            subtipo: franja.subtipo,
            tendency: franja.atributo_2 || "-",
            modularity: 0,
            communities: 0,
            edges: 0,
          };
        }
      })
      .sort((a, b) => b.modularity - a.modularity);
  }, [nodos, aristas, minWeight, resolution]);

  const toggleSection = (key: keyof typeof sidebarSection) => {
    setSidebarSection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Cargando datos electorales...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20 flex-shrink-0">
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <img
              src={logoDark}
              alt="Logo institucional"
              className="h-11 w-auto rounded-md bg-white/10 p-1 ring-1 ring-white/20"
            />
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Red Electoral 2026
              </h1>
              <p className="text-blue-100 text-xs mt-1">
                Ejercicio 2A - Mapa de Afinidades
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Network Params */}
          <section className="border-b border-slate-100">
            <button
              onClick={() => toggleSection("params")}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-blue-600" /> Parametros de
                Red
              </h2>
              {sidebarSection.params ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {sidebarSection.params && (
              <div className="px-4 pb-4 space-y-4">
                <div>
                  <label className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Peso Minimo</span>
                    <span className="text-blue-600 font-bold">
                      {minWeight}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={minWeight}
                    onChange={(e) => setMinWeight(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Filtra aristas debiles para revelar estructuras fuertes.
                  </p>
                </div>
                <div>
                  <label className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Resolucion Louvain</span>
                    <span className="text-blue-600 font-bold">
                      {resolution.toFixed(1)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={resolution}
                    onChange={(e) => setResolution(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    &gt;1 = mas comunidades pequenas.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Demographic Filter */}
          <section className="border-b border-slate-100">
            <button
              onClick={() => toggleSection("demo")}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-600" /> Filtro
                Demografico
              </h2>
              {sidebarSection.demo ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {sidebarSection.demo && (
              <div className="px-4 pb-4">
                <select
                  value={selectedDemographic}
                  onChange={(e) => setSelectedDemographic(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {demographics.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-2">
                  Aisla candidatos + departamentos + franja seleccionada.
                </p>
              </div>
            )}
          </section>

          {/* Bridge Analysis */}
          <section className="border-b border-slate-100">
            <button
              onClick={() => toggleSection("bridges")}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <GitMerge className="w-3.5 h-3.5 text-amber-600" /> Analisis de
                Puentes
              </h2>
              {sidebarSection.bridges ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {sidebarSection.bridges && (
              <div className="px-4 pb-4">
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <p className="text-[10px] text-amber-800 mb-2">
                    Haz clic en un nodo del grafo para eliminarlo y observar
                    como cambia la cohesion de la red.
                  </p>
                  {removedNodeId ? (
                    <div className="flex items-center justify-between bg-white p-2 rounded border border-amber-200">
                      <span className="text-xs font-medium text-slate-700 truncate mr-2">
                        {nodos.find((n) => n.node_id === removedNodeId)
                          ?.nombre || removedNodeId}
                      </span>
                      <button
                        onClick={() => setRemovedNodeId(undefined)}
                        className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-700 px-2 py-1 rounded transition-colors font-medium"
                      >
                        Restaurar
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic text-center p-1.5">
                      Ningun nodo eliminado
                    </div>
                  )}
                </div>
                {metrics?.topBridge && (
                  <div className="mt-2 text-[10px] text-slate-500">
                    Nodo puente principal:{" "}
                    <b className="text-slate-700">{metrics.topBridge.name}</b> (
                    {metrics.topBridge.score.toFixed(4)})
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Compare Mode */}
          <section className="border-b border-slate-100">
            <button
              onClick={() => toggleSection("compare")}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-purple-600" /> Modo
                Comparacion
              </h2>
              {sidebarSection.compare ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {sidebarSection.compare && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">
                    Activar comparacion
                  </span>
                  <button
                    onClick={() => setCompareMode(!compareMode)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${compareMode ? "bg-purple-600" : "bg-slate-300"}`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${compareMode ? "translate-x-5" : ""}`}
                    />
                  </button>
                </div>
                {compareMode && (
                  <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-1 block">
                        Algoritmo (Grafo 2)
                      </label>
                      <select
                        value={compareAlgorithm}
                        onChange={(e) =>
                          setCompareAlgorithm(
                            e.target.value as "louvain" | "girvan-newman",
                          )
                        }
                        className="w-full border border-purple-200 rounded-md p-2 text-xs bg-white"
                      >
                        <option value="louvain">Louvain</option>
                        <option value="girvan-newman">Girvan-Newman</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Peso Min. (Grafo 2)</span>
                        <span className="text-purple-600 font-bold">
                          {compareMinWeight}%
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={compareMinWeight}
                        onChange={(e) =>
                          setCompareMinWeight(Number(e.target.value))
                        }
                        className="w-full accent-purple-600"
                      />
                    </div>
                    <div>
                      <label className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>
                          {compareAlgorithm === "louvain"
                            ? "Resolucion (Grafo 2)"
                            : "Comunidades objetivo"}
                        </span>
                        <span className="text-purple-600 font-bold">
                          {compareAlgorithm === "louvain"
                            ? compareResolution.toFixed(1)
                            : compareTargetCommunities}
                        </span>
                      </label>
                      {compareAlgorithm === "louvain" ? (
                        <input
                          type="range"
                          min="0.1"
                          max="3"
                          step="0.1"
                          value={compareResolution}
                          onChange={(e) =>
                            setCompareResolution(Number(e.target.value))
                          }
                          className="w-full accent-purple-600"
                        />
                      ) : (
                        <input
                          type="range"
                          min="2"
                          max="12"
                          step="1"
                          value={compareTargetCommunities}
                          onChange={(e) =>
                            setCompareTargetCommunities(Number(e.target.value))
                          }
                          className="w-full accent-purple-600"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
          Estrella=Candidato | Circulo=Depto | Diamante=Franja | Cuadrado=Medio
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Metrics Bar */}
        {metrics && (
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-6 flex-shrink-0">
            <MetricBadge label="Nodos" value={metrics.nodes} />
            <MetricBadge label="Aristas" value={metrics.edges} />
            <MetricBadge
              label="Comunidades"
              value={metrics.communities}
              color="blue"
            />
            <MetricBadge
              label="Modularidad"
              value={metrics.modularity.toFixed(3)}
              color={metrics.modularity > 0.3 ? "green" : "amber"}
            />
            <MetricBadge label="Densidad" value={metrics.density.toFixed(4)} />
            <MetricBadge label="Componentes" value={metrics.components} />
            {metrics.topBridge && (
              <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Puente:{" "}
                <b className="text-slate-700">{metrics.topBridge.name}</b>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white border-b border-slate-200 px-6 flex gap-1 flex-shrink-0">
          {[
            { key: "overview", label: "Resumen" },
            { key: "communities", label: "Comunidades" },
            { key: "bridges", label: "Puentes" },
            { key: "demographics", label: "Demografias" },
            { key: "compare", label: "Comparacion" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                if (tab.key === "compare") setCompareMode(true);
              }}
              className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4 h-full">
              <NarrativeBlock icon={<Info className="w-4 h-4 text-blue-500" />}>
                La red integra <b>candidatos</b>, <b>departamentos</b>,{" "}
                <b>franjas demograficas</b> y <b>medios de comunicacion</b> en
                un unico espacio topologico. Las comunidades emergen de la
                densidad interna de conexiones, no de etiquetas ideologicas
                predefinidas. El tamano de cada nodo refleja su centralidad de
                intermediacion: actores mas grandes son puentes criticos entre
                bloques de afinidad.
              </NarrativeBlock>
              <div className="flex gap-4 flex-1 min-h-0">
                <div className="flex-[2] min-h-0">
                  <NetworkGraph
                    nodos={nodos}
                    aristas={aristas}
                    minWeight={minWeight}
                    resolution={resolution}
                    selectedDemographic={selectedDemographic}
                    removedNodeId={removedNodeId}
                    onNodeClick={(node) => setRemovedNodeId(node.id)}
                    onMetricsChange={handleMainMetrics}
                  />
                </div>
                <div className="flex-1 overflow-auto space-y-3">
                  <PanelCard title="Lectura rapida">
                    {metrics && (
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <p>
                          Grado promedio ponderado:{" "}
                          <b>{metrics.avgDegree.toFixed(2)}</b>
                        </p>
                        <p>
                          Componentes conectados: <b>{metrics.components}</b>
                        </p>
                        {metrics.topBridge && (
                          <p>
                            Mayor intermediacion:{" "}
                            <b>{metrics.topBridge.name}</b> (
                            {metrics.topBridge.score.toFixed(4)})
                          </p>
                        )}
                      </div>
                    )}
                  </PanelCard>
                  <PanelCard title="Comunidades detectadas">
                    <div className="space-y-2">
                      {communities.map((c) => (
                        <div
                          key={c.id}
                          className="p-2 bg-slate-50 rounded border border-slate-100"
                        >
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-700">
                              Comunidad {c.id}
                            </span>
                            <span className="text-slate-400">
                              {c.size} nodos
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Tipo dominante: {c.dominantType}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {c.keyMembers.join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </PanelCard>
                  <NarrativeBlock
                    icon={<Info className="w-4 h-4 text-green-500" />}
                  >
                    Modularidad {">"} 0.3 indica estructura comunitaria
                    significativa. Comunidades con alto peso interno revelan
                    ecosistemas de afinidad cohesionados: departamentos que
                    votan sincronizadamente y medios que cubren favorablemente
                    al mismo candidato.
                  </NarrativeBlock>
                </div>
              </div>
            </div>
          )}

          {activeTab === "communities" && (
            <div className="flex flex-col gap-4 h-full">
              <NarrativeBlock icon={<Info className="w-4 h-4 text-blue-500" />}>
                El algoritmo de <b>Louvain</b> optimiza la funcion de
                modularidad Q, agrupando nodos cuya densidad de conexiones
                internas supera la esperada en una red aleatoria equivalente. Al
                ajustar la resolucion, se modula la granularidad: valores altos
                fragmentan comunidades grandes en subclusters mas finos.
              </NarrativeBlock>
              <div className="flex-1 min-h-0">
                <NetworkGraph
                  nodos={nodos}
                  aristas={aristas}
                  minWeight={minWeight}
                  resolution={resolution}
                  selectedDemographic={selectedDemographic}
                  removedNodeId={removedNodeId}
                  onNodeClick={(node) => setRemovedNodeId(node.id)}
                  onMetricsChange={handleMainMetrics}
                />
              </div>
              {communities.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-2.5 font-semibold text-slate-600">
                          Comunidad
                        </th>
                        <th className="text-left p-2.5 font-semibold text-slate-600">
                          Nodos
                        </th>
                        <th className="text-left p-2.5 font-semibold text-slate-600">
                          Tipo Dominante
                        </th>
                        <th className="text-left p-2.5 font-semibold text-slate-600">
                          Miembros Clave
                        </th>
                        <th className="text-right p-2.5 font-semibold text-slate-600">
                          Peso Interno
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {communities.map((c) => (
                        <tr
                          key={c.id}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="p-2.5 font-medium">{c.id}</td>
                          <td className="p-2.5">{c.size}</td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px]">
                              {c.dominantType}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-500 truncate max-w-xs">
                            {c.keyMembers.join(", ")}
                          </td>
                          <td className="p-2.5 text-right font-mono">
                            {c.internalWeight.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "bridges" && (
            <div className="flex flex-col gap-4 h-full">
              <NarrativeBlock
                icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
              >
                La <b>Centralidad de Intermediacion</b> mide con que frecuencia
                un nodo se encuentra en el camino mas corto entre cualquier par
                de actores. Un nodo con alta intermediacion opera como corredor
                critico: conecta comunidades que de otro modo estarian aisladas.
                En el contexto electoral, estos puentes pueden ser departamentos
                swing, medios de cobertura transversal o candidatos de centro
                que capturan audiencias de multiples bloques ideologicos.
              </NarrativeBlock>
              <div className="flex-1 min-h-0">
                <NetworkGraph
                  nodos={nodos}
                  aristas={aristas}
                  minWeight={minWeight}
                  resolution={resolution}
                  selectedDemographic={selectedDemographic}
                  removedNodeId={removedNodeId}
                  onNodeClick={(node) => setRemovedNodeId(node.id)}
                  onMetricsChange={handleMainMetrics}
                />
              </div>
              {removedNodeId && metrics && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Prueba de estres: nodo "
                    {nodos.find((n) => n.node_id === removedNodeId)?.nombre}"
                    removido
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-amber-900">
                        {metrics.nodes}
                      </div>
                      <div className="text-[10px] text-amber-600">
                        Nodos restantes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-amber-900">
                        {metrics.communities}
                      </div>
                      <div className="text-[10px] text-amber-600">
                        Comunidades
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-amber-900">
                        {metrics.modularity.toFixed(3)}
                      </div>
                      <div className="text-[10px] text-amber-600">
                        Modularidad
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-amber-900">
                        {metrics.components}
                      </div>
                      <div className="text-[10px] text-amber-600">
                        Componentes
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-700 mt-2">
                    Si la red se fragmenta significativamente, indica alta
                    dependencia en este intermediario. Haz clic en "Restaurar"
                    en la barra lateral para revertir.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "demographics" && (
            <div className="flex flex-col gap-4 h-full">
              <NarrativeBlock
                icon={<Users className="w-4 h-4 text-emerald-500" />}
              >
                Este modulo permite aislar <b>franjas demograficas</b>{" "}
                individuales y observar como cambia la estructura comunitaria
                cuando el analisis se restringe a candidatos, departamentos y un
                unico segmento sociodemografico. La pregunta clave:{" "}
                <i>
                  cual corte sociologico produce ecosistemas de afinidad con
                  mayor cohesion (modularidad)?
                </i>
              </NarrativeBlock>
              <div className="flex-1 min-h-0">
                <NetworkGraph
                  nodos={nodos}
                  aristas={aristas}
                  minWeight={minWeight}
                  resolution={resolution}
                  selectedDemographic={selectedDemographic}
                  removedNodeId={removedNodeId}
                  onNodeClick={(node) => setRemovedNodeId(node.id)}
                  onMetricsChange={handleMainMetrics}
                />
              </div>
              <PanelCard title="Comparativa de modularidad por franja demografica">
                <p className="text-[10px] text-slate-500 mb-2">
                  La tabla muestra la modularidad obtenida al construir el
                  subgrafo con cada franja, permitiendo identificar cual
                  segmento genera la mayor diferenciacion comunitaria.
                </p>
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-2 font-semibold text-slate-600">
                        Franja
                      </th>
                      <th className="text-left p-2 font-semibold text-slate-600">
                        Subtipo
                      </th>
                      <th className="text-left p-2 font-semibold text-slate-600">
                        Tendencia
                      </th>
                      <th className="text-right p-2 font-semibold text-slate-600">
                        Modularidad
                      </th>
                      <th className="text-right p-2 font-semibold text-slate-600">
                        Comunidades
                      </th>
                      <th className="text-right p-2 font-semibold text-slate-600">
                        Aristas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {demographicComparisons.map((d, i) => (
                      <tr
                        key={d.name}
                        className={`border-t border-slate-100 ${i === 0 ? "bg-emerald-50" : "hover:bg-slate-50"}`}
                      >
                        <td className="p-2 font-medium">{d.name}</td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                            {d.subtipo}
                          </span>
                        </td>
                        <td className="p-2 text-slate-500">{d.tendency}</td>
                        <td className="p-2 text-right font-mono font-bold">
                          {d.modularity.toFixed(4)}
                        </td>
                        <td className="p-2 text-right">{d.communities}</td>
                        <td className="p-2 text-right">{d.edges}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {demographicComparisons.length > 0 && (
                  <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-100 rounded text-[10px] text-emerald-800">
                    <b>Hallazgo:</b> La franja{" "}
                    <b>{demographicComparisons[0].name}</b> (tendencia:{" "}
                    {demographicComparisons[0].tendency}) produce la mayor
                    modularidad (
                    <b>{demographicComparisons[0].modularity.toFixed(4)}</b>),
                    indicando que este corte sociologico genera los ecosistemas
                    de afinidad mas diferenciados.
                  </div>
                )}
              </PanelCard>
            </div>
          )}

          {activeTab === "compare" && (
            <div className="flex flex-col gap-4 h-full">
              <NarrativeBlock
                icon={<BarChart3 className="w-4 h-4 text-purple-500" />}
              >
                Este modulo permite contrastar dos configuraciones analiticas
                simultaneamente: distintos umbrales de poda o resoluciones
                divergentes. La matriz comparativa bajo los grafos cuantifica
                las diferencias topologicas. Active el modo comparacion en la
                barra lateral para configurar el segundo escenario.
              </NarrativeBlock>
              <div
                className={`flex-1 min-h-0 flex ${compareMode ? "gap-4" : ""}`}
              >
                <div
                  className={`${compareMode ? "flex-1" : "w-full"} relative min-h-0`}
                >
                  {compareMode && (
                    <div className="absolute top-2 right-3 z-20 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                      Config 1
                    </div>
                  )}
                  <NetworkGraph
                    nodos={nodos}
                    aristas={aristas}
                    minWeight={minWeight}
                    resolution={resolution}
                    selectedDemographic={selectedDemographic}
                    removedNodeId={removedNodeId}
                    onNodeClick={(node) => setRemovedNodeId(node.id)}
                    onMetricsChange={handleMainMetrics}
                  />
                </div>
                {compareMode && (
                  <div className="flex-1 relative min-h-0">
                    <div className="absolute top-2 right-3 z-20 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                      Config 2
                    </div>
                    <NetworkGraph
                      nodos={nodos}
                      aristas={aristas}
                      minWeight={compareMinWeight}
                      resolution={compareResolution}
                      algorithm={compareAlgorithm}
                      targetCommunities={compareTargetCommunities}
                      selectedDemographic={selectedDemographic}
                      removedNodeId={removedNodeId}
                      onNodeClick={(node) => setRemovedNodeId(node.id)}
                      onMetricsChange={handleCompareMetrics}
                    />
                  </div>
                )}
              </div>
              {compareMode && metrics && compareMetrics && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-2.5 font-semibold text-slate-600">
                          Escenario
                        </th>
                        <th className="text-right p-2.5 font-semibold text-slate-600">
                          Nodos
                        </th>
                        <th className="text-right p-2.5 font-semibold text-slate-600">
                          Aristas
                        </th>
                        <th className="text-right p-2.5 font-semibold text-slate-600">
                          Modularidad
                        </th>
                        <th className="text-right p-2.5 font-semibold text-slate-600">
                          Comunidades
                        </th>
                        <th className="text-right p-2.5 font-semibold text-slate-600">
                          Componentes
                        </th>
                        <th className="text-right p-2.5 font-semibold text-slate-600">
                          Densidad
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-slate-100 bg-blue-50/30">
                        <td className="p-2.5 font-medium">
                          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-1.5"></span>
                          Config 1
                        </td>
                        <td className="p-2.5 text-right">{metrics.nodes}</td>
                        <td className="p-2.5 text-right">{metrics.edges}</td>
                        <td className="p-2.5 text-right font-mono font-bold">
                          {metrics.modularity.toFixed(4)}
                        </td>
                        <td className="p-2.5 text-right">
                          {metrics.communities}
                        </td>
                        <td className="p-2.5 text-right">
                          {metrics.components}
                        </td>
                        <td className="p-2.5 text-right font-mono">
                          {metrics.density.toFixed(4)}
                        </td>
                      </tr>
                      <tr className="border-t border-slate-100 bg-purple-50/30">
                        <td className="p-2.5 font-medium">
                          <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mr-1.5"></span>
                          Config 2 (
                          {compareAlgorithm === "louvain"
                            ? "Louvain"
                            : "Girvan-Newman"}
                          )
                        </td>
                        <td className="p-2.5 text-right">
                          {compareMetrics.nodes}
                        </td>
                        <td className="p-2.5 text-right">
                          {compareMetrics.edges}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold">
                          {compareMetrics.modularity.toFixed(4)}
                        </td>
                        <td className="p-2.5 text-right">
                          {compareMetrics.communities}
                        </td>
                        <td className="p-2.5 text-right">
                          {compareMetrics.components}
                        </td>
                        <td className="p-2.5 text-right font-mono">
                          {compareMetrics.density.toFixed(4)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {!compareMode && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-purple-700">
                    Activa el <b>Modo Comparacion</b> en la barra lateral para
                    ver dos grafos lado a lado.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  const colorClass =
    color === "green"
      ? "text-green-600"
      : color === "amber"
        ? "text-amber-600"
        : color === "blue"
          ? "text-blue-600"
          : "text-slate-800";
  return (
    <div className="text-center">
      <div className={`text-sm font-bold ${colorClass}`}>{value}</div>
      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

function PanelCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
      <h3 className="text-xs font-semibold text-slate-700 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function NarrativeBlock({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 flex gap-2.5 items-start shadow-sm flex-shrink-0">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <p className="text-xs text-slate-600 leading-relaxed">{children}</p>
    </div>
  );
}
