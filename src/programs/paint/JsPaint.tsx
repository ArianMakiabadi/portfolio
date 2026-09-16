import type { RefObject } from "react";

type JsPaintProps = {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  loaded: boolean;
  onLoad: () => void;
};

function JsPaint({ iframeRef, loaded, onLoad }: JsPaintProps) {
  return (
    <div className="relative h-full w-full bg-[#c0c0c0]">
      {!loaded && (
        <div className="progress pointer-events-none absolute inset-0 flex items-center justify-center bg-[#c0c0c0] text-sm text-black">
          Loading Paint...
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/programs/paint/index.html"
        title="Paint"
        onLoad={onLoad}
        className="h-full w-full border-0"
      />
    </div>
  );
}

export default JsPaint;
