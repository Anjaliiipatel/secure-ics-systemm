import { Activity, ShieldCheck, AlertTriangle, Cpu, Gauge, Radio, Wifi, Lock } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAlerts, useAttacks, useDevices, useTelemetry, type Alert, type AttackEvent, type Device } from "@/lib/dashboard-data";
import { useEffect, useState } from "react";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  tone = "primary",
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  tone?: "primary" | "success" | "warning" | "critical" | "info";
}) {
  const toneClass: Record<string, string> = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    critical: "text-critical",
    info: "text-info",
  };
  return (
    <div className="panel relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`font-mono text-3xl font-semibold ${toneClass[tone]}`}>{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {trend && <div className="mt-1 text-xs text-muted-foreground font-mono">{trend}</div>}
        </div>
        <div className={`rounded-md border border-border/60 bg-muted/40 p-2 ${toneClass[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 60%, transparent), transparent)",
        }}
      />
    </div>
  );
}

function TelemetryPanel() {
  const data = useTelemetry();
  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wide">Live Telemetry</h2>
          <p className="text-xs text-muted-foreground">Pressure · Temperature · Flow · Voltage</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-mono text-success">
          <span className="pulse-dot" /> STREAMING
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gPressure" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" stroke="var(--muted-foreground)" tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} minTickGap={28} />
            <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} width={36} />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
            />
            <Area type="monotone" dataKey="pressure" stroke="var(--chart-1)" strokeWidth={2} fill="url(#gPressure)" />
            <Area type="monotone" dataKey="temperature" stroke="var(--chart-3)" strokeWidth={2} fill="url(#gTemp)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Pressure", key: "pressure", unit: "kPa", color: "var(--chart-1)" },
          { label: "Temp", key: "temperature", unit: "°C", color: "var(--chart-3)" },
          { label: "Flow", key: "flow", unit: "L/m", color: "var(--chart-2)" },
          { label: "Voltage", key: "voltage", unit: "V", color: "var(--chart-5)" },
        ].map((m) => {
          const last = data[data.length - 1] as any;
          return (
            <div key={m.key} className="rounded-md border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
                {m.label}
              </div>
              <div className="mt-1 font-mono text-lg">
                {last[m.key]}
                <span className="ml-1 text-xs text-muted-foreground">{m.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AttackChart() {
  const data = useTelemetry(28).map((d, i) => ({
    t: d.t,
    attempts: Math.max(0, Math.round(8 + Math.sin(i / 2) * 5 + Math.random() * 6)),
    blocked: Math.max(0, Math.round(6 + Math.sin(i / 2.2) * 4 + Math.random() * 5)),
  }));
  return (
    <div className="panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wide">Attack Surface (24h)</h2>
          <p className="text-xs text-muted-foreground">Attempts vs blocked</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[var(--critical)]" /> attempts</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[var(--success)]" /> blocked</span>
        </div>
      </div>
      <div className="h-44">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" stroke="var(--muted-foreground)" tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} minTickGap={28} />
            <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} width={28} />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
            />
            <Line dataKey="attempts" stroke="var(--critical)" strokeWidth={2} dot={false} />
            <Line dataKey="blocked" stroke="var(--success)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function severityStyles(sev: Alert["severity"]) {
  switch (sev) {
    case "critical":
      return { text: "text-critical", bg: "bg-critical/10", border: "border-critical/30", dot: "crit" };
    case "warning":
      return { text: "text-warning", bg: "bg-warning/10", border: "border-warning/30", dot: "warn" };
    default:
      return { text: "text-info", bg: "bg-info/10", border: "border-info/30", dot: "" };
  }
}

function AlertsPanel() {
  const alerts = useAlerts();
  return (
    <div className="panel flex h-full flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wide">Security Alerts</h2>
          <p className="text-xs text-muted-foreground">Real-time event feed</p>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{alerts.length} active</span>
      </div>
      <div className="-mr-2 max-h-[420px] flex-1 space-y-2 overflow-y-auto pr-2">
        {alerts.map((a) => {
          const s = severityStyles(a.severity);
          return (
            <div key={a.id} className={`flex items-start gap-3 rounded-md border ${s.border} ${s.bg} p-3`}>
              <span className={`pulse-dot ${s.dot} mt-1.5`} style={{ color: "currentColor" }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <span>{a.ts}</span>
                  <span>·</span>
                  <span className={`uppercase ${s.text}`}>{a.severity}</span>
                  <span>·</span>
                  <span>{a.source}</span>
                </div>
                <p className="mt-0.5 truncate text-sm">{a.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DeviceRow({ d }: { d: Device }) {
  const map: Record<Device["status"], { dot: string; label: string; color: string }> = {
    online: { dot: "", label: "ONLINE", color: "text-success" },
    degraded: { dot: "warn", label: "DEGRADED", color: "text-warning" },
    offline: { dot: "crit", label: "OFFLINE", color: "text-critical" },
  };
  const s = map[d.status];
  return (
    <div className="grid grid-cols-12 items-center gap-2 border-b border-border/60 px-3 py-2.5 text-sm last:border-0 hover:bg-muted/30">
      <div className="col-span-3 flex items-center gap-2 font-mono">
        <span className={`pulse-dot ${s.dot}`} /> {d.name}
      </div>
      <div className="col-span-2 text-xs text-muted-foreground">{d.type}</div>
      <div className="col-span-2 text-xs text-muted-foreground">{d.zone}</div>
      <div className="col-span-2 font-mono text-xs text-muted-foreground">{d.ip}</div>
      <div className="col-span-2">
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{
              width: `${d.load}%`,
              background:
                d.load > 75 ? "var(--critical)" : d.load > 55 ? "var(--warning)" : "var(--success)",
            }}
          />
        </div>
        <div className="mt-1 text-[10px] font-mono text-muted-foreground">{d.load}% load</div>
      </div>
      <div className={`col-span-1 text-right text-[11px] font-mono ${s.color}`}>{s.label}</div>
    </div>
  );
}

function DevicesPanel() {
  const devices = useDevices();
  return (
    <div className="panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wide">Operational Status</h2>
          <p className="text-xs text-muted-foreground">ICS device fleet</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="pulse-dot" /> {devices.filter(d => d.status === "online").length} up</span>
          <span className="inline-flex items-center gap-1.5"><span className="pulse-dot warn" /> {devices.filter(d => d.status === "degraded").length} deg</span>
          <span className="inline-flex items-center gap-1.5"><span className="pulse-dot crit" /> {devices.filter(d => d.status === "offline").length} down</span>
        </div>
      </div>
      <div className="rounded-md border border-border/60 bg-background/40">
        <div className="grid grid-cols-12 gap-2 border-b border-border/60 px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <div className="col-span-3">Device</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Zone</div>
          <div className="col-span-2">IP</div>
          <div className="col-span-2">Load</div>
          <div className="col-span-1 text-right">Status</div>
        </div>
        {devices.map((d) => <DeviceRow key={d.id} d={d} />)}
      </div>
    </div>
  );
}

function AttackFeed() {
  const events = useAttacks();
  return (
    <div className="panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide">Attack Monitor</h2>
        <span className="font-mono text-[11px] text-muted-foreground">last {events.length}</span>
      </div>
      <div className="space-y-1.5">
        {events.slice(0, 8).map((e) => {
          const s = severityStyles(e.severity as AttackEvent["severity"]);
          return (
            <div key={e.id} className="flex items-center gap-3 rounded-md border border-border/50 bg-muted/20 px-3 py-2">
              <span className="font-mono text-[11px] text-muted-foreground">{e.ts}</span>
              <span className={`font-mono text-[10px] uppercase ${s.text}`}>{e.severity}</span>
              <div className="min-w-0 flex-1 truncate text-sm">{e.vector}</div>
              <span className="hidden font-mono text-[11px] text-muted-foreground md:inline">{e.src} → {e.dst}</span>
              <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${e.blocked ? "bg-success/10 text-success border border-success/30" : "bg-critical/10 text-critical border border-critical/30"}`}>
                {e.blocked ? "BLOCKED" : "ALLOWED"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Dashboard() {
  const now = useClock();
  const devices = useDevices();
  const alerts = useAlerts();
  const attacks = useAttacks();

  const onlinePct = Math.round((devices.filter((d) => d.status === "online").length / devices.length) * 100);
  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
  const blockedRate = Math.round((attacks.filter((a) => a.blocked).length / Math.max(attacks.length, 1)) * 100);

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{ background: "var(--gradient-glow)" }}
      />

      <div className="relative mx-auto max-w-[1500px] px-6 py-6">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Secure Distributed ICS Platform</div>
              <h1 className="text-lg font-semibold">Operations Command</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-md border border-border/60 bg-card/60 px-3 py-1.5 text-[11px] font-mono text-muted-foreground md:flex">
              <Lock className="h-3.5 w-3.5 text-success" /> mTLS · zero-trust
            </div>
            <div className="rounded-md border border-border/60 bg-card/60 px-3 py-1.5 font-mono text-xs">
              <span className="text-muted-foreground">UTC </span>
              <span>{now ? now.toISOString().slice(11, 19) : "--:--:--"}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-mono text-success">
              <span className="pulse-dot" /> SYSTEM NOMINAL
            </div>
          </div>
        </header>

        {/* Stat row */}
        <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={Cpu} label="Devices Online" value={`${onlinePct}%`} trend={`${devices.filter(d=>d.status==='online').length}/${devices.length} up`} tone="success" />
          <StatCard icon={AlertTriangle} label="Critical Alerts" value={criticalAlerts} unit="open" trend="last 5m" tone={criticalAlerts > 0 ? "critical" : "success"} />
          <StatCard icon={ShieldCheck} label="Threats Blocked" value={`${blockedRate}%`} trend={`${attacks.filter(a=>a.blocked).length}/${attacks.length} events`} tone="primary" />
          <StatCard icon={Gauge} label="Throughput" value="1.42" unit="Gb/s" trend="+3.1% vs avg" tone="info" />
        </section>

        {/* Main grid */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <TelemetryPanel />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <AttackChart />
              <AttackFeed />
            </div>
            <DevicesPanel />
          </div>
          <div className="lg:col-span-1">
            <AlertsPanel />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 flex items-center justify-between border-t border-border/60 pt-4 text-[11px] font-mono text-muted-foreground">
          <div className="flex items-center gap-3">
            <Wifi className="h-3.5 w-3.5 text-success" /> ingest stream: ws://ics-gateway/telemetry
          </div>
          <div className="flex items-center gap-3">
            <Radio className="h-3.5 w-3.5 text-primary" /> Modbus · DNP3 · OPC-UA
            <span>·</span>
            <Activity className="h-3.5 w-3.5 text-success" /> uptime 99.982%
          </div>
        </footer>
      </div>
    </div>
  );
}
