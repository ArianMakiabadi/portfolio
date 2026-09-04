import { useEffect, useRef, useState, type ReactNode } from "react";
import { useWindowManager } from "../../context/useWindowManager";
import type { WindowPosition, WindowSize } from "../../types/window";
import WindowCloseButton from "./WindowCloseButton";
import WindowMaximizeButton from "./WindowMaximizeButton";
import WindowMinimizeButton from "./WindowMinimizeButton";

type ResizeDirection = "right" | "bottom" | "corner";

type WindowProps = {
  id: string;
  title: string;
  iconSrc: string;
  children: ReactNode;
  initialPosition: WindowPosition;
  initialSize: WindowSize;
  minSize?: WindowSize;
  resizable?: boolean;
  onClose?: () => void;
  onMinimize?: (isMinimized: boolean) => void;
};

const DEFAULT_MIN_SIZE: WindowSize = { width: 200, height: 160 };

function getTaskbarHeight() {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    "--taskbar-height",
  );
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 30;
}

function Window({
  id,
  title,
  iconSrc,
  children,
  initialPosition,
  initialSize,
  minSize = DEFAULT_MIN_SIZE,
  resizable = true,
  onClose,
  onMinimize,
}: WindowProps) {
  const {
    activeWindowId,
    openWindows,
    getZIndex,
    registerWindow,
    unregisterWindow,
    focusWindow,
    minimizeWindow,
    registerWindowElement,
  } = useWindowManager();

  const rootRef = useRef<HTMLDivElement>(null);
  const [isClosed, setIsClosed] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState<WindowPosition>(initialPosition);
  const [size, setSize] = useState<WindowSize>(initialSize);

  const isActive = activeWindowId === id;
  const isMinimized =
    openWindows.find((entry) => entry.id === id)?.isMinimized ?? false;
  const zIndex = getZIndex(id);

  useEffect(() => {
    registerWindow(id, { title, iconSrc });
    focusWindow(id);
    return () => unregisterWindow(id);
    // Only register once on mount, matching Office.vue's openWindow behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    registerWindowElement(id, rootRef.current);
    return () => registerWindowElement(id, null);
  }, [id, registerWindowElement]);

  const onMinimizeRef = useRef(onMinimize);
  useEffect(() => {
    onMinimizeRef.current = onMinimize;
  }, [onMinimize]);

  const previousIsMinimizedRef = useRef(isMinimized);
  useEffect(() => {
    if (previousIsMinimizedRef.current !== isMinimized) {
      previousIsMinimizedRef.current = isMinimized;
      onMinimizeRef.current?.(isMinimized);
    }
  }, [isMinimized]);

  const dragState = useRef<{
    startMouseX: number;
    startMouseY: number;
    startPosition: WindowPosition;
    lastUpdate: number;
  } | null>(null);

  function handleTitleBarMouseDown(event: React.MouseEvent) {
    focusWindow(id);
    if (isMaximized) return;

    dragState.current = {
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startPosition: position,
      lastUpdate: 0,
    };
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
  }

  function handleDragMove(event: MouseEvent) {
    const drag = dragState.current;
    if (!drag) return;

    const now = performance.now();
    if (now - drag.lastUpdate < 16) return;
    drag.lastUpdate = now;

    const deltaX = event.clientX - drag.startMouseX;
    const deltaY = event.clientY - drag.startMouseY;

    const maxX = window.innerWidth - size.width;
    const maxY = window.innerHeight - getTaskbarHeight() - size.height;

    setPosition({
      x: Math.min(Math.max(drag.startPosition.x + deltaX, 0), Math.max(maxX, 0)),
      y: Math.min(Math.max(drag.startPosition.y + deltaY, 0), Math.max(maxY, 0)),
    });
  }

  function handleDragEnd() {
    dragState.current = null;
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
  }

  const resizeState = useRef<{
    direction: ResizeDirection;
    startMouseX: number;
    startMouseY: number;
    startSize: WindowSize;
  } | null>(null);

  function handleResizeStart(
    event: React.MouseEvent,
    direction: ResizeDirection,
  ) {
    event.stopPropagation();
    focusWindow(id);

    resizeState.current = {
      direction,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startSize: size,
    };
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  }

  function handleResizeMove(event: MouseEvent) {
    const resize = resizeState.current;
    if (!resize) return;

    const deltaX = event.clientX - resize.startMouseX;
    const deltaY = event.clientY - resize.startMouseY;

    const maxWidth = window.innerWidth - position.x;
    const maxHeight = window.innerHeight - getTaskbarHeight() - position.y;

    setSize((current) => {
      let { width, height } = current;

      if (resize.direction === "right" || resize.direction === "corner") {
        width = Math.min(
          Math.max(resize.startSize.width + deltaX, minSize.width),
          maxWidth,
        );
      }
      if (resize.direction === "bottom" || resize.direction === "corner") {
        height = Math.min(
          Math.max(resize.startSize.height + deltaY, minSize.height),
          maxHeight,
        );
      }

      return { width, height };
    });
  }

  function handleResizeEnd() {
    resizeState.current = null;
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  }

  function handleClose() {
    unregisterWindow(id);
    onClose?.();
    setIsClosed(true);
  }

  function handleToggleMinimize() {
    minimizeWindow(id);
  }

  function handleToggleMaximize() {
    setIsMaximized((current) => !current);
  }

  if (isClosed) return null;

  const windowStyle: React.CSSProperties = {
    zIndex,
    display: isMinimized ? "none" : undefined,
    ...(isMaximized
      ? {
          left: 0,
          top: 0,
          width: "100vw",
          height: "calc(100dvh - var(--taskbar-height, 30px))",
        }
      : {
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
        }),
  };

  return (
    <div
      ref={rootRef}
      id={id}
      onMouseDown={() => focusWindow(id)}
      className={`fixed select-none overflow-hidden rounded-t-lg ${
        isActive ? "bg-[#0831D9]" : "bg-[#6582F5]"
      }`}
      style={windowStyle}
    >
      <div
        onMouseDown={handleTitleBarMouseDown}
        className={`flex h-7 w-full items-center justify-between px-1 ${
          isActive ? "window-titlebar-active" : "window-titlebar-deactivated"
        }`}
      >
        <div className="flex h-5/6 flex-1 items-center gap-1 overflow-hidden pr-1 font-semibold text-white select-none">
          <img src={iconSrc} alt="" className="h-4 w-4 shrink-0" />
          <div className="flex items-center overflow-hidden">
            <h4 className="window-title-text-shadow truncate text-[0.85rem]">
              {title}
            </h4>
          </div>
        </div>
        <div
          className={`mt-px flex h-5/6 items-center gap-px ${
            isActive ? "opacity-100" : "opacity-60"
          }`}
        >
          <WindowMinimizeButton onClick={handleToggleMinimize} />
          <WindowMaximizeButton
            maximized={isMaximized}
            disabled={!resizable}
            onClick={handleToggleMaximize}
          />
          <WindowCloseButton onClick={handleClose} />
        </div>
      </div>

      <div className="absolute h-full w-full overflow-hidden p-0.75">
        {children}
      </div>

      {resizable && !isMaximized && (
        <>
          <div
            onMouseDown={(event) => handleResizeStart(event, "right")}
            className="absolute top-0 right-0 h-full w-2 cursor-ew-resize bg-transparent"
          />
          <div
            onMouseDown={(event) => handleResizeStart(event, "bottom")}
            className="absolute bottom-0 left-0 h-2 w-full cursor-ns-resize bg-transparent"
          />
          <div
            onMouseDown={(event) => handleResizeStart(event, "corner")}
            className="absolute right-0 bottom-0 h-2.5 w-2.5 cursor-nwse-resize bg-transparent"
          />
        </>
      )}
    </div>
  );
}

export default Window;
