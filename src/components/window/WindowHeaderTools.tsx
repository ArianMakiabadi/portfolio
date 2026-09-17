import type {
  WindowHeaderToolsButton,
  WindowHeaderToolsConfig,
} from "../../types/windowHeaderTools";

type WindowHeaderToolsProps = {
  config: WindowHeaderToolsConfig;
};

function WindowHeaderTools({ config }: WindowHeaderToolsProps) {
  return (
    <div className="window-header-tools">
      {config.groups.map((group, groupIndex) => (
        <div key={groupIndex} className="window-header-tools-group">
          {group.map((button, buttonIndex) => (
            <ToolButton key={buttonIndex} button={button} />
          ))}
          {groupIndex < config.groups.length - 1 && (
            <span className="window-header-tools-divider" />
          )}
        </div>
      ))}
    </div>
  );
}

function ToolButton({ button }: { button: WindowHeaderToolsButton }) {
  return (
    <div
      className={
        button.disabled
          ? "window-header-tools-button window-header-tools-button-disabled"
          : "window-header-tools-button pointer"
      }
      onMouseDown={() => !button.disabled && button.onSelect?.()}
    >
      <img src={button.icon} alt="" className="window-header-tools-icon" />
      {button.label && (
        <span className="window-header-tools-label">{button.label}</span>
      )}
      {button.hasDropdown && <span className="window-header-tools-caret" />}
    </div>
  );
}

export default WindowHeaderTools;
