// @ts-check
/* global tool_transparent_mode:writable, palette:writable */
/* global $canvas_area, $colorbox, $status_area, $toolbox, localize, magnification, main_canvas, menu_bar, MENU_DIVIDER, redos, selection, show_grid, show_thumbnail, systemHooks, undos */
// import { localize } from "./app-localization.js";
import { show_edit_colors_window } from "./edit-colors.js";
import { palette_formats } from "./file-format-data.js";
import { are_you_sure, change_url_param, choose_file_to_paste, clear, delete_selection, edit_copy, edit_cut, edit_paste, file_load_from_url, file_new, file_open, file_print, image_attributes, image_flip_and_rotate, image_invert_colors, image_stretch_and_skew, redo, select_all, set_magnification, show_custom_zoom_window, show_document_history, show_file_format_errors, toggle_grid, toggle_thumbnail, undo, view_bitmap } from "./functions.js";
import { $G, is_discord_embed } from "./helpers.js";
import { showMessageBox } from "./msgbox.js";

const looksLikeChrome = !!(window.chrome && (window.chrome.loadTimes || window.chrome.csi));
// NOTE: Microsoft Edge includes window.chrome.app
// (also this browser detection logic could likely use some more nuance)

/** @type {OSGUITopLevelMenus} */
const menus = {
	[localize("&File")]: [
		{
			label: localize("&New"),
			action: () => { file_new(); },
			description: localize("Creates a new document."),
		},
		{
			label: localize("&Open"),
			action: () => { file_open(); },
			description: localize("Opens an existing document."),
		},
		{
			label: localize("&Load From URL"),
			// shortcut: "", // no shortcut: Ctrl+L is taken, and you can paste a URL with Ctrl+V, so it's not really needed
			action: () => { file_load_from_url(); },
			description: localize("Opens an image from the web."),
		},
		MENU_DIVIDER,
		{
			label: localize("Print Pre&view"),
			action: () => {
				file_print();
			},
			description: localize("Prints the active document and sets printing options."),
			//description: localize("Displays full pages."),
		},
		{
			label: localize("Page Se&tup"),
			action: () => {
				file_print();
			},
			description: localize("Prints the active document and sets printing options."),
			//description: localize("Changes the page layout."),
		},
		{
			label: localize("&Print"),
			action: () => {
				file_print();
			},
			description: localize("Prints the active document and sets printing options."),
		},
		MENU_DIVIDER,
		{
			label: localize("Recent File"),
			enabled: false, // @TODO for desktop app
			description: localize(""),
		},
		MENU_DIVIDER,
		{
			label: localize("E&xit"),
			action: () => {
				are_you_sure(() => {
					if (is_discord_embed) {
						// For the Discord Activity, there doesn't seem to be an API to exit the activity.
						showMessageBox({
							message: "Click the Leave Activity button in Discord to exit.",
						});
						return;
					}

					// Note: For a Chrome PWA, window.close() is allowed only if there is only one history entry.
					// I could make it try to close the window and then navigate to the official web desktop if it fails,
					// but that would be inconsistent, as it wouldn't close the window after using File > New or File > Open.
					// I could make it so that it uses replaceState when opening a new document (starting a new session);
					// that would prevent you from using Alt+Left to go back to the previous document, but that may be acceptable
					// for a desktop app experience, where the back button is already hidden.
					// That said, if you just installed the PWA, it will have history already (even if just the New Tab page),
					// as the tab is converted to a window, and in that case,
					// it would be unable to close, again being inconsistent, but less so.
					// (If on PWA install, the app could open a fresh new window and close itself, it could work from the start,
					// but if we try to do that, we'll be back at square one, trying to close a window with history.)
					try {
						// API contract is containing page can override window.close()
						// Note that e.g. (()=>{}).bind().toString() gives "function () { [native code] }"
						// so the window.close() must not use bind() (not that that's common practice anyway)
						const close_overridden = frameElement && window.close && !/\{\s*\[native code\]\s*\}/.test(window.close.toString());
						if (close_overridden || window.is_electron_app) {
							window.close();
							return;
						}
					} catch (_error) {
						// In a cross-origin iframe, most likely
						// @TODO: establish postMessage API
					}
					// In a cross-origin iframe, or same origin but without custom close(), or top level:
					// Not all browsers support close() for closing a tab,
					// so redirect instead. Exit to the official web desktop.
					// @ts-ignore
					window.location = "https://98.js.org/";
				});
			},
			description: localize("Quits Paint."),
		},
	],
	[localize("&Edit")]: [
		{
			label: localize("&Undo"),
			enabled: () => undos.length >= 1,
			action: () => { undo(); },
			description: localize("Undoes the last action."),
		},
		{
			label: localize("&Repeat"),
			enabled: () => redos.length >= 1,
			action: () => { redo(); },
			description: localize("Redoes the previously undone action."),
		},
		{
			label: localize("&History"),
			action: () => { show_document_history(); },
			description: localize("Shows the document history and lets you navigate to states not accessible with Undo or Repeat."),
		},
		MENU_DIVIDER,
		{
			label: localize("Cu&t"),
			enabled: () =>
				// @TODO: support cutting text with this menu item as well (e.g. for the text tool)
				!!selection,
			action: () => {
				edit_cut(true);
			},
			description: localize("Cuts the selection and puts it on the Clipboard."),
		},
		{
			label: localize("&Copy"),
			enabled: () =>
				// @TODO: support copying text with this menu item as well (e.g. for the text tool)
				!!selection,
			action: () => {
				edit_copy(true);
			},
			description: localize("Copies the selection and puts it on the Clipboard."),
		},
		{
			label: localize("&Paste"),
			enabled: () =>
				// @TODO: disable if nothing in clipboard or wrong type (if we can access that)
				true,
			action: () => {
				edit_paste(true);
			},
			description: localize("Inserts the contents of the Clipboard."),
		},
		{
			label: localize("C&lear Selection"),
			enabled: () => !!selection,
			action: () => { delete_selection(); },
			description: localize("Deletes the selection."),
		},
		{
			label: localize("Select &All"),
			action: () => { select_all(); },
			description: localize("Selects everything."),
		},
		MENU_DIVIDER,
		{
			label: `${localize("Paste &From")}...`,
			action: () => { choose_file_to_paste(); },
			description: localize("Pastes a file into the selection."),
		},
	],
	[localize("&View")]: [
		{
			label: localize("&Tool Box"),
			checkbox: {
				toggle: () => {
					$toolbox.toggle();
				},
				check: () => $toolbox.is(":visible"),
			},
			description: localize("Shows or hides the tool box."),
		},
		{
			label: localize("&Color Box"),
			checkbox: {
				toggle: () => {
					$colorbox.toggle();
				},
				check: () => $colorbox.is(":visible"),
			},
			description: localize("Shows or hides the color box."),
		},
		{
			label: localize("&Status Bar"),
			checkbox: {
				toggle: () => {
					$status_area.toggle();
				},
				check: () => $status_area.is(":visible"),
			},
			description: localize("Shows or hides the status bar."),
		},
		{
			label: localize("T&ext Toolbar"),
			enabled: false, // @TODO: toggle fonts box
			checkbox: {
				toggle: () => {
					// Kind of silly that I haven't implemented this in the 10 years I've been working on this project.
				},
				check: () => false,
			},
			description: localize("Shows or hides the text toolbar."),
		},
		MENU_DIVIDER,
		{
			label: localize("&Zoom"),
			submenu: [
				{
					label: localize("&Normal Size"),
					description: localize("Zooms the picture to 100%."),
					enabled: () => magnification !== 1,
					action: () => {
						set_magnification(1);
					},
				},
				{
					label: localize("&Large Size"),
					description: localize("Zooms the picture to 400%."),
					enabled: () => magnification !== 4,
					action: () => {
						set_magnification(4);
					},
				},
				{
					label: localize("Zoom To &Window"),
					description: localize("Zooms the picture to fit within the view."),
					action: () => {
						const rect = $canvas_area[0].getBoundingClientRect();
						const margin = 30; // leave a margin so scrollbars won't appear
						let mag = Math.min(
							(rect.width - margin) / main_canvas.width,
							(rect.height - margin) / main_canvas.height,
						);
						// round to an integer percent for the View > Zoom > Custom... dialog, which shows non-integers as invalid
						mag = Math.floor(100 * mag) / 100;
						set_magnification(mag);
					},
				},
				{
					label: `${localize("C&ustom")}...`,
					description: localize("Zooms the picture."),
					action: () => { show_custom_zoom_window(); },
				},
				MENU_DIVIDER,
				{
					label: localize("Show &Grid"),
					enabled: () => magnification >= 4,
					checkbox: {
						toggle: () => { toggle_grid(); },
						check: () => show_grid,
					},
					description: localize("Shows or hides the grid."),
				},
				{
					label: localize("Show T&humbnail"),
					checkbox: {
						toggle: () => { toggle_thumbnail(); },
						check: () => show_thumbnail,
					},
					description: localize("Shows or hides the thumbnail view of the picture."),
				},
			],
		},
		{
			label: localize("&View Bitmap"),
			action: () => { view_bitmap(); },
			description: localize("Displays the entire picture."),
		},
		MENU_DIVIDER,
		{
			label: localize("&Fullscreen"),
			enabled: () => Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled),
			checkbox: {
				check: () => Boolean(document.fullscreenElement || document.webkitFullscreenElement),
				toggle: () => {
					if (document.fullscreenElement || document.webkitFullscreenElement) {
						if (document.exitFullscreen) {
							document.exitFullscreen();
						} else if (document.webkitExitFullscreen) {
							document.webkitExitFullscreen();
						}
					} else {
						if (document.documentElement.requestFullscreen) {
							document.documentElement.requestFullscreen();
						} else if (document.documentElement.webkitRequestFullscreen) {
							document.documentElement.webkitRequestFullscreen();
						}
					}
					// check() would need to be async or faked with a timeout,
					// if the menus stayed open. @TODO: make all checkboxes close menus
					menu_bar.closeMenus();
				},
			},
			description: localize("Makes the application take up the entire screen."),
		},
	],
	[localize("&Image")]: [
		// @TODO: speech recognition: terms that apply to selection
		{
			label: localize("&Flip/Rotate"),
			action: () => { image_flip_and_rotate(); },
			description: localize("Flips or rotates the picture or a selection."),
		},
		{
			label: localize("&Stretch/Skew"),
			action: () => { image_stretch_and_skew(); },
			description: localize("Stretches or skews the picture or a selection."),
		},
		{
			label: localize("&Invert Colors"),
			action: () => { image_invert_colors(); },
			description: localize("Inverts the colors of the picture or a selection."),
		},
		{
			label: `${localize("&Attributes")}...`,
			action: () => { image_attributes(); },
			description: localize("Changes the attributes of the picture."),
		},
		{
			label: localize("&Clear Image"),
			// (mspaint says "Ctrl+Shft+N")
			action: () => { if (!selection) { clear(); } },
			enabled: () => !selection,
			description: localize("Clears the picture."),
			// action: ()=> {
			// 	if (selection) {
			// 		delete_selection();
			// 	} else {
			// 		clear();
			// 	}
			// },
			// mspaint says localize("Clears the picture or selection."), but grays out the option when there's a selection
		},
		{
			label: localize("&Draw Opaque"),
			checkbox: {
				toggle: () => {
					tool_transparent_mode = !tool_transparent_mode;
					$G.trigger("option-changed");
				},
				check: () => !tool_transparent_mode,
			},
			description: localize("Makes the current selection either opaque or transparent."),
		},
	],
	[localize("&Colors")]: [
		{
			label: `${localize("&Edit Colors")}...`,
			action: () => {
				show_edit_colors_window();
			},
			description: localize("Creates a new color."),
		},
		{
			label: localize("&Get Colors"),
			action: async () => {
				const { file } = await systemHooks.showOpenFileDialog({ formats: palette_formats });
				AnyPalette.loadPalette(file, (error, new_palette) => {
					if (error) {
						show_file_format_errors({ as_palette_error: error });
					} else {
						palette = new_palette.map((color) => color.toString());
						$colorbox.rebuild_palette();
						window.console?.log(`Loaded palette: ${palette.map(() => "%c█").join("")}`, ...palette.map((color) => `color: ${color};`));
					}
				});
			},
			description: localize("Uses a previously saved palette of colors."),
		},
	],
	[localize("E&xtras")]: [
		{
			emoji_icon: "⌚",
			label: localize("&History"),
			action: () => { show_document_history(); },
			description: localize("Shows the document history and lets you navigate to states not accessible with Undo or Repeat."),
		},
		// {
		// 	label: localize("Render History as &APNG",
		// 	// shortcut: "Ctrl+Shift+A",
		// 	action: ()=> { render_history_as_apng(); },
		// 	description: localize("Creates an animation from the document history."),
		// },
		MENU_DIVIDER,
		// {
		// 	label: localize("Extra T&ool Box",
		// 	checkbox: {
		// 		toggle: ()=> {
		// 			// this doesn't really work well at all to have two toolboxes
		// 			// (this was not the original plan either)
		// 			$toolbox2.toggle();
		// 		},
		// 		check: ()=> {
		// 			return $toolbox2.is(":visible");
		// 		},
		// 	},
		// 	description: localize("Shows or hides an extra tool box."),
		// },
		// {
		// 	label: localize("&Preferences",
		// 	action: ()=> {
		// 		// :)
		// 	},
		// 	description: localize("Configures JS Paint."),
		// }
		{
			emoji_icon: "↕️",
			label: localize("&Vertical Color Box"),
			checkbox: {
				toggle: () => {
					if (/vertical-color-box-mode/i.test(location.hash)) {
						change_url_param("vertical-color-box-mode", false);
					} else {
						change_url_param("vertical-color-box-mode", true);
					}
				},
				check: () => {
					return /vertical-color-box-mode/i.test(location.hash);
				},
			},
			description: localize("Arranges the color box vertically."),
		},
		MENU_DIVIDER,
		{
			emoji_icon: "👾", // "👋",
			label: localize("Discord"),
			action: () => {
				window.open("https://discord.gg/SyFweYjTKx");
			},
			description: localize("Joins the community on Discord."),
		},
		{
			emoji_icon: "ℹ️",
			label: localize("GitHub"),
			action: () => { window.open("https://github.com/1j01/jspaint"); },
			description: localize("Shows the project on GitHub."),
		},
		{
			emoji_icon: "💵",
			label: localize("Donate"),
			action: () => { window.open("https://www.paypal.me/IsaiahOdhner"); },
			description: localize("Supports the project."),
		},
	],
};

export { menus };

