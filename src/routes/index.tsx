import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ICS Operations Command — Secure Distributed ICS Platform" },
      { name: "description", content: "Real-time monitoring dashboard for telemetry, security alerts, attack activity, and operational status across the Secure Distributed ICS Platform." },
      { property: "og:title", content: "ICS Operations Command" },
      { property: "og:description", content: "Live telemetry, security alerts, and attack monitoring for industrial control systems." },
    ],
  }),
  component: Dashboard,
});
