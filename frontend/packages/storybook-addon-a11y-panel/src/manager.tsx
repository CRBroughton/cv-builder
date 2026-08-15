/* @jsx createElement */
/* @jsxFrag Fragment */
import { useState, useRef, createElement, Fragment } from "react";
import {
  addons,
  types,
  useAddonState,
  useChannel,
  useStorybookApi,
  useStorybookState,
} from "storybook/manager-api";
import { AddonPanel } from "storybook/internal/components";
import { ADDON_ID, PANEL_ID, EVENTS } from "./constants.js";
import type { StoryResult } from "./types.js";
import type { Result } from "axe-core";

// ─── helpers ────────────────────────────────────────────────────────────────

type ComponentGroup = {
  title: string;
  stories: StoryResult[];
};

function groupByComponent(results: Record<string, StoryResult>): ComponentGroup[] {
  const map = new Map<string, StoryResult[]>();
  for (const result of Object.values(results)) {
    const existing = map.get(result.componentTitle) ?? [];
    existing.push(result);
    map.set(result.componentTitle, existing);
  }
  return [...map.entries()].map(([title, stories]) => ({ title, stories }));
}

function allViolations(stories: StoryResult[], theme: "light" | "dark"): Result[] {
  const seen = new Set<string>();
  const out: Result[] = [];
  for (const s of stories) {
    for (const v of s[theme].violations) {
      if (!seen.has(v.id)) {
        seen.add(v.id);
        out.push(v);
      }
    }
  }
  return out;
}

function isPassing(group: ComponentGroup): boolean {
  return group.stories.every(
    (s) => s.light.violations.length === 0 && s.dark.violations.length === 0,
  );
}

async function fetchAllStoryIds(): Promise<string[]> {
  try {
    const res = await fetch("/index.json");
    const data = (await res.json()) as {
      entries: Record<string, { type: string }>;
    };
    return Object.entries(data.entries)
      .filter(([, e]) => e.type === "story")
      .map(([id]) => id);
  } catch {
    return [];
  }
}

// ─── impact colours ─────────────────────────────────────────────────────────

const IMPACT_COLOR: Record<string, string> = {
  critical: "#c0392b",
  serious: "#e67e22",
  moderate: "#f39c12",
  minor: "#7f8c8d",
};

// ─── styles ─────────────────────────────────────────────────────────────────

const S = {
  panel: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: 12,
    lineHeight: 1.5,
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderBottom: "1px solid var(--sb-addons-panel-border-color, rgba(0,0,0,0.1))",
    flexShrink: 0,
  },
  summary: {
    flex: 1,
    fontWeight: 600,
    fontSize: 12,
  },
  btn: (primary?: boolean) => ({
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 600,
    border: "1px solid",
    borderRadius: 3,
    cursor: "pointer",
    background: primary ? "#0066cc" : "transparent",
    color: primary ? "#fff" : "inherit",
    borderColor: primary ? "#0066cc" : "currentColor",
    opacity: 1,
  }),
  progress: {
    padding: "4px 12px",
    fontSize: 11,
    color: "#888",
    borderBottom: "1px solid var(--sb-addons-panel-border-color, rgba(0,0,0,0.1))",
    flexShrink: 0,
  },
  list: {
    flex: 1,
    overflow: "auto",
  },
  componentRow: (expanded: boolean) => ({
    borderBottom: "1px solid var(--sb-addons-panel-border-color, rgba(0,0,0,0.07))",
    background: expanded
      ? "var(--sb-selected-background, rgba(0,0,0,0.04))"
      : "transparent",
  }),
  componentHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 80px 80px",
    alignItems: "center",
    padding: "6px 12px",
    cursor: "pointer",
    userSelect: "none" as const,
    gap: 8,
  },
  componentTitle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 600,
    fontSize: 12,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  themeCell: (pass: boolean | null) => ({
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    color:
      pass === null ? "#888" : pass ? "#27ae60" : "#c0392b",
    fontWeight: pass === null ? 400 : 600,
  }),
  violationsArea: {
    padding: "0 12px 10px 28px",
  },
  themeSection: {
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: "#888",
    marginBottom: 4,
  },
  violation: {
    marginBottom: 6,
    padding: "5px 8px",
    borderRadius: 3,
    background: "var(--sb-selected-background, rgba(0,0,0,0.04))",
    borderLeft: "3px solid",
  },
  violationId: {
    fontWeight: 700,
    fontSize: 11,
  },
  violationDesc: {
    fontSize: 11,
    opacity: 0.8,
    marginTop: 2,
  },
  impactBadge: (impact: string) => ({
    display: "inline-block",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    padding: "1px 5px",
    borderRadius: 2,
    background: IMPACT_COLOR[impact] ?? "#888",
    color: "#fff",
    marginLeft: 6,
    verticalAlign: "middle",
  }),
  empty: {
    padding: 24,
    textAlign: "center" as const,
    color: "#888",
    fontSize: 12,
  },
  columnHeaders: {
    display: "grid",
    gridTemplateColumns: "1fr 80px 80px",
    gap: 8,
    padding: "4px 12px",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    color: "#888",
    borderBottom: "1px solid var(--sb-addons-panel-border-color, rgba(0,0,0,0.1))",
    flexShrink: 0,
  },
} as const;

// ─── sub-components ──────────────────────────────────────────────────────────

function ThemeCell({ violations, scanned }: { violations: Result[]; scanned: boolean }) {
  if (!scanned) return <span style={S.themeCell(null)}>—</span>;
  if (violations.length === 0)
    return <span style={S.themeCell(true)}>✓ Pass</span>;
  return (
    <span style={S.themeCell(false)}>
      ✗ {violations.length} issue{violations.length !== 1 ? "s" : ""}
    </span>
  );
}

function ViolationList({ violations, label }: { violations: Result[]; label: string }) {
  if (violations.length === 0) return null;
  return (
    <div style={S.themeSection}>
      <div style={S.themeLabel}>{label}</div>
      {violations.map((v) => (
        <div
          key={v.id}
          style={{
            ...S.violation,
            borderLeftColor: IMPACT_COLOR[v.impact ?? ""] ?? "#888",
          }}
        >
          <div style={S.violationId}>
            {v.id}
            <span style={S.impactBadge(v.impact ?? "")}>{v.impact}</span>
          </div>
          <div style={S.violationDesc}>{v.description}</div>
        </div>
      ))}
    </div>
  );
}

function ComponentRow({
  group,
  expanded,
  onToggle,
}: {
  group: ComponentGroup;
  expanded: boolean;
  onToggle: () => void;
}) {
  const lightViolations = allViolations(group.stories, "light");
  const darkViolations = allViolations(group.stories, "dark");

  return (
    <div style={S.componentRow(expanded)}>
      <div
        style={S.componentHeader}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <span style={S.componentTitle}>
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          {group.title}
        </span>
        <ThemeCell violations={lightViolations} scanned={true} />
        <ThemeCell violations={darkViolations} scanned={true} />
      </div>

      {expanded && (lightViolations.length > 0 || darkViolations.length > 0) && (
        <div style={S.violationsArea}>
          <ViolationList violations={lightViolations} label="Light mode" />
          <ViolationList violations={darkViolations} label="Dark mode" />
        </div>
      )}

      {expanded && lightViolations.length === 0 && darkViolations.length === 0 && (
        <div style={{ ...S.violationsArea, color: "#27ae60", fontSize: 11, paddingBottom: 8 }}>
          No violations in either theme.
        </div>
      )}
    </div>
  );
}

// ─── main panel ─────────────────────────────────────────────────────────────

function Panel() {
  const [results, setResults] = useAddonState<Record<string, StoryResult>>(ADDON_ID, {});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [isScanningCurrent, setIsScanningCurrent] = useState(false);
  const [scanProgress, setScanProgress] = useState({ done: 0, total: 0 });

  const scanQueue = useRef<string[]>([]);
  const waitingFor = useRef<string | null>(null);
  const isScanningCurrentRef = useRef(false);

  const api = useStorybookApi();
  const { storyId: currentStoryId } = useStorybookState();

  const emit = useChannel({
    [EVENTS.RESULT]: (data: StoryResult) => {
      setResults((prev: Record<string, StoryResult>) => ({
        ...prev,
        [data.storyId]: data,
      }));

      if (isScanningCurrentRef.current) {
        isScanningCurrentRef.current = false;
        setIsScanningCurrent(false);
      }

      if (waitingFor.current === data.storyId) {
        waitingFor.current = null;
        setScanProgress((p) => ({ ...p, done: p.done + 1 }));
        navigateNext();
      }
    },
    [EVENTS.SCAN_SKIPPED]: (storyId: string) => {
      if (waitingFor.current !== storyId) return;
      waitingFor.current = null;
      setScanProgress((p) => ({ ...p, done: p.done + 1 }));
      navigateNext();
    },
  });

  function navigateNext() {
    const next = scanQueue.current.shift();
    if (next === undefined) {
      setIsScanning(false);
      return;
    }
    waitingFor.current = next;
    api.selectStory(next);
    setTimeout(() => emit(EVENTS.SCAN_REQUEST, next, false), 400);
  }

  function handleScanCurrent() {
    if (!currentStoryId || isScanningCurrentRef.current || isScanning) return;
    isScanningCurrentRef.current = true;
    setIsScanningCurrent(true);
    emit(EVENTS.SCAN_REQUEST, currentStoryId, true);
  }

  async function handleScanAll() {
    const ids = await fetchAllStoryIds();
    if (ids.length === 0) return;
    scanQueue.current = [...ids];
    setScanProgress({ done: 0, total: ids.length });
    setIsScanning(true);
    navigateNext();
  }

  function handleClear() {
    setResults({});
    setExpanded(new Set());
    emit(EVENTS.CLEAR); // tell preview to wipe fingerprint cache
  }

  function toggleExpand(title: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  const groups = groupByComponent(results);
  const passing = groups.filter(isPassing).length;
  const total = groups.length;

  const summaryColor =
    total === 0 ? "#888" : passing === total ? "#27ae60" : "#c0392b";

  return (
    <div style={S.panel}>
      {/* header */}
      <div style={S.header}>
        <span style={{ ...S.summary, color: summaryColor }}>
          {total === 0
            ? "No results yet"
            : `${passing} / ${total} component${total !== 1 ? "s" : ""} passing`}
        </span>
        <button
          style={S.btn()}
          onClick={handleScanCurrent}
          disabled={isScanningCurrent || isScanning || !currentStoryId}
          aria-busy={isScanningCurrent}
          title="Scan the current story in light and dark"
        >
          {isScanningCurrent ? "Scanning…" : "Scan"}
        </button>
        <button
          style={S.btn(true)}
          onClick={() => void handleScanAll()}
          disabled={isScanning || isScanningCurrent}
          aria-busy={isScanning}
        >
          {isScanning ? "Scanning…" : "Scan All"}
        </button>
        {total > 0 && (
          <button style={S.btn()} onClick={handleClear} disabled={isScanning}>
            Clear
          </button>
        )}
      </div>

      {/* scan progress */}
      {isScanning && (
        <div style={S.progress} role="status" aria-live="polite">
          {scanProgress.done} / {scanProgress.total} stories scanned
        </div>
      )}

      {/* column headers */}
      {total > 0 && (
        <div style={S.columnHeaders} aria-hidden>
          <span>Component</span>
          <span>Light</span>
          <span>Dark</span>
        </div>
      )}

      {/* results list */}
      <div style={S.list} role="list">
        {total === 0 ? (
          <div style={S.empty}>
            Browse stories to see results, or click <strong>Scan All</strong>.
          </div>
        ) : (
          groups.map((group) => (
            <ComponentRow
              key={group.title}
              group={group}
              expanded={expanded.has(group.title)}
              onToggle={() => toggleExpand(group.title)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── registration ────────────────────────────────────────────────────────────

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: "A11y Health",
    render: ({ active }: { active?: boolean }) => (
      <AddonPanel active={active ?? false}>
        <Panel />
      </AddonPanel>
    ),
  });
});
