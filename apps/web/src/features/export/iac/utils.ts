// Shared utilities for IaC generators

export type IacNode = {
  id: string;
  type: string;
  data: {
    label?: string;
    variant?: string;
    config?: Record<string, unknown>;
  };
};

export type IacEdge = {
  source: string;
  target: string;
};

/** Sanitize a label to a valid resource name (snake_case, alphanumeric + underscore) */
export function sanitizeName(label: string | undefined, fallback = "unknown"): string {
  return (label ?? fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    || fallback;
}

/** Indent each line of text by n spaces */
export function indent(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line.trim() === "" ? "" : pad + line))
    .join("\n");
}

/** Get config value with typed fallback */
export function cfg<T>(config: Record<string, unknown> | undefined, key: string, fallback: T): T {
  const val = config?.[key];
  return val !== undefined ? (val as T) : fallback;
}

/** Build depends_on map: nodeId -> list of service names it depends on */
export function buildDependsOn(
  nodes: IacNode[],
  edges: IacEdge[]
): Map<string, string[]> {
  const nameById = new Map<string, string>();
  for (const n of nodes) {
    nameById.set(n.id, sanitizeName(n.data.label));
  }
  const deps = new Map<string, string[]>();
  for (const e of edges) {
    const targetName = nameById.get(e.target);
    const sourceName = nameById.get(e.source);
    if (!targetName || !sourceName || targetName === sourceName) continue;
    if (!deps.has(e.target)) deps.set(e.target, []);
    deps.get(e.target)!.push(sourceName);
  }
  return deps;
}

/** Topological sort of nodes by edges (source before target) */
export function topoSort(nodes: IacNode[], edges: IacEdge[]): IacNode[] {
  const order: IacNode[] = [];
  const visited = new Set<string>();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const adjOut = new Map<string, string[]>();
  for (const e of edges) {
    if (!adjOut.has(e.source)) adjOut.set(e.source, []);
    adjOut.get(e.source)!.push(e.target);
  }
  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    for (const dep of adjOut.get(id) ?? []) visit(dep);
    const n = nodeMap.get(id);
    if (n) order.unshift(n);
  }
  for (const n of nodes) visit(n.id);
  return order;
}
