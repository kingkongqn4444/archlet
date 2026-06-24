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

  if (!simRef.current) {
    simRef.current = ensureSingleton(handleSnapshot);
  }

  // Rebuild singleton when diagram nodes/edges change — only one listener globally
  useEffect(() => {
    if (listenerAttached) return;
    listenerAttached = true;
    const unsub = useDiagramStore.subscribe((state, prev) => {
      if (state.nodes !== prev.nodes || state.edges !== prev.edges) {
        singleton?.stop();
        setRunning(false);
        clearMetrics();
        singleton = new Simulator(state.nodes, state.edges, handleSnapshot);
      }
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

  return { isRunning, start, stop, reset, simRef };
}
