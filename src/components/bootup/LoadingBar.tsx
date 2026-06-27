function LoadingBar() {
  return (
    <div className="loading-bar-frame" role="progressbar" aria-label="Loading">
      <div className="loading-bar-track">
        <span className="loading-bar-box" />
        <span className="loading-bar-box" />
        <span className="loading-bar-box" />
      </div>
    </div>
  );
}

export default LoadingBar;
