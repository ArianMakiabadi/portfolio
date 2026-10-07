import xpBliss from "@/assets/xp-bliss.webp";
import windowsLogo from "@/assets/logos/windows-logo.webp";
import windowsFlag from "@/assets/logos/windows-flag-only.webp";
import logoffIcon from "@/assets/taskbar/icons/key-log-icon.webp";
import restartIcon from "@/assets/taskbar/icons/restart.webp";
import shutdownIcon from "@/assets/taskbar/icons/shutdown-icon.webp";
import profilePhoto from "@/assets/profile-photo.webp";
import startButton from "@/assets/taskbar/start-button.webp";
import progressCursor from "@/assets/cursors/default_wait.cur";
import { START_MENU_ICON_URLS } from "@/data/startMenuIcons";

// .cur can't be decoded by <img>, so only "error" fires, never "load" - but
// preloadImages resolves on either, and the request still warms the HTTP cache.
export const BOOT_PRELOAD_ASSET_URLS: string[] = [
  xpBliss,
  windowsLogo,
  windowsFlag,
  logoffIcon,
  restartIcon,
  shutdownIcon,
  profilePhoto,
  startButton,
  progressCursor,
  ...START_MENU_ICON_URLS,
];
