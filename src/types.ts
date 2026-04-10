export interface Nodo {
  node_id: string;
  nombre: string;
  tipo: string;
  subtipo: string;
  atributo_1: string;
  atributo_1_label: string;
  atributo_2: string;
  atributo_2_label: string;
  atributo_3: string;
  atributo_3_label: string;
  atributo_4: string;
  atributo_4_label: string;
  region: string;
}

export interface Arista {
  edge_id: string;
  origen: string;
  destino: string;
  tipo_arista: string;
  peso: number;
  votos_estimados: number;
  afinidad_bloque: number;
  fuente_dato: string;
  nota: string;
}

export interface BridgeRankingEntry {
  nodeId: string;
  name: string;
  tipo: string;
  score: number;
}

export interface GraphMetrics {
  nodes: number;
  edges: number;
  communities: number;
  modularity: number;
  density: number;
  components: number;
  avgDegree: number;
  topBridge: { name: string; score: number } | null;
  bridgeRanking: BridgeRankingEntry[];
}

export interface CommunityInfo {
  id: number;
  size: number;
  dominantType: string;
  keyMembers: string[];
  internalWeight: number;
}

export interface DemographicComparison {
  name: string;
  subtipo: string;
  tendency: string;
  modularity: number;
  communities: number;
  edges: number;
}
