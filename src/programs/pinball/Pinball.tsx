import type { RefObject } from "react";

type PinballProps = {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  loaded: boolean;
};

function Pinball({ iframeRef, loaded }: PinballProps) {
  return (
    <div className="relative h-full w-full bg-black">
      {!loaded && (
        <div className="progress absolute inset-0 flex items-center justify-center bg-black text-sm text-white">
          Loading Space Cadet...
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/programs/pinball/space-cadet.html"
        title="3D Pinball for Windows - Space Cadet"
        className="h-full w-full border-0"
      />
    </div>
  );
}

export default Pinball;
