import React, { useRef } from "react";
import { useChannel } from "storybook/internal/preview-api";
import type { Renderer, StoryContext } from "storybook/internal/types";
import axe from "axe-core";
import { EVENTS } from "./constants.js";

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const fingerprintCache = new Map<string, string>();

function djb2(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash >>> 0);
}

async function runAudit(
  root: Element,
  emit: (event: string, ...args: unknown[]) => void,
  context: StoryContext<Renderer>,
  force: boolean,
) {
  const currentPrint = djb2(root.innerHTML);
  if (!force && fingerprintCache.get(context.id) === currentPrint) {
    emit(EVENTS.SCAN_SKIPPED, context.id);
    return;
  }

  const savedTheme = document.documentElement.getAttribute("data-theme");
  try {
    document.documentElement.setAttribute("data-theme", "light");
    await settle();
    const light = await axe.run(root, { runOnly: AXE_TAGS });

    document.documentElement.setAttribute("data-theme", "dark");
    await settle();
    const dark = await axe.run(root, { runOnly: AXE_TAGS });

    fingerprintCache.set(context.id, currentPrint);

    emit(EVENTS.RESULT, {
      storyId: context.id,
      storyName: context.name,
      componentTitle: context.title,
      light,
      dark,
    });
  } finally {
    if (savedTheme !== null) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }
}

export function withA11yPanel(StoryFn: () => React.ReactNode, context: StoryContext<Renderer>) {
  const running = useRef(false);

  const emit = useChannel({
    [EVENTS.CLEAR]: () => {
      fingerprintCache.clear();
    },
    [EVENTS.SCAN_REQUEST]: (storyId: string, force = true) => {
      if (storyId !== context.id || running.current) return;
      running.current = true;
      const root = document.getElementById("storybook-root") ?? document.body;
      runAudit(root, emit, context, force).finally(() => {
        running.current = false;
      });
    },
  });

  return <>{StoryFn()}</>;
}

function settle(ms = 50): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
