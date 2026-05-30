# Secure Distributed ICS Platform — Operations Command

A prototype dashboard for a **Secure Distributed Industrial Control System (ICS) Platform**, built during my internship at **Rolls-Royce**.

The dashboard simulates a real-time operations command center for monitoring distributed industrial controllers, telemetry streams, and active security events across an ICS fleet.

> ⚠️ **Prototype notice** — this is a UI/UX prototype. Telemetry, alerts, and attack data are generated client-side for demonstration purposes and do not connect to live ICS hardware.

---

## ✨ Features

- **Live Telemetry** — streaming pressure, temperature, flow, and voltage charts
- **Security Alerts Feed** — real-time critical / warning / info event stream
- **Attack Monitor** — 24h attempts vs blocked visualization + per-event feed
- **Operational Status** — ICS device fleet view (PLCs, RTUs, gateways) with load, zone, and connection status
- **Zero-Trust Indicators** — mTLS / zero-trust posture surfaced in the header
- **Dark, mission-control aesthetic** — semantic design tokens, monospace data, pulse indicators

---

## 🛠 Tech Stack

- **TanStack Start** (v1) — full-stack React 19 framework with file-based routing and SSR
- **Vite 7** — build tool
- **Tailwind CSS v4** — styling via `src/styles.css` with semantic design tokens (oklch)
- **Recharts** — telemetry and attack-surface charts
- **lucide-react** — iconography
- **Cloudflare Workers** — deployment target (via Wrangler)

---

## 🚀 Getting Started

```bash
# install
bun install

# run dev server
bun run dev

# production build
bun run build
```

Open <http://localhost:8080> (or whichever port Vite reports).

---

## 📁 Project Structure

```
src/
├── routes/                  # File-based routing (TanStack Start)
│   ├── __root.tsx           # App shell
│   └── index.tsx            # Dashboard route
├── components/
│   ├── dashboard/
│   │   └── Dashboard.tsx    # Main Operations Command view
│   └── ui/                  # shadcn/ui primitives
├── lib/
│   └── dashboard-data.ts    # Simulated telemetry / alerts / attacks / devices
└── styles.css               # Design tokens & global styles
```

---

## 🎨 Design System

All colors live as semantic tokens in `src/styles.css` (`--primary`, `--success`, `--warning`, `--critical`, `--info`, chart palette, gradients). Components consume tokens via Tailwind utilities — no hard-coded hex values.

---

## ☁️ Deployment

Configured for **Cloudflare Workers** via `wrangler.toml`. Push to GitHub and connect the repo to Cloudflare Pages / Workers for automatic deploys.

---

## 🏢 Context

Built as a prototype during my internship at **Rolls-Royce**, exploring how a secure, distributed control plane for industrial systems could be surfaced to operators in a single command-center view — balancing live telemetry, fleet health, and active threat posture.

---

## 📄 License

Prototype / internal use. Not for production deployment against live ICS hardware.
