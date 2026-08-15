export const ADDON_ID = "cv-builder/a11y-panel";
export const PANEL_ID = `${ADDON_ID}/panel`;

export const EVENTS = {
  RESULT: `${ADDON_ID}/result`,
  CLEAR: `${ADDON_ID}/clear`,
  SCAN_REQUEST: `${ADDON_ID}/scan-request`,
  SCAN_SKIPPED: `${ADDON_ID}/scan-skipped`,
} as const;
