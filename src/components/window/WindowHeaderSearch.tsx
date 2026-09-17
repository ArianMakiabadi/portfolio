import type { WindowHeaderSearchConfig } from "../../types/windowHeaderSearch";
import downCaret from "../../assets/window/header-tools/down-icon.webp";
import goArrow from "../../assets/window/header-tools/right-green-arrow-icon.webp";

type WindowHeaderSearchProps = {
  config: WindowHeaderSearchConfig;
};

function WindowHeaderSearch({ config }: WindowHeaderSearchProps) {
  return (
    <div className="window-header-search">
      <span className="window-header-search-label">Address</span>
      <div className="window-header-search-field">
        <img src={config.icon} alt="" className="window-header-search-icon" />
        <span className="window-header-search-path">{config.path}</span>
        <img src={downCaret} alt="" className="window-header-search-caret" />
      </div>
      <div
        className="window-header-search-go pointer"
        onMouseDown={() => config.onGo?.()}
      >
        <img src={goArrow} alt="" className="window-header-search-go-icon" />
        <span>Go</span>
      </div>
    </div>
  );
}

export default WindowHeaderSearch;
