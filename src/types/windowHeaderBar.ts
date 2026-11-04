import type { WindowHeaderToolsConfig } from "./windowHeaderTools";
import type { WindowHeaderSearchConfig } from "./windowHeaderSearch";

export type WindowHeaderBarConfig = {
  tools: WindowHeaderToolsConfig;
  // Omit for a toolbar-only header (no address bar), e.g. ContactWindow.
  search?: WindowHeaderSearchConfig;
};
