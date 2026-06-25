import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Calculator, HardDrive, Wifi, Cpu, DollarSign, Activity } from "lucide-react";
import {
  calcQps, calcStorage, calcBandwidth, calcMemory, calcCost,
  formatBytes, formatQps, formatUsd,
} from "./estimate-formulas";

type Tab = "qps" | "storage" | "bandwidth" | "memory" | "cost";

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: "qps", label: "QPS", icon: <Activity size={14} /> },
  { id: "storage", label: "Storage", icon: <HardDrive size={14} /> },
  { id: "bandwidth", label: "Bandwidth", icon: <Wifi size={14} /> },
  { id: "memory", label: "Memory", icon: <Cpu size={14} /> },
  { id: "cost", label: "Cost", icon: <DollarSign size={14} /> },
];

function Field({ label, value, onChange, hint, suffix }: {
  label: string; value: number; onChange: (n: number) => void;
  hint?: string; suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500 dark:text-cream-200/55">
        {label}{suffix && <span className="ml-1 text-ink-400 dark:text-cream-200/35 normal-case font-normal">({suffix})</span>}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="h-9 px-3 rounded-lg border border-cream-200 dark:border-plum-700/40 bg-white dark:bg-plum-900/60 text-[13px] text-ink-900 dark:text-cream-50 outline-none focus:ring-2 focus:ring-plum-400"
      />
      {hint && <span className="text-[10px] text-ink-400 dark:text-cream-200/40">{hint}</span>}
    </label>
  );
}

function Result({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${accent ? "bg-plum-100 dark:bg-plum-800/40" : "bg-cream-50 dark:bg-plum-950/40"}`}>
      <span className="text-[12px] font-medium text-ink-700 dark:text-cream-100">{label}</span>
      <span className={`text-[14px] font-bold font-mono ${accent ? "text-plum-700 dark:text-plum-200" : "text-ink-900 dark:text-cream-50"}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Tab views ─────────────────────────────────────────────────────────────

function QpsTab({ onCompute }: { onCompute?: (peakQps: number) => void }) {
  const [dau, setDau] = useState(10_000_000);
  const [actions, setActions] = useState(20);
  const [peak, setPeak] = useState(3);
  const [readRatio, setReadRatio] = useState(0.9);
  const result = useMemo(() => calcQps({ dau, actionsPerUserPerDay: actions, peakMultiplier: peak, readWriteRatio: readRatio }), [dau, actions, peak, readRatio]);
  useEffect(() => { onCompute?.(result.peakQps); }, [result.peakQps, onCompute]);
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="DAU" value={dau} onChange={setDau} hint="Daily active users" />
      <Field label="Actions per user/day" value={actions} onChange={setActions} hint="Avg requests per user per day" />
      <Field label="Peak multiplier" value={peak} onChange={setPeak} hint="e.g. 3x of average" />
      <Field label="Read ratio" value={readRatio} onChange={setReadRatio} hint="0.9 = 90% reads" />
      <div className="col-span-2 flex flex-col gap-2 mt-2">
        <Result label="Average QPS" value={formatQps(result.avgQps)} />
        <Result label="Peak QPS" value={formatQps(result.peakQps)} accent />
        <Result label="Peak read QPS" value={formatQps(result.peakReadQps)} />
        <Result label="Peak write QPS" value={formatQps(result.peakWriteQps)} />
      </div>
    </div>
  );
}

function StorageTab({ onCompute }: { onCompute?: (totalGb: number) => void }) {
  const [dau, setDau] = useState(10_000_000);
  const [writes, setWrites] = useState(2);
  const [bytes, setBytes] = useState(500);
  const [retention, setRetention] = useState(5);
  const [replication, setReplication] = useState(3);
  const [compression, setCompression] = useState(2);
  const [indexPct, setIndexPct] = useState(30);
  const result = useMemo(() => calcStorage({
    dau, writesPerUserPerDay: writes, bytesPerWrite: bytes,
    retentionYears: retention, replicationFactor: replication,
    compressionRatio: compression, indexOverheadPct: indexPct,
  }), [dau, writes, bytes, retention, replication, compression, indexPct]);
  useEffect(() => { onCompute?.(result.totalWithIndexBytes / 1e9); }, [result.totalWithIndexBytes, onCompute]);
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="DAU" value={dau} onChange={setDau} />
      <Field label="Writes per user/day" value={writes} onChange={setWrites} />
      <Field label="Bytes per write" value={bytes} onChange={setBytes} suffix="B" hint="Avg payload size" />
      <Field label="Retention" value={retention} onChange={setRetention} suffix="years" />
      <Field label="Replication factor" value={replication} onChange={setReplication} hint="3 = typical Cassandra" />
      <Field label="Compression ratio" value={compression} onChange={setCompression} hint="2 = snappy on text" />
      <Field label="Index overhead %" value={indexPct} onChange={setIndexPct} hint="Extra for B-tree / LSM indexes" />
      <div className="col-span-2 flex flex-col gap-2 mt-2">
        <Result label="Daily writes" value={formatBytes(result.dailyBytes)} />
        <Result label="Annual" value={formatBytes(result.annualBytes)} />
        <Result label="Raw (with retention + compression)" value={formatBytes(result.totalRawBytes)} />
        <Result label="With replication" value={formatBytes(result.totalReplicatedBytes)} />
        <Result label="With indexes (recommended)" value={formatBytes(result.totalWithIndexBytes)} accent />
      </div>
    </div>
  );
}

function BandwidthTab({ peakQps, onCompute }: { peakQps?: number; onCompute?: (egressGb: number) => void }) {
  const [qps, setQps] = useState(peakQps ?? 100_000);
  const [reqBytes, setReqBytes] = useState(500);
  const [resBytes, setResBytes] = useState(2000);
  useEffect(() => { if (peakQps !== undefined) setQps(peakQps); }, [peakQps]);
  const result = useMemo(() => calcBandwidth({ peakQps: qps, avgRequestBytes: reqBytes, avgResponseBytes: resBytes }), [qps, reqBytes, resBytes]);
  useEffect(() => { onCompute?.(result.monthlyEgressGb); }, [result.monthlyEgressGb, onCompute]);
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Peak QPS" value={qps} onChange={setQps} hint="From QPS tab" />
      <div />
      <Field label="Request size" value={reqBytes} onChange={setReqBytes} suffix="B" hint="Incoming payload" />
      <Field label="Response size" value={resBytes} onChange={setResBytes} suffix="B" hint="Outgoing payload" />
      <div className="col-span-2 flex flex-col gap-2 mt-2">
        <Result label="Inbound bandwidth" value={`${result.inboundMbps.toFixed(1)} Mbps`} />
        <Result label="Outbound bandwidth" value={`${result.outboundMbps.toFixed(1)} Mbps`} />
        <Result label="Total" value={`${result.totalMbps.toFixed(1)} Mbps`} accent />
        <Result label="Monthly egress" value={`${formatBytes(result.monthlyEgressGb * 1e9)}`} />
      </div>
    </div>
  );
}

function MemoryTab() {
  const [keys, setKeys] = useState(10_000_000);
  const [valueBytes, setValueBytes] = useState(1024);
  const [overhead, setOverhead] = useState(50);
  const [replicas, setReplicas] = useState(2);
  const [headroom, setHeadroom] = useState(30);
  const result = useMemo(() => calcMemory({
    hotKeys: keys, avgValueBytes: valueBytes, overheadPerKeyBytes: overhead,
    replicas, headroomPct: headroom,
  }), [keys, valueBytes, overhead, replicas, headroom]);
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Hot keys count" value={keys} onChange={setKeys} hint="Working set size" />
      <Field label="Avg value size" value={valueBytes} onChange={setValueBytes} suffix="B" />
      <Field label="Overhead per key" value={overhead} onChange={setOverhead} suffix="B" hint="~50-100 for Redis" />
      <Field label="Replicas" value={replicas} onChange={setReplicas} hint="Cluster copies" />
      <Field label="Headroom %" value={headroom} onChange={setHeadroom} hint="For fragmentation + growth" />
      <div className="col-span-2 flex flex-col gap-2 mt-2">
        <Result label="Raw data" value={formatBytes(result.rawBytes)} />
        <Result label="With per-key overhead" value={formatBytes(result.withOverheadBytes)} />
        <Result label="With replicas" value={formatBytes(result.withReplicasBytes)} />
        <Result label="Recommended (with headroom)" value={formatBytes(result.recommendedBytes)} accent />
      </div>
    </div>
  );
}

function CostTab({ storageGb, egressGb, peakQps }: { storageGb?: number; egressGb?: number; peakQps?: number }) {
  const [sGb, setSGb] = useState(storageGb ?? 1000);
  const [eGb, setEGb] = useState(egressGb ?? 5000);
  const [qps, setQps] = useState(peakQps ?? 100_000);
  const [instances, setInstances] = useState(3);
  const [cache, setCache] = useState(2);
  const [lambdaMs, setLambdaMs] = useState(0);
  const [lambdaGb, setLambdaGb] = useState(0);
  useEffect(() => { if (storageGb !== undefined) setSGb(storageGb); }, [storageGb]);
  useEffect(() => { if (egressGb !== undefined) setEGb(egressGb); }, [egressGb]);
  useEffect(() => { if (peakQps !== undefined) setQps(peakQps); }, [peakQps]);
  const result = useMemo(() => calcCost({
    storageGb: sGb, monthlyEgressGb: eGb, peakQps: qps,
    computeInstances: instances, cacheClusters: cache,
    ...(lambdaMs > 0 ? { avgLambdaDurationMs: lambdaMs, lambdaMemoryGb: lambdaGb } : {}),
  }), [sGb, eGb, qps, instances, cache, lambdaMs, lambdaGb]);
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Storage" value={sGb} onChange={setSGb} suffix="GB" hint="S3 standard" />
      <Field label="Monthly egress" value={eGb} onChange={setEGb} suffix="GB" hint="$0.09/GB" />
      <Field label="Peak QPS" value={qps} onChange={setQps} />
      <Field label="DB instances" value={instances} onChange={setInstances} hint="t3.medium baseline" />
      <Field label="Cache clusters" value={cache} onChange={setCache} hint="r6g.large baseline" />
      <div />
      <Field label="Lambda avg duration" value={lambdaMs} onChange={setLambdaMs} suffix="ms" hint="0 = no lambda" />
      <Field label="Lambda memory" value={lambdaGb} onChange={setLambdaGb} suffix="GB" />
      <div className="col-span-2 flex flex-col gap-2 mt-2">
        <Result label="S3 storage" value={formatUsd(result.storageMonthly)} />
        <Result label="Egress" value={formatUsd(result.egressMonthly)} />
        <Result label="DB instances" value={formatUsd(result.computeMonthly)} />
        <Result label="Cache" value={formatUsd(result.cacheMonthly)} />
        {result.lambdaMonthly > 0 && <Result label="Lambda" value={formatUsd(result.lambdaMonthly)} />}
        <Result label="Monthly total" value={formatUsd(result.totalMonthly)} accent />
        <Result label="Annual total" value={formatUsd(result.totalAnnual)} />
        <div className="text-[10px] text-ink-400 dark:text-cream-200/40 mt-1 px-1">
          ⚠ AWS US-East list prices ±20%. Reserved instances + savings plans not included.
        </div>
      </div>
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────

export function EstimateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("qps");
  // Cross-tab derived state
  const [peakQps, setPeakQps] = useState<number | undefined>();
  const [storageGb, setStorageGb] = useState<number | undefined>();
  const [egressGb, setEgressGb] = useState<number | undefined>();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-plum-900 rounded-2xl shadow-float overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-cream-200 dark:border-plum-700/40 bg-cream-50 dark:bg-plum-950/40 shrink-0">
          <Calculator size={16} className="text-plum-600 dark:text-plum-300" />
          <h2 className="text-[14px] font-bold text-ink-900 dark:text-cream-50 flex-1">
            Back-of-Envelope Estimator
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-ink-500 dark:text-cream-200/60 hover:bg-cream-100 dark:hover:bg-plum-800">
            <X size={16} />
          </button>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-cream-200 dark:border-plum-700/40 px-3 shrink-0 bg-white dark:bg-plum-900">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? "border-plum-500 text-plum-700 dark:text-plum-200"
                  : "border-transparent text-ink-500 dark:text-cream-200/55 hover:text-ink-700 dark:hover:text-cream-100"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "qps" && <QpsTab onCompute={setPeakQps} />}
          {tab === "storage" && <StorageTab onCompute={setStorageGb} />}
          {tab === "bandwidth" && (
            <BandwidthTab
              onCompute={setEgressGb}
              {...(peakQps !== undefined ? { peakQps } : {})}
            />
          )}
          {tab === "memory" && <MemoryTab />}
          {tab === "cost" && (
            <CostTab
              {...(storageGb !== undefined ? { storageGb } : {})}
              {...(egressGb !== undefined ? { egressGb } : {})}
              {...(peakQps !== undefined ? { peakQps } : {})}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
