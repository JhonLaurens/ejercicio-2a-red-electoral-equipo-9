import request from "supertest";
import { describe, expect, it } from "vitest";

import { createServer } from "../../src/api/createServer";

describe("Electoral API", () => {
  const app = createServer();

  it("GET /api/health responde estado ok", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", service: "electoral-api" });
  });

  it("POST /api/network/summary calcula conteos y densidad", async () => {
    const payload = {
      nodes: [{ node_id: "n1" }, { node_id: "n2" }, { node_id: "n3" }],
      edges: [
        { origen: "n1", destino: "n2" },
        { source: "n2", target: "n3" },
        { origen: "n1", destino: "n1" },
      ],
    };

    const response = await request(app)
      .post("/api/network/summary")
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nodeCount: 3,
      edgeCount: 2,
      density: 0.6667,
    });
  });

  it("POST /api/network/summary acepta id/source/target alternativos", async () => {
    const payload = {
      nodes: [{ id: "a" }, { id: "b" }],
      edges: [{ source: "a", target: "b" }],
    };

    const response = await request(app)
      .post("/api/network/summary")
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nodeCount: 2,
      edgeCount: 1,
      density: 1,
    });
  });

  it("POST /api/network/summary maneja grafo de un solo nodo", async () => {
    const response = await request(app)
      .post("/api/network/summary")
      .send({ nodes: [{ node_id: "solo" }], edges: [] });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      nodeCount: 1,
      edgeCount: 0,
      density: 0,
    });
  });

  it("POST /api/network/summary valida payload arrays", async () => {
    const response = await request(app)
      .post("/api/network/summary")
      .send({ nodes: {}, edges: [] });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("INVALID_PAYLOAD");
  });

  it("POST /api/network/summary sin body retorna INVALID_PAYLOAD", async () => {
    const response = await request(app).post("/api/network/summary");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("INVALID_PAYLOAD");
  });

  it("POST /api/network/summary valida node_id/id", async () => {
    const response = await request(app)
      .post("/api/network/summary")
      .send({ nodes: [{}], edges: [] });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("INVALID_NODE");
  });

  it("POST /api/network/summary valida endpoints de arista", async () => {
    const response = await request(app)
      .post("/api/network/summary")
      .send({ nodes: [{ id: "a" }, { id: "b" }], edges: [{ source: "a" }] });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("INVALID_EDGE");
  });

  it("POST /api/network/summary valida arista sin origen/source", async () => {
    const response = await request(app)
      .post("/api/network/summary")
      .send({
        nodes: [{ id: "a" }, { id: "b" }],
        edges: [{ destino: "b" }],
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("INVALID_EDGE");
  });
});
