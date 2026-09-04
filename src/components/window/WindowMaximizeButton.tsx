type WindowMaximizeButtonProps = {
  maximized: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function WindowMaximizeButton({
  maximized,
  disabled,
  onClick,
}: WindowMaximizeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={maximized ? "Restore" : "Maximize"}
      className={`window-control-button window-btn-maximize relative h-full border border-white hover:brightness-125 active:brightness-90 ${
        maximized ? "maximized" : ""
      } ${disabled ? "cursor-default opacity-60" : "pointer"}`}
    />
  );
}

export default WindowMaximizeButton;
