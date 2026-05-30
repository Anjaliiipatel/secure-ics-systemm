import { useEffect, useState } from "react";

export type Telemetry = {
  t: string;
  pressure: number;
  temperature: number;
  flow: number;
  voltage: number;
};

export type Alert = {
  id: string;
  ts: string;
  severity: "critical" | "warning" | "info";
  source: string;
  message: string;
};

export type Device = {
  id: string;
  name: string;
  type: "PLC" | "RTU" | "HMI" | "Sensor" | "Gateway";
  status: "online" | "degraded" | "offline";
  zone: string;
  ip: string;
  load: number;
};

export type AttackEvent = {
  id: string;
  ts: string;
  vector: string;
  src: string;
  dst: string;
  severity: "critical" | "warning" | "info";
  blocked: boolean;
};

const SEEDS = ["10.0.4.12", "10.0.4.31", "10.0.7.8", "192.168.2.44", "172.16.0.9"];
const VECTORS = [
  "Modbus Function Code Anomaly",
  "Unauthorized Write Attempt",
  "MITM TLS Downgrade",
  "Replay Attack",
  "DNP3 Malformed Packet",
  "Brute Force SSH",
  "Port Scan",
  "Rogue Device Detected",
];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function nowHHMMSS(d = new Date()) {
  return d.toTimeString().slice(0, 8);
}

export function useTelemetry(points = 40) {
  const [data, setData] = useState<Telemetry[]>([]);

  useEffect(() => {
    const base = new Date();
    setData(
      Array.from({ length: points }, (_, i) => {
        const t = new Date(base.getTime() - (points - i) * 2000);
        return {
          t: nowHHMMSS(t),
          pressure: +rand(48, 62).toFixed(2),
          temperature: +rand(68, 78).toFixed(2),
          flow: +rand(120, 160).toFixed(2),
          voltage: +rand(228, 236).toFixed(2),
        };
      }),
    );
    const id = setInterval(() => {
      setData((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const next: Telemetry = {
          t: nowHHMMSS(),
          pressure: clamp(last.pressure + rand(-1.2, 1.2), 40, 70),
          temperature: clamp(last.temperature + rand(-0.6, 0.6), 60, 85),
          flow: clamp(last.flow + rand(-4, 4), 100, 180),
          voltage: clamp(last.voltage + rand(-0.8, 0.8), 220, 240),
        };
        return [...prev.slice(1), next];
      });
    }, 2000);
    return () => clearInterval(id);
  }, [points]);

  return data;
}


function clamp(v: number, lo: number, hi: number) {
  return +Math.min(hi, Math.max(lo, v)).toFixed(2);
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(() => seedAlerts());
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() < 0.45) {
        setAlerts((a) => [makeAlert(), ...a].slice(0, 40));
      }
    }, 3500);
    return () => clearInterval(id);
  }, []);
  return alerts;
}

function seedAlerts(): Alert[] {
  return Array.from({ length: 8 }, () => makeAlert());
}
function makeAlert(): Alert {
  const sev = pick<Alert["severity"]>(["critical", "warning", "info", "info", "warning"]);
  const messages: Record<Alert["severity"], string[]> = {
    critical: [
      "Unauthorized write to PLC-04 register bank",
      "Tamper detected on RTU-12 enclosure",
      "Authentication bypass attempt on HMI-02",
    ],
    warning: [
      "Latency spike on Modbus segment B",
      "Certificate expiring in 7 days on Gateway-01",
      "Sensor S-118 reading outside calibration band",
    ],
    info: [
      "Firmware integrity check passed on PLC-02",
      "Operator login: a.patel @ HMI-01",
      "Routine key rotation completed on Zone-3",
    ],
  };
  return {
    id: crypto.randomUUID(),
    ts: nowHHMMSS(),
    severity: sev,
    source: pick(["PLC-01", "PLC-04", "RTU-12", "HMI-02", "Gateway-01", "Zone-3"]),
    message: pick(messages[sev]),
  };
}

export function useDevices(): Device[] {
  const [devices, setDevices] = useState<Device[]>(() => [
    { id: "d1", name: "PLC-01", type: "PLC", status: "online", zone: "Zone A", ip: "10.0.4.11", load: 38 },
    { id: "d2", name: "PLC-04", type: "PLC", status: "degraded", zone: "Zone A", ip: "10.0.4.14", load: 81 },
    { id: "d3", name: "RTU-12", type: "RTU", status: "online", zone: "Zone B", ip: "10.0.5.22", load: 47 },
    { id: "d4", name: "HMI-02", type: "HMI", status: "online", zone: "Control Room", ip: "10.0.1.5", load: 22 },
    { id: "d5", name: "Gateway-01", type: "Gateway", status: "online", zone: "DMZ", ip: "10.0.0.2", load: 64 },
    { id: "d6", name: "Sensor S-118", type: "Sensor", status: "offline", zone: "Zone C", ip: "10.0.7.118", load: 0 },
    { id: "d7", name: "Sensor S-091", type: "Sensor", status: "online", zone: "Zone C", ip: "10.0.7.91", load: 12 },
    { id: "d8", name: "RTU-08", type: "RTU", status: "online", zone: "Zone B", ip: "10.0.5.18", load: 55 },
  ]);
  useEffect(() => {
    const id = setInterval(() => {
      setDevices((prev) =>
        prev.map((d) =>
          d.status === "offline"
            ? d
            : { ...d, load: clamp(d.load + rand(-6, 6), 5, 99) },
        ),
      );
    }, 2500);
    return () => clearInterval(id);
  }, []);
  return devices;
}

export function useAttacks() {
  const [events, setEvents] = useState<AttackEvent[]>(() =>
    Array.from({ length: 6 }, () => makeAttack()),
  );
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() < 0.55) setEvents((e) => [makeAttack(), ...e].slice(0, 30));
    }, 4000);
    return () => clearInterval(id);
  }, []);
  return events;
}
function makeAttack(): AttackEvent {
  const sev = pick<AttackEvent["severity"]>(["critical", "warning", "info", "warning"]);
  return {
    id: crypto.randomUUID(),
    ts: nowHHMMSS(),
    vector: pick(VECTORS),
    src: pick(SEEDS),
    dst: pick(["PLC-01", "PLC-04", "RTU-12", "HMI-02", "Gateway-01"]),
    severity: sev,
    blocked: Math.random() < 0.78,
  };
}
