import { type RFNode, type RFEdge } from "@/features/canvas/store/diagram-store";
import { autoLayout } from "@/features/canvas/layout/auto-layout";
import { VARIANTS_CATALOG, TEMPLATES } from "@archlet/shared";
import { PATTERNS_CATALOG } from "@archlet/shared";
import type { NodeType, Diagram } from "@archlet/shared";

// ---------------------------------------------------------------------------
// Action item shape
// ---------------------------------------------------------------------------

export type ActionGroup = "Actions" | "Templates" | "Nodes" | "Variants" | "Patterns";

export type PaletteItem = {
  id: string;
  label: string;
  description: string;
  group: ActionGroup;
  icon: string; // emoji or short text
  onSelect: () => void;
};

// ---------------------------------------------------------------------------
// Builder helpers
// ---------------------------------------------------------------------------

type BuildContext = {
  nodes: RFNode[];
  edges: RFEdge[];
  applyLayout: (positions: Map<string, { x: number; y: number }>) => void;
  openTemplates: () => void;
  openExport: () => void;
  openShare: () => void;
  openAi: () => void;
  runSimulation: (() => void) | null;
  stopSimulation: (() => void) | null;
  openReview: () => void;
  openMentor?: () => void;
  addVariantNode: (type: NodeType, variantId: string, label: string) => void;
  navigate: (path: string) => void;
  onSelectNode: (id: string) => void;
  loadTemplate: (diagram: Diagram) => void;
  toggleFailureMode?: () => void;
  dropPattern?: (patternId: string) => void;
};

export function buildPaletteItems(ctx: BuildContext): PaletteItem[] {
  const items: PaletteItem[] = [];

  // --- Actions group ---
  items.push({
    id: "action-templates",
    label: "Browse Templates",
    description: "Open the template gallery",
    group: "Actions",
    icon: "📚",
    onSelect: ctx.openTemplates,
  });

  items.push({
    id: "action-auto-arrange",
    label: "Auto-arrange",
    description: "Apply Dagre layout to current diagram",
    group: "Actions",
    icon: "⬡",
    onSelect: () => {
      if (ctx.nodes.length === 0) return;
      const positions = autoLayout(ctx.nodes, ctx.edges, "LR");
      ctx.applyLayout(positions);
    },
  });

  items.push({
    id: "action-export",
    label: "Export",
    description: "Export diagram as PNG, PDF or IaC",
    group: "Actions",
    icon: "⬇",
    onSelect: ctx.openExport,
  });

  items.push({
    id: "action-share",
    label: "Share",
    description: "Share diagram via public link",
    group: "Actions",
    icon: "🔗",
    onSelect: ctx.openShare,
  });

  items.push({
    id: "action-ai",
    label: "AI Generate",
    description: "Generate diagram with AI",
    group: "Actions",
    icon: "✨",
    onSelect: ctx.openAi,
  });

  items.push({
    id: "action-analyze",
    label: "Analyze",
    description: "Run design critic / review",
    group: "Actions",
    icon: "🩺",
    onSelect: ctx.openReview,
  });

  if (ctx.openMentor) {
    items.push({
      id: "action-mentor",
      label: "Open Mentor",
      description: "Chat with AI system design mentor (⌘M)",
      group: "Actions",
      icon: "🧠",
      onSelect: ctx.openMentor,
    });
  }

  if (ctx.runSimulation) {
    items.push({
      id: "action-run",
      label: "Run Simulation",
      description: "Start traffic simulation",
      group: "Actions",
      icon: "▶",
      onSelect: ctx.runSimulation,
    });
  }

  if (ctx.stopSimulation) {
    items.push({
      id: "action-stop",
      label: "Stop Simulation",
      description: "Stop running simulation",
      group: "Actions",
      icon: "⏹",
      onSelect: ctx.stopSimulation,
    });
  }

  if (ctx.toggleFailureMode) {
    items.push({
      id: "action-failure-mode",
      label: "Failure Mode",
      description: "Toggle failure mode — click nodes to kill them",
      group: "Actions",
      icon: "💀",
      onSelect: ctx.toggleFailureMode,
    });
  }

  items.push({
    id: "action-workspace",
    label: "Go to Workspace",
    description: "Open the diagrams workspace",
    group: "Actions",
    icon: "🏠",
    onSelect: () => ctx.navigate("/d"),
  });

  // --- Templates group ---
  for (const tmpl of TEMPLATES) {
    const diagram: Diagram = {
      id: `template-${tmpl.id}-${Date.now()}`,
      name: tmpl.name,
      activeLevel: "high",
      levels: {
        high: tmpl.diagram,
        mid: { nodes: [], edges: [] },
        low: { nodes: [], edges: [] },
      },
    };
    items.push({
      id: `template-${tmpl.id}`,
      label: tmpl.name,
      description: tmpl.description,
      group: "Templates",
      icon: "📐",
      onSelect: () => ctx.loadTemplate(diagram),
    });
  }

  // --- Nodes group (current diagram nodes) ---
  for (const node of ctx.nodes) {
    items.push({
      id: `node-${node.id}`,
      label: String(node.data.label ?? node.id),
      description: `${node.type} · ${String(node.data.variant ?? "")}`,
      group: "Nodes",
      icon: "◈",
      onSelect: () => ctx.onSelectNode(node.id),
    });
  }

  // --- Variants group ---
  const entries = Object.entries(VARIANTS_CATALOG) as [NodeType, (typeof VARIANTS_CATALOG)[NodeType]][];
  for (const [type, variants] of entries) {
    for (const v of variants) {
      items.push({
        id: `variant-${type}-${v.id}`,
        label: v.label,
        description: v.description ?? type,
        group: "Variants",
        icon: "⊕",
        onSelect: () => ctx.addVariantNode(type, v.id, v.label),
      });
    }
  }

  // --- Patterns group ---
  if (ctx.dropPattern) {
    for (const pattern of PATTERNS_CATALOG) {
      const dropFn = ctx.dropPattern;
      items.push({
        id: `pattern-${pattern.id}`,
        label: pattern.name,
        description: pattern.description,
        group: "Patterns",
        icon: "◈",
        onSelect: () => dropFn(pattern.id),
      });
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// Search / relevance sort
// ---------------------------------------------------------------------------

export function filterAndSort(items: PaletteItem[], query: string): PaletteItem[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();

  type Scored = { item: PaletteItem; score: number };
  const scored: Scored[] = [];

  for (const item of items) {
    const label = item.label.toLowerCase();
    const desc = item.description.toLowerCase();
    const group = item.group.toLowerCase();

    let score = 0;
    if (label === q) score = 100;
    else if (label.startsWith(q)) score = 80;
    else if (label.includes(q)) score = 60;
    else if (desc.includes(q)) score = 40;
    else if (group.includes(q)) score = 20;

    if (score > 0) scored.push({ item, score });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.label.localeCompare(b.item.label);
  });

  return scored.map((s) => s.item);
}
