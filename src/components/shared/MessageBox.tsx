import { createPortal } from "react-dom";

type MessageBoxProps = {
  title: string;
  icon: string;
  message: string;
  onOk: () => void;
};

// Modal XP message box (title, icon, text, OK). Portaled to <body> with a
// transparent full-screen backdrop so nothing else is clickable until OK.
function MessageBox({ title, icon, message, onOk }: MessageBoxProps) {
  return createPortal(
    <div className="fixed inset-0 z-10000 flex items-center justify-center">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="min-w-[260px] max-w-[400px] overflow-hidden rounded-t-lg bg-[#0831D9] px-0.75 pb-0.75 shadow-[2px_2px_10px_rgba(0,0,0,0.5)]"
      >
        <div className="window-titlebar-active -mx-0.75 flex h-7 items-center px-2">
          <h4 className="window-title-text-shadow truncate text-[0.85rem] font-semibold text-white">
            {title}
          </h4>
        </div>
        <div className="bg-[#ece9d8] px-3 pt-4 pb-3 xp-text">
          <div className="flex items-center gap-3">
            <img src={icon} alt="" draggable="false" className="h-8 w-8" />
            <p>{message}</p>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              autoFocus
              onClick={onOk}
              className="xp-button pointer"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default MessageBox;
