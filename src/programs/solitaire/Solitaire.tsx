import type { RefObject } from "react";

type SolitaireProps = {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  loaded: boolean;
  onLoad: () => void;
};

function Solitaire({ iframeRef, loaded, onLoad }: SolitaireProps) {
  return (
    <div className="relative h-full w-full bg-green-800">
      {!loaded && (
        <div className="progress pointer-events-none absolute inset-0 flex items-center justify-center bg-green-800 text-sm text-white">
          Loading Solitaire...
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/programs/solitaire/index.html"
        title="Solitaire"
        onLoad={onLoad}
        className="h-full w-full border-0"
      />
    </div>
  );
}

export default Solitaire;
