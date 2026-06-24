import { useEffect, useCallback, useRef } from "react";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import { Simulator } from "./simulator";
import { useSimStore } from "./sim-store";

// Module-level singleton — RunButton + FlowOverlay share the SAME instance
let singleton: Simulator | null = null;
let listenerAttached = false;

type SnapshotCb = NonNullable<ConstructorParameters<typeof Simulator>[2]>;

function ensureSingleton(cb: SnapshotCb): Simulator {
  if (singleton) return singleton;
  const { nodes, edges } = useDiagramStore.getState();
  singleton = new Simulator(nodes, edges, cb);
  return singleton;
}

export function useSimulate() {
  const { setRunning, applySnapshot, clearMetrics, isRunning } = useSimStore();
  const simRef = useRef<Simulator | null>(null);

  const handleSnapshot = useCallback<SnapshotCb>(
    (snap) => applySnapshot(snap),
    [applySnapshot]
  );

  // Always point to the current module-level singleton (which may have been
  // rebuilt by the topology listener). This prevents FlowOverlay from reading
  // stale packets after a topology change.
  simRef.current = ensureSingleton(handleSnapshot);

  // Rebuild singleton only when topology actually changes (add/remove node/edge,
  // edge endpoints, or node type/variant). Drag-position updates and selection
  // do not justify a sim reset.
  useEffect(() => {
    if (listenerAttached) return;
    listenerAttached = true;
    const topologyKey = (s: ReturnType<typeof useDiagramStore.getState>): string => {
      const n = s.nodes
        .map((x) => `${x.id}:${x.type}:${(x.data?.variant as string) ?? ""}`)
        .sort()
        .join("|");
      const e = s.edges
        .map((x) => `${x.id}:${x.source}->${x.target}`)
        .sort()
        .join("|");
      return `${n}#${e}`;
    };
    let lastKey = topologyKey(useDiagramStore.getState());
    const unsub = useDiagramStore.subscribe((state) => {
      const key = topologyKey(state);
      if (key === lastKey) return;
      lastKey = key;
      singleton?.stop();
      setRunning(false);
      clearMetrics();
      singleton = new Simulator(state.nodes, state.edges, handleSnapshot);
    });
    return () => {
      unsub();
      listenerAttached = false;
    };
  }, [handleSnapshot, setRunning, clearMetrics]);

  const start = useCallback(() => {
    singleton?.start();
    setRunning(true);
  }, [setRunning]);

  const stop = useCallback(() => {
    singleton?.stop();
    setRunning(false);
  }, [setRunning]);

  const reset = useCallback(() => {
    singleton?.reset();
    setRunning(false);
    clearMetrics();
  }, [setRunning, clearMetrics]);

  // Always-fresh accessor — reads the current module-level singleton at call time.
  const getSim = useCallback(() => singleton, []);

  return { isRunning, start, stop, reset, simRef, getSim };
}
