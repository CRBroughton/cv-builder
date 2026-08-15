import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const VIOLATIONS_FILE = "a11y-report/.violations.ndjson";
const REPORT_DIR = "a11y-report";
const REPORT_FILE = join(REPORT_DIR, "accessibility.html");

// ── Data loading ──────────────────────────────────────────────────────────────

const raw = existsSync(VIOLATIONS_FILE)
  ? readFileSync(VIOLATIONS_FILE, "utf-8").trim()
  : "";

const allResults: any[] = raw
  .split("\n")
  .filter(Boolean)
  .map((line: string) => JSON.parse(line));

// Merge: group by rule ID so nodes from multiple stories collapse into one card
function mergeByRule(items: any[]): any[] {
  const map = new Map<string, any>();
  for (const item of items) {
    if (!map.has(item.id)) {
      map.set(item.id, { ...item, nodes: [...item.nodes] });
    } else {
      map.get(item.id)!.nodes.push(...item.nodes);
    }
  }
  return [...map.values()];
}

const violations = mergeByRule(allResults.flatMap((r) => r.violations ?? []));
const passes = mergeByRule(allResults.flatMap((r) => r.passes ?? []));
const incomplete = mergeByRule(allResults.flatMap((r) => r.incomplete ?? []));
const storiesRun = allResults.length;

const impactOrder = ["critical", "serious", "moderate", "minor"];
violations.sort(
  (a, b) =>
    impactOrder.indexOf(a.impact) - impactOrder.indexOf(b.impact),
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const esc = (s: string) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const impactCount = (level: string) =>
  violations.filter((v) => v.impact === level).reduce((n, v) => n + v.nodes.length, 0);

const totalNodes = violations.reduce((n, v) => n + v.nodes.length, 0);
const critical = impactCount("critical");
const serious = impactCount("serious");
const moderate = impactCount("moderate");
const minor = impactCount("minor");

function impactBar(): string {
  if (totalNodes === 0) return "";
  const pct = (n: number) => ((n / totalNodes) * 100).toFixed(1);
  return `
    <div class="impact-bar" aria-label="Impact breakdown">
      ${critical ? `<div class="bar-seg bar-critical" style="width:${pct(critical)}%" title="Critical: ${critical}"></div>` : ""}
      ${serious ? `<div class="bar-seg bar-serious" style="width:${pct(serious)}%" title="Serious: ${serious}"></div>` : ""}
      ${moderate ? `<div class="bar-seg bar-moderate" style="width:${pct(moderate)}%" title="Moderate: ${moderate}"></div>` : ""}
      ${minor ? `<div class="bar-seg bar-minor" style="width:${pct(minor)}%" title="Minor: ${minor}"></div>` : ""}
    </div>
    <div class="bar-legend">
      ${critical ? `<span class="legend-dot dot-critical"></span><span>Critical (${critical})</span>` : ""}
      ${serious ? `<span class="legend-dot dot-serious"></span><span>Serious (${serious})</span>` : ""}
      ${moderate ? `<span class="legend-dot dot-moderate"></span><span>Moderate (${moderate})</span>` : ""}
      ${minor ? `<span class="legend-dot dot-minor"></span><span>Minor (${minor})</span>` : ""}
    </div>`;
}

function violationCard(v: any): string {
  const nodeList = v.nodes
    .map(
      (n: any) => `
      <div class="node-item">
        <div class="node-target">${esc(n.target?.join(", ") ?? "")}</div>
        <pre class="node-html"><code>${esc(n.html ?? "")}</code></pre>
        ${n.failureSummary ? `<p class="node-summary">${esc(n.failureSummary.replace(/^Fix (?:any|all) of the following:\n/, ""))}</p>` : ""}
      </div>`,
    )
    .join("");

  return `
    <details class="violation-card impact-${v.impact}" open>
      <summary class="card-summary">
        <span class="impact-badge badge-${v.impact}">${v.impact}</span>
        <span class="rule-id">${esc(v.id)}</span>
        <span class="rule-desc">${esc(v.description)}</span>
        <span class="node-count">${v.nodes.length} element${v.nodes.length !== 1 ? "s" : ""}</span>
        <a class="rule-link" href="${esc(v.helpUrl)}" target="_blank" rel="noopener">
          WCAG&nbsp;ref ↗
        </a>
      </summary>
      <div class="card-body">
        <p class="rule-help">${esc(v.help)}</p>
        <div class="node-list">${nodeList}</div>
      </div>
    </details>`;
}

function passRow(p: any): string {
  return `
    <tr>
      <td class="pass-id">${esc(p.id)}</td>
      <td class="pass-desc">${esc(p.description)}</td>
      <td class="pass-count">${p.nodes.length}</td>
    </tr>`;
}

// ── HTML ──────────────────────────────────────────────────────────────────────

const now = new Date();
const dateStr = now.toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const timeStr = now.toLocaleTimeString("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

const html = `<!DOCTYPE html>
<html lang="en" data-theme="">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Accessibility Audit — CV Builder</title>
<style>
/* ── Tokens ──────────────────────────────────────────────────────────────── */
:root {
  --bg: #F8F9FC;
  --bg-2: #EEF1F8;
  --surface: #FFFFFF;
  --border: #DDE3F0;
  --border-2: #C8D0E6;
  --text: #0F172A;
  --text-muted: #5A6585;
  --text-xmuted: #8E9BBB;
  --accent: #2563EB;
  --accent-soft: #EFF3FF;

  --critical: #DC2626;
  --critical-soft: #FEF2F2;
  --serious: #C2410C;
  --serious-soft: #FFF7ED;
  --moderate: #B45309;
  --moderate-soft: #FFFBEB;
  --minor: #6D28D9;
  --minor-soft: #F5F3FF;
  --pass: #15803D;
  --pass-soft: #F0FDF4;
  --incomplete: #0369A1;
  --incomplete-soft: #F0F9FF;

  --radius: 6px;
  --mono: "SF Mono", "Cascadia Code", "Fira Mono", Consolas, monospace;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0D1117;
    --bg-2: #161B22;
    --surface: #161B22;
    --border: #21262D;
    --border-2: #30363D;
    --text: #E6EDF3;
    --text-muted: #8B949E;
    --text-xmuted: #6E7681;
    --accent: #58A6FF;
    --accent-soft: #0D2044;

    --critical: #FF7B72;
    --critical-soft: #2D0D0D;
    --serious: #FFA657;
    --serious-soft: #2D1500;
    --moderate: #E3B341;
    --moderate-soft: #2D1F00;
    --minor: #C084FC;
    --minor-soft: #1A0D2E;
    --pass: #3FB950;
    --pass-soft: #0A1F0F;
    --incomplete: #79C0FF;
    --incomplete-soft: #041825;
  }
}

:root[data-theme="dark"] {
  --bg: #0D1117;
  --bg-2: #161B22;
  --surface: #161B22;
  --border: #21262D;
  --border-2: #30363D;
  --text: #E6EDF3;
  --text-muted: #8B949E;
  --text-xmuted: #6E7681;
  --accent: #58A6FF;
  --accent-soft: #0D2044;

  --critical: #FF7B72;
  --critical-soft: #2D0D0D;
  --serious: #FFA657;
  --serious-soft: #2D1500;
  --moderate: #E3B341;
  --moderate-soft: #2D1F00;
  --minor: #C084FC;
  --minor-soft: #1A0D2E;
  --pass: #3FB950;
  --pass-soft: #0A1F0F;
  --incomplete: #79C0FF;
  --incomplete-soft: #041825;
}

/* ── Reset & base ─────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 15px; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  line-height: 1.6;
  min-height: 100vh;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }
code, pre { font-family: var(--mono); }

/* ── Header ───────────────────────────────────────────────────────────────── */
.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 2rem;
}
.header-inner {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 0;
}
.header-logo {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.header-divider { width: 1px; height: 1.5rem; background: var(--border-2); }
.header-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  flex: 1;
}
.header-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: right;
  line-height: 1.4;
}
.wcag-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--accent);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 3px;
}

/* ── Main layout ──────────────────────────────────────────────────────────── */
.main {
  max-width: 1080px;
  margin: 0 auto;
  padding: 2rem;
}

/* ── Summary ──────────────────────────────────────────────────────────────── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat-tile {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.1rem 1.25rem;
}
.stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}
.stat-value {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.stat-tile.violations .stat-value { color: var(--critical); }
.stat-tile.passes .stat-value { color: var(--pass); }
.stat-tile.incomplete .stat-value { color: var(--incomplete); }
.stat-sub {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.3rem;
}

/* ── Impact bar ───────────────────────────────────────────────────────────── */
.impact-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  margin-bottom: 2rem;
}
.impact-card-title {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}
.impact-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  gap: 2px;
  background: var(--bg-2);
  margin-bottom: 0.6rem;
}
.bar-seg { height: 100%; border-radius: 2px; min-width: 4px; transition: opacity 0.15s; }
.bar-seg:hover { opacity: 0.8; }
.bar-critical { background: var(--critical); }
.bar-serious  { background: var(--serious); }
.bar-moderate { background: var(--moderate); }
.bar-minor    { background: var(--minor); }
.bar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.72rem;
  color: var(--text-muted);
  align-items: center;
}
.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot-critical { background: var(--critical); }
.dot-serious  { background: var(--serious); }
.dot-moderate { background: var(--moderate); }
.dot-minor    { background: var(--minor); }
.no-violations {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--pass);
  font-size: 0.95rem;
  font-weight: 500;
}
.no-violations-icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }

/* ── Section headings ─────────────────────────────────────────────────────── */
.section-heading {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.section-count {
  font-variant-numeric: tabular-nums;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 0.1rem 0.45rem;
  font-size: 0.68rem;
}
.section { margin-bottom: 2.5rem; }

/* ── Violation cards ──────────────────────────────────────────────────────── */
.violation-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 0.75rem;
  overflow: hidden;
  border-left-width: 3px;
}
.violation-card.impact-critical { border-left-color: var(--critical); }
.violation-card.impact-serious  { border-left-color: var(--serious); }
.violation-card.impact-moderate { border-left-color: var(--moderate); }
.violation-card.impact-minor    { border-left-color: var(--minor); }
.card-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  cursor: pointer;
  list-style: none;
  flex-wrap: wrap;
}
.card-summary::-webkit-details-marker { display: none; }
.card-summary::before {
  content: "▶";
  font-size: 0.6rem;
  color: var(--text-xmuted);
  transition: transform 0.15s;
  flex-shrink: 0;
}
details[open] > .card-summary::before { transform: rotate(90deg); }
.impact-badge {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  flex-shrink: 0;
}
.badge-critical { background: var(--critical-soft); color: var(--critical); }
.badge-serious  { background: var(--serious-soft);  color: var(--serious); }
.badge-moderate { background: var(--moderate-soft); color: var(--moderate); }
.badge-minor    { background: var(--minor-soft);    color: var(--minor); }
.rule-id {
  font-family: var(--mono);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text);
  flex-shrink: 0;
}
.rule-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  flex: 1;
  min-width: 0;
}
.node-count {
  font-size: 0.72rem;
  color: var(--text-xmuted);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.rule-link {
  font-size: 0.68rem;
  color: var(--accent);
  flex-shrink: 0;
  white-space: nowrap;
}

.card-body {
  padding: 0 1rem 1rem 2.5rem;
  border-top: 1px solid var(--border);
}
.rule-help {
  font-size: 0.8rem;
  color: var(--text-muted);
  padding: 0.75rem 0 0.75rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.75rem;
}
.node-list { display: flex; flex-direction: column; gap: 0.75rem; }
.node-item { border: 1px solid var(--border); border-radius: 4px; overflow: hidden; }
.node-target {
  background: var(--bg-2);
  padding: 0.4rem 0.75rem;
  font-family: var(--mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
}
.node-html {
  padding: 0.65rem 0.75rem;
  font-size: 0.72rem;
  line-height: 1.5;
  overflow-x: auto;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  white-space: pre-wrap;
  word-break: break-all;
}
.node-summary {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.5;
}

/* ── Passes table ─────────────────────────────────────────────────────────── */
details.passes-details {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
details.passes-details > summary {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  cursor: pointer;
  list-style: none;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--pass);
}
details.passes-details > summary::-webkit-details-marker { display: none; }
details.passes-details > summary::before {
  content: "▶";
  font-size: 0.6rem;
  transition: transform 0.15s;
}
details.passes-details[open] > summary::before { transform: rotate(90deg); }
.passes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
}
.passes-table thead th {
  text-align: left;
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--bg-2);
}
.passes-table tbody tr { border-bottom: 1px solid var(--border); }
.passes-table tbody tr:last-child { border-bottom: none; }
.passes-table tbody td { padding: 0.55rem 1rem; vertical-align: top; }
.pass-id {
  font-family: var(--mono);
  font-size: 0.7rem;
  color: var(--pass);
  white-space: nowrap;
}
.pass-desc { color: var(--text-muted); }
.pass-count {
  color: var(--text-xmuted);
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

/* ── Footer ───────────────────────────────────────────────────────────────── */
.footer {
  border-top: 1px solid var(--border);
  padding: 1.25rem 2rem;
  font-size: 0.72rem;
  color: var(--text-xmuted);
  text-align: center;
}

@media (max-width: 600px) {
  .main { padding: 1rem; }
  .header-inner { flex-wrap: wrap; }
  .summary-grid { grid-template-columns: 1fr 1fr; }
  .card-summary { gap: 0.5rem; }
}
</style>
</head>
<body>

<header class="header">
  <div class="header-inner">
    <span class="header-logo">CV Builder</span>
    <div class="header-divider"></div>
    <span class="header-title">Accessibility Audit Report</span>
    <div class="header-meta">
      <div><span class="wcag-badge">WCAG 2.2 AA</span></div>
      <div style="margin-top:0.3rem">${dateStr} at ${timeStr}</div>
    </div>
  </div>
</header>

<main class="main">

  <!-- Summary tiles -->
  <div class="summary-grid">
    <div class="stat-tile">
      <div class="stat-label">Stories Tested</div>
      <div class="stat-value">${storiesRun}</div>
      <div class="stat-sub">component stories</div>
    </div>
    <div class="stat-tile violations">
      <div class="stat-label">Violations</div>
      <div class="stat-value">${violations.length}</div>
      <div class="stat-sub">${totalNodes} element${totalNodes !== 1 ? "s" : ""} affected</div>
    </div>
    <div class="stat-tile passes">
      <div class="stat-label">Passing Rules</div>
      <div class="stat-value">${passes.length}</div>
      <div class="stat-sub">across ${passes.reduce((n, p) => n + p.nodes.length, 0)} elements</div>
    </div>
    <div class="stat-tile incomplete">
      <div class="stat-label">Needs Review</div>
      <div class="stat-value">${incomplete.length}</div>
      <div class="stat-sub">manual check required</div>
    </div>
  </div>

  <!-- Impact breakdown -->
  ${violations.length > 0 ? `
  <div class="impact-card">
    <div class="impact-card-title">Impact breakdown</div>
    ${impactBar()}
  </div>` : ""}

  <!-- Violations -->
  <section class="section">
    <div class="section-heading">
      Violations
      <span class="section-count">${violations.length}</span>
    </div>
    ${violations.length === 0
      ? `<div class="no-violations"><span class="no-violations-icon">✓</span>No accessibility violations detected.</div>`
      : violations.map(violationCard).join("")
    }
  </section>

  <!-- Passes -->
  ${passes.length > 0 ? `
  <section class="section">
    <div class="section-heading">
      Passing Rules
      <span class="section-count">${passes.length}</span>
    </div>
    <details class="passes-details">
      <summary>Show ${passes.length} passing rule${passes.length !== 1 ? "s" : ""}</summary>
      <div style="overflow-x:auto">
        <table class="passes-table">
          <thead>
            <tr>
              <th>Rule ID</th>
              <th>Description</th>
              <th style="text-align:right">Elements</th>
            </tr>
          </thead>
          <tbody>
            ${passes.map(passRow).join("")}
          </tbody>
        </table>
      </div>
    </details>
  </section>` : ""}

</main>

<footer class="footer">
  Generated with axe-core ${allResults[0]?.testEngine?.version ?? ""} · Storybook component tests · ${storiesRun} stories
</footer>

</body>
</html>`;

// ── Write ─────────────────────────────────────────────────────────────────────

mkdirSync(REPORT_DIR, { recursive: true });
writeFileSync(REPORT_FILE, html);

console.log(
  `A11y report: ${REPORT_FILE} — ${violations.length} violation(s), ${passes.length} passing rule(s)`,
);
