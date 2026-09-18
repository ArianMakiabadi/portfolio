import type { WindowHeaderSearchConfig } from "../../types/windowHeaderSearch";
import downCaret from "../../assets/window/header-tools/down-icon.webp";
import goArrow from "../../assets/window/header-tools/right-green-arrow-icon.webp";

type WindowHeaderSearchProps = {
  config: WindowHeaderSearchConfig;
};

function WindowHeaderSearch({ config }: WindowHeaderSearchProps) {
  return (
    <div className="flex h-[22px] shrink-0 items-center gap-1 bg-[rgb(236,233,216)] p-1 text-[11px]">
      <span className="whitespace-nowrap text-[rgb(100,100,100)]">Address</span>
      <div className="flex h-[18px] min-w-0 flex-1 items-center justify-between gap-1 border border-[rgb(122,158,224)] bg-white pl-1 pr-0.5">
        <img src={config.icon} alt="" className="h-[14px] w-[14px] shrink-0" />
        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {config.path}
        </span>
        <img src={downCaret} alt="" className="h-[14px] w-[14px] shrink-0" />
      </div>
      <div
        className="flex items-center gap-1 whitespace-nowrap px-1.5"
        onMouseDown={() => config.onGo?.()}
      >
        <img src={goArrow} alt="" className="h-[14px] w-[14px] shrink-0" />
        <span>Go</span>
      </div>
    </div>
  );
}

export default WindowHeaderSearch;
