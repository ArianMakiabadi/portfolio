import { useState } from "react";
import type {
  WindowLeftMenuConfig,
  WindowLeftMenuItem,
  WindowLeftMenuSection,
} from "../../types/windowLeftMenu";

type WindowLeftMenuProps = {
  config: WindowLeftMenuConfig;
};

function WindowLeftMenu({ config }: WindowLeftMenuProps) {
  return (
    <div className="window-left-menu">
      {config.sections.map((section) => (
        <Section key={section.title} section={section} />
      ))}
    </div>
  );
}

function Section({ section }: { section: WindowLeftMenuSection }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="window-left-menu-section">
      <div
        className="window-left-menu-section-header pointer"
        onMouseDown={() => setCollapsed((current) => !current)}
      >
        <span className="window-left-menu-section-title">{section.title}</span>
        <span
          className={
            collapsed
              ? "window-left-menu-section-toggle window-left-menu-section-toggle-collapsed"
              : "window-left-menu-section-toggle"
          }
        />
      </div>
      {!collapsed && (
        <div className="window-left-menu-section-items">
          {section.items.map((item) => (
            <Item key={item.label} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function Item({ item }: { item: WindowLeftMenuItem }) {
  const content = (
    <>
      <img src={item.icon} alt="" className="window-left-menu-item-icon" />
      <span className="window-left-menu-item-label">{item.label}</span>
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className="window-left-menu-item pointer"
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className="window-left-menu-item pointer"
      onMouseDown={() => item.onSelect?.()}
    >
      {content}
    </div>
  );
}

export default WindowLeftMenu;
