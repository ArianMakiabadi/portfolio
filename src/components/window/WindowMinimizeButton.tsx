type WindowMinimizeButtonProps = {
  onClick: () => void;
};

function WindowMinimizeButton({ onClick }: WindowMinimizeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Minimize"
      className="window-control-button window-btn-minimize pointer relative h-full border border-white hover:brightness-125 active:brightness-90"
    />
  );
}

export default WindowMinimizeButton;
