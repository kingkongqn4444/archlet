// Raw JSON export generator for archlet diagrams
import { type IacNode, type IacEdge } from "./utils";

export function generateRawJson(nodes: IacNode[], edges: IacEdge[]): string {
  const payload = {
    archletVersion: "1.0",
    generatedAt: new Date().toISOString(),
    nodes,
    edges,
  };
  return JSON.stringify(payload, null, 2);
}
