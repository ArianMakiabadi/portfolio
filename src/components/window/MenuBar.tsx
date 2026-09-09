import { useEffect, useRef, useState } from "react";
import type { MenuBarMenu } from "../../types/menuBar";
import checkedSprite from "../../assets/window/checked.png";

type MenuBarProps = {
  menus: MenuBarMenu[];
};

function MenuBar({ menus }: MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;

    function handleWindowMouseDown(event: MouseEvent) {
      if (!menuBarRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    window.addEventListener("mousedown", handleWindowMouseDown);
    return () => window.removeEventListener("mousedown", handleWindowMouseDown);
  }, [openMenu]);

  function handleTabMouseDown(label: string) {
    setOpenMenu((current) => (current === label ? null : label));
  }

  function handleTabMouseOver(menu: MenuBarMenu) {
    if (openMenu && !menu.disabled) setOpenMenu(menu.label);
  }

  function handleRowSelect(action: () => void) {
    action();
    setOpenMenu(null);
  }

  return (
    <div ref={menuBarRef} className="menubar">
      {menus.map((menu) => (
        <div
          key={menu.label}
          className={
            menu.disabled ? "menubar-item menubar-item-disabled" : "menubar-item pointer"
          }
          onMouseDown={() => !menu.disabled && handleTabMouseDown(menu.label)}
          onMouseOver={() => handleTabMouseOver(menu)}
        >
          {menu.label}
        </div>
      ))}

      {menus.map(
        (menu) =>
          openMenu === menu.label && (
            <div key={menu.label} className="menubar-dropdown">
              {menu.items.map((item, index) => {
                if (item.type === "separator") {
                  return <div key={index} className="menubar-dropdown-separator" />;
                }

                return (
                  <div
                    key={item.label}
                    className="menubar-dropdown-row pointer"
                    onMouseUp={() => handleRowSelect(item.onSelect)}
                  >
                    <div className="menubar-dropdown-check">
                      {item.type === "checkable" && item.checked && (
                        <img
                          src={checkedSprite}
                          alt="checked"
                          className="pointer-events-none select-none"
                        />
                      )}
                    </div>
                    <span className="menubar-dropdown-text">{item.label}</span>
                    <span />
                    <span />
                  </div>
                );
              })}
            </div>
          ),
      )}
    </div>
  );
}

export default MenuBar;
