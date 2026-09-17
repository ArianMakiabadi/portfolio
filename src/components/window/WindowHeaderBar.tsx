import type { WindowHeaderBarConfig } from "../../types/windowHeaderBar";
import WindowHeaderTools from "./WindowHeaderTools";
import WindowHeaderSearch from "./WindowHeaderSearch";

type WindowHeaderBarProps = {
  config: WindowHeaderBarConfig;
};

function WindowHeaderBar({ config }: WindowHeaderBarProps) {
  return (
    <div className="window-header-bar">
      <WindowHeaderTools config={config.tools} />
      <WindowHeaderSearch config={config.search} />
    </div>
  );
}

export default WindowHeaderBar;
