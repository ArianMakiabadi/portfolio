import xpBliss from "../../assets/xp-bliss.webp";
import windowsLogo from "../../assets/logos/windows-logo.webp";
import profilePhoto from "../../assets/profile-photo.webp";
import startButton from "../../assets/taskbar/start-button.webp";
import progressCursor from "../../assets/cursors/default_wait.cur";
import { START_MENU_ICON_URLS } from "../../data/startMenuIcons";

// .cur can't be decoded by <img>, so only "error" fires, never "load" - but
// preloadImages resolves on either, and the request still warms the HTTP cache.
export const BOOT_PRELOAD_ASSET_URLS: string[] = [
  xpBliss,
  windowsLogo,
  profilePhoto,
  startButton,
  progressCursor,
  ...START_MENU_ICON_URLS,
];
