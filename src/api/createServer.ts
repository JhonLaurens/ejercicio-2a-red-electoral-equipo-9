import express, { Request, Response } from "express";

type NodeInput = { id?: string; node_id?: string };
type EdgeInput = {
  origen?: string;
  source?: string;
  destino?: string;
  target?: string;
};

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function normalizeNodeId(node: NodeInput): string | null {
  return node.node_id ?? node.id ?? null;
}

function edgeEndpoints(edge: EdgeInput): [string | null, string | null] {
  const source = edge.origen ?? edge.source ?? null;
  const target = edge.destino ?? edge.target ?? null;
  return [source, target];
}

export function createServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", service: "electoral-api" });
  });

  app.post("/api/network/summary", (req: Request, res: Response) => {
    const { nodes, edges } = req.body as {
      nodes?: unknown;
      edges?: unknown;
    };

    if (!isArray(nodes) || !isArray(edges)) {
      return res.status(400).json({
        error: "INVALID_PAYLOAD",
        message: "nodes y edges deben ser arreglos",
      });
    }

    const nodeIds = new Set<string>();
    for (const node of nodes as NodeInput[]) {
      const id = normalizeNodeId(node);
      if (!id) {
        return res.status(400).json({
          error: "INVALID_NODE",
          message: "Cada nodo debe incluir node_id o id",
        });
      }
      nodeIds.add(id);
    }

    let validEdges = 0;
    for (const edge of edges as EdgeInput[]) {
      const [source, target] = edgeEndpoints(edge);
      if (!source || !target) {
        return res.status(400).json({
          error: "INVALID_EDGE",
          message: "Cada arista debe incluir origen/source y destino/target",
        });
      }
      if (nodeIds.has(source) && nodeIds.has(target) && source !== target) {
        validEdges += 1;
      }
    }

    const nodeCount = nodeIds.size;
    const maxEdges = nodeCount > 1 ? (nodeCount * (nodeCount - 1)) / 2 : 0;
    const density = maxEdges === 0 ? 0 : validEdges / maxEdges;

    return res.status(200).json({
      nodeCount,
      edgeCount: validEdges,
      density: Number(density.toFixed(4)),
    });
  });

  return app;
}
