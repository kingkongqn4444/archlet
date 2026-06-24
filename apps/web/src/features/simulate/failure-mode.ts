import { useCallback, useEffect } from "react";
import { useSimStore } from "./sim-store";
import { useSimulate } from "./use-simulate";

/**
 * Provides failure-mode helpers: toggle dead state per node, sync with Simulator.
 */
export function useFailureMode() {
  const failureModeActive = useSimStore((s) => s.failureModeActive);
  const deadNodes = useSimStore((s) => s.deadNodes);
  const setDeadNode = useSimStore((s) => s.setDeadNode);
  const clearDeadNodes = useSimStore((s) => s.clearDeadNodes);
  const setFailureModeActive = useSimStore((s) => s.setFailureModeActive);
  const { getSim } = useSimulate();

  // Keep simulator in sync with dead-node set
  useEffect(() => {
    const sim = getSim();
    if (sim) sim.setDeadNodes(deadNodes);
  }, [deadNodes, getSim]);

  const toggleDeadNode = useCallback(
    (id: string) => {
      const isDead = deadNodes.has(id);
      setDeadNode(id, !isDead);
    },
    [deadNodes, setDeadNode]
  );

  const enterFailureMode = useCallback(() => {
    setFailureModeActive(true);
  }, [setFailureModeActive]);

  const exitFailureMode = useCallback(() => {
    setFailureModeActive(false);
    clearDeadNodes();
  }, [setFailureModeActive, clearDeadNodes]);

  const toggleFailureMode = useCallback(() => {
    if (failureModeActive) exitFailureMode();
    else enterFailureMode();
  }, [failureModeActive, enterFailureMode, exitFailureMode]);

  return {
    failureModeActive,
    deadNodes,
    toggleDeadNode,
    toggleFailureMode,
    exitFailureMode,
    clearDeadNodes,
  };
}
