type WindowCloseButtonProps = {
  onClick: () => void;
};

function WindowCloseButton({ onClick }: WindowCloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="window-control-button window-btn-close pointer relative h-full border border-white hover:brightness-125 active:brightness-90"
    />
  );
}

export default WindowCloseButton;
