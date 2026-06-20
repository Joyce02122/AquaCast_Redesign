## AquaCast

AquaCast is an AI-assisted mission planning and data review platform for autonomous water quality monitoring. Water sampling workflows are often fragmented across planning, deployment, and analysis tools. AquaCast brings these activities into a single experience, helping researchers plan missions, review collected data, and make informed decisions for future deployments.

### Demo Walkthrough

#### Create Mission:
Plan and configure water sampling missions, including locations, sampling points, bottle configurations, sensors, depths, routes, and device pairing.

#### Review:
Explore collected mission data through maps, visualizations, tables, and AI-assisted insights.

### Current Status

🚧 Work in Progress

### Releases

| Tag  | Description                                                   |
| ---- | ------------------------------------------------------------- |
| `V1` | First end-to-end AquaCast prototype (Create Mission + Review) |

Return to this release:

```bash
git checkout V1
```

### Running Locally

```bash
git clone https://github.com/Joyce02122/AquaCast_Redesign.git
cd AquaCast_Redesign

pnpm install
pnpm dev
```

Open:

```text
http://localhost:5173
```

### Tech Stack

* React
* TypeScript
* Vite

### Project Structure

```text
src/
├── App.tsx
├── components/
│   ├── device/
│   ├── layout/
│   ├── map/
│   ├── overlays/
│   ├── panels/
│   ├── review/
│   └── ui/
├── hooks/
├── utils/
├── constants.ts
└── types.ts
```
