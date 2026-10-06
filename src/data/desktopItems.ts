import { startMenuApps } from "./startMenuItems";

// Start menu apps that also get a desktop icon, in display order.
const DESKTOP_APP_IDS = ["projects"];

export const desktopItems = DESKTOP_APP_IDS.flatMap(
  (id) => startMenuApps.find((app) => app.id === id) ?? [],
);
