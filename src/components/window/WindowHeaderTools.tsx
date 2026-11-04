import type {
  WindowHeaderToolsButton,
  WindowHeaderToolsConfig,
} from "@/types/windowHeaderTools";

type WindowHeaderToolsProps = {
  config: WindowHeaderToolsConfig;
};

type ToolButtonProps = {
  button: WindowHeaderToolsButton;
  stacked: boolean;
};

function WindowHeaderTools({ config }: WindowHeaderToolsProps) {
  const stacked = config.stacked ?? false;

  return (
    <div className={`window-header-tools ${stacked ? "h-12" : ""}`}>
      {config.groups.map((group, groupIndex) => (
        <div key={groupIndex} className="window-header-tools-group">
          {group.map((button, buttonIndex) => (
            <ToolButton key={buttonIndex} button={button} stacked={stacked} />
          ))}
          {groupIndex < config.groups.length - 1 && (
            <span
              className={`window-header-tools-divider ${stacked ? "h-9" : ""}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ToolButton({ button, stacked }: ToolButtonProps) {
  const classNames = ["window-header-tools-button"];
  if (stacked) classNames.push("h-[42px] flex-col justify-center gap-0.5 px-2");
  if (button.disabled) classNames.push("window-header-tools-button-disabled");
  if ((button.isBack || button.onSelect) && !button.disabled) {
    classNames.push("pointer");
  }

  return (
    // A real button: keyboard-reachable, and onClick only fires for a primary
    // click, so right/middle clicks never trigger it (matters for Send).
    <button
      type="button"
      disabled={button.disabled}
      className={classNames.join(" ")}
      onClick={() => button.onSelect?.()}
    >
      <img
        src={button.icon}
        alt=""
        className={`window-header-tools-icon ${stacked ? "object-contain" : ""}`}
      />
      {button.label && (
        <span className="window-header-tools-label">{button.label}</span>
      )}
      {button.hasDropdown && <span className="window-header-tools-caret" />}
    </button>
  );
}

export default WindowHeaderTools;
