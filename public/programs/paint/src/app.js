// @ts-check
// eslint-disable-next-line no-unused-vars
/* global airbrush_size:writable, brush_shape:writable, brush_size:writable, button:writable, ctrl:writable, eraser_size:writable, fill_color:writable, pick_color_slot:writable, history_node_to_cancel_to:writable, my_canvas_height:writable, my_canvas_width:writable, palette:writable, pencil_size:writable, pointer:writable, pointer_active:writable, pointer_buttons:writable, pointer_over_canvas:writable, pointer_previous:writable, pointer_start:writable, pointer_type:writable, pointers:writable, reverse:writable, shift:writable, stroke_color:writable, stroke_size:writable, update_helper_layer_on_pointermove_active:writable */
/* global current_history_node, default_airbrush_size, default_brush_shape, default_brush_size, default_canvas_height, default_canvas_width, default_eraser_size, default_magnification, default_pencil_size, default_stroke_size, file_name, get_direction, localize, magnification, main_canvas, main_ctx, return_to_tools, selected_colors, selected_tool, selected_tools, selection, systemHooks, textbox, transparency */

import { $ColorBox } from "./$ColorBox.js";
import { $ToolBox } from "./$ToolBox.js";
import { Handles } from "./Handles.js";
// import { get_direction, localize } from "./app-localization.js";
import { default_palette, get_winter_palette } from "./color-data.js";
import { cancel, change_url_param, clear, deselect, get_tool_by_id, get_uris, load_image_from_uri, make_or_update_undoable, open_from_file, paste, paste_image_from_file, reset_canvas_and_history, reset_file, reset_selected_colors, resize_canvas_and_save_dimensions, resize_canvas_without_saving_dimensions, select_tool, select_tools, set_magnification, show_error_message, show_resource_load_error_message, undo, update_canvas_rect, update_disable_aa, update_helper_layer, update_magnified_canvas_size } from "./functions.js";
import { $G, E, TAU, get_file_extension, get_help_folder_icon, to_canvas_coords } from "./helpers.js";
import { init_webgl_stuff, rotate } from "./image-manipulation.js";
import { showMessageBox } from "./msgbox.js";
import { localStore } from "./storage.js";
import { get_theme, set_theme } from "./theme.js";
import { TOOL_AIRBRUSH, TOOL_BRUSH, TOOL_CURVE, TOOL_ELLIPSE, TOOL_ERASER, TOOL_LINE, TOOL_PENCIL, TOOL_POLYGON, TOOL_RECTANGLE, TOOL_ROUNDED_RECTANGLE, TOOL_SELECT, tools } from "./tools.js";

// #region Exports

// Q: Why are the exports at the top of the file?
// A: The exports are scattered throughout the file, exactly where they
//    were implicitly being exported before transitioning to ESM.
//    For function declarations at the top level, this means the start of the file.
//    For let/const, this means the line after the declaration.
//    This is a temporary solution to resolve circular dependencies.
//    For instance, $ToolBox uses $left/$right. If $left/$right were exported
//    at the bottom of this file, an error would occur. This is because $ToolBox
//    is instantiated in the middle of this file (but after $left/$right are declared).
// @TODO: Minimize global variables and exports from app.js
window.update_fill_and_stroke_colors_and_lineWidth = update_fill_and_stroke_colors_and_lineWidth;
window.tool_go = tool_go;
window.average_points = average_points;

// #endregion


// #region System Hooks and default implementations

// Note: JSDoc type annotations don't seem to actually work on window.*
/**
 * @type {SystemHooks}
 * The methods in systemHooks can be overridden by a containing page like 98.js.org which hosts jspaint in a same-origin iframe.
 * This allows integrations like setting the wallpaper as the background of the host page, or saving files to a server.
 * This API may be removed at any time (and perhaps replaced by something based around postMessage)
 * The API is documented in the README.md file.
 */
window.systemHooks = window.systemHooks || {};
/** @type {SystemHooks} */
window.systemHookDefaults = {
	readBlobFromHandle: async (file_handle) => {
		if (file_handle && file_handle.getFile) {
			const file = await file_handle.getFile();
			return file;
		} else {
			throw new Error(`Unknown file handle (${file_handle})`);
			// show_error_message(`${localize("Failed to open document.")}\n${localize("An unsupported operation was attempted.")}`, error);
		}
	},
};

for (const [key, defaultValue] of Object.entries(window.systemHookDefaults)) {
	window.systemHooks[key] = window.systemHooks[key] || defaultValue;
}

// #endregion

// #region URL Params
const update_from_url_params = () => {
	if (location.hash.match(/vertical-color-box-mode/i)) {
		if (!$("body").hasClass("vertical-color-box-mode")) {
			$("body").addClass("vertical-color-box-mode");
			$G.triggerHandler("vertical-color-box-mode-toggled");
			$G.triggerHandler("theme-load"); // signal layout change
		}
	} else {
		if ($("body").hasClass("vertical-color-box-mode")) {
			$("body").removeClass("vertical-color-box-mode");
			$G.triggerHandler("vertical-color-box-mode-toggled");
			$G.triggerHandler("theme-load"); // signal layout change
		}
	}

	$("body").toggleClass("compare-reference", !!location.hash.match(/compare-reference/i));
	$("body").toggleClass("compare-reference-tool-windows", !!location.hash.match(/compare-reference-tool-windows/i));
	setTimeout(() => {
		if (location.hash.match(/compare-reference/i)) { // including compare-reference-tool-windows
			select_tool(get_tool_by_id(TOOL_SELECT));
			const test_canvas_width = 576;
			const test_canvas_height = 432;
			if (main_canvas.width !== test_canvas_width || main_canvas.height !== test_canvas_height) {
				// Unfortunately, right now this can cause a reverse "Save changes?" dialog,
				// where Discard will restore your drawing, Cancel will discard it, and Save will save a blank canvas,
				// because the load from storage happens after this resize.
				// But this is just a helper for development, so it's not a big deal.
				// are_you_sure here doesn't help, either.
				// are_you_sure(() => {
				resize_canvas_without_saving_dimensions(test_canvas_width, test_canvas_height);
				// });
			}
			if (!location.hash.match(/compare-reference-tool-windows/i)) {
				$toolbox.dock($left);
				$colorbox.dock($bottom);
				window.debugKeepMenusOpen = false;
			}
		}
		if (location.hash.match(/compare-reference-tool-windows/i)) {
			$toolbox.undock_to(84, 35);
			$colorbox.undock_to(239, 195);
			window.debugKeepMenusOpen = true;
		}
	}, 500);
};
update_from_url_params();
$G.on("hashchange popstate change-url-params", update_from_url_params);

// handle backwards compatibility URLs
if (location.search.match(/vertical-colors?-box/)) {
	change_url_param("vertical-color-box", true, { replace_history_state: true });
	update_from_url_params();
}

// #endregion

// #region App UI

const $app = $(E("div")).addClass("jspaint").appendTo("body");
window.$app = $app;

const $V = $(E("div")).addClass("vertical").appendTo($app);
const $H = $(E("div")).addClass("horizontal").appendTo($V);

const $canvas_area = $(E("div")).addClass("canvas-area inset-deep").appendTo($H);
window.$canvas_area = $canvas_area;

const $canvas = $(main_canvas).appendTo($canvas_area);
window.$canvas = $canvas;
$canvas.css("touch-action", "none");
window.canvas_bounding_client_rect = main_canvas.getBoundingClientRect(); // cached for performance, updated later
const canvas_handles = new Handles({
	$handles_container: $canvas_area,
	$object_container: $canvas_area,
	get_rect: () => ({ x: 0, y: 0, width: main_canvas.width, height: main_canvas.height }),
	set_rect: ({ width, height }) => resize_canvas_and_save_dimensions(width, height),
	outset: 4,
	get_handles_offset_left: () => parseFloat($canvas_area.css("padding-left")) + 1,
	get_handles_offset_top: () => parseFloat($canvas_area.css("padding-top")) + 1,
	get_ghost_offset_left: () => parseFloat($canvas_area.css("padding-left")) + 1,
	get_ghost_offset_top: () => parseFloat($canvas_area.css("padding-top")) + 1,
	size_only: true,
});
window.canvas_handles = canvas_handles;

const $top = $(E("div")).addClass("component-area top").prependTo($V);
window.$top = $top;
const $bottom = $(E("div")).addClass("component-area bottom").appendTo($V);
window.$bottom = $bottom;
const $left = $(E("div")).addClass("component-area left").prependTo($H);
window.$left = $left;
const $right = $(E("div")).addClass("component-area right").appendTo($H);
window.$right = $right;


// there's also probably a CSS solution alternative to this
if (get_direction() === "rtl") {
	$left.appendTo($H);
	$right.prependTo($H);
}

// #endregion
// (arguably still App UI stuff below, but it becomes a fuzzy line later on)

// #region Status Bar
const $status_area = $(E("div")).addClass("status-area").appendTo($V);
window.$status_area = $status_area;
const $status_text = /** @type {JQuery<HTMLDivElement> & {default: ()=> void}} */($(E("div")).addClass("status-text status-field inset-shallow").appendTo($status_area));
window.$status_text = $status_text;
const $status_position = $(E("div")).addClass("status-coordinates status-field inset-shallow").appendTo($status_area);
window.$status_position = $status_position;
const $status_size = $(E("div")).addClass("status-coordinates status-field inset-shallow").appendTo($status_area);
window.$status_size = $status_size;

$status_text.default = () => {
	$status_text.text(localize("For Help, click Help Topics on the Help Menu."));
};
$status_text.default();

// #endregion

let $toolbox = $ToolBox(tools);
window.$toolbox = $toolbox;
// let $toolbox2 = $ToolBox(extra_tools, true);//.hide();
// Note: a second $ToolBox doesn't work because they use the same tool options (which could be remedied)
// If there's to be extra tools, they should probably get a window, with different UI
// so it can display names of the tools, and maybe authors and previews (and not necessarily icons)

let $colorbox = $ColorBox($("body").hasClass("vertical-color-box-mode"));
window.$colorbox = $colorbox;

$G.on("vertical-color-box-mode-toggled", () => {
	$colorbox.destroy();
	$colorbox = $ColorBox($("body").hasClass("vertical-color-box-mode"));
	window.$colorbox = $colorbox;
	prevent_selection($colorbox);
});
$G.on("resize", () => { // for browser zoom, and in-app zoom of the canvas
	update_canvas_rect();
	update_disable_aa();
});
$canvas_area.on("scroll", () => {
	update_canvas_rect();
});
$canvas_area.on("resize", () => {
	update_magnified_canvas_size();
});

// Despite overflow:hidden on html and body,
// focusing elements that are partially offscreen can still scroll the page.
// For example, with Edit Colors dialog partially offscreen, navigating the color grid.
// We need to prevent (reset) scroll on focus, and also avoid scrollIntoView().
// Listening for scroll here is mainly in case a case is forgotten, like scrollIntoView,
// in which case it will flash sometimes but at least not end up with part of
// the application scrolled off the screen with no scrollbar to get it back.
$G.on("scroll focusin", () => {
	window.scrollTo(0, 0);
});

// #region Drag and Drop

// jQuery's multiple event handling is not that useful in the first place, but when adding type info... it's downright ugly.
$("body").on("dragover dragenter", (/** @type {JQuery.DragOverEvent | JQuery.DragEnterEvent} */event) => {
	const dt = event.originalEvent.dataTransfer;
	const has_files = dt && Array.from(dt.types).includes("Files");
	if (has_files) {
		event.preventDefault();
	}
}).on("drop", (event) => {
	if (event.isDefaultPrevented()) {
		return;
	}
	const dt = event.originalEvent.dataTransfer;
	const has_files = dt && Array.from(dt.types).includes("Files");
	if (has_files) {
		// File opening via drag-and-drop is intentionally disabled; just stop the
		// browser from navigating away to display the dropped file raw.
		event.preventDefault();
	}
});

// #endregion

// #region Alt+Mousewheel Zooming (and also some dev helper that I haven't used in years)
let alt_zooming = false;
addEventListener("keyup", (e) => {
	if (e.key === "Alt" && alt_zooming) {
		e.preventDefault(); // prevent menu bar from activating in Firefox from zooming
	}
	if (!e.altKey) {
		alt_zooming = false;
	}
});
// $G.on("wheel", (e) => {
addEventListener("wheel", (e) => {
	if (e.altKey) {
		e.preventDefault();
		let new_magnification = magnification;
		if (e.deltaY < 0) {
			new_magnification *= 1.5;
		} else {
			new_magnification /= 1.5;
		}
		new_magnification = Math.max(0.5, Math.min(new_magnification, 80));
		set_magnification(new_magnification, to_canvas_coords(e));
		alt_zooming = true;
		return;
	}
	if (e.ctrlKey || e.metaKey) {
		return;
	}
	// for reference screenshot mode (development helper):
	if (location.hash.match(/compare-reference/i)) { // including compare-reference-tool-windows
		// const delta_opacity = Math.sign(e.originalEvent.deltaY) * -0.1; // since attr() is not supported other than for content, this increment must match CSS
		const delta_opacity = Math.sign(e.deltaY) * -0.2; // since attr() is not supported other than for content, this increment must match CSS
		let old_opacity = parseFloat($("body").attr("data-reference-opacity"));
		if (!isFinite(old_opacity)) {
			old_opacity = 0.5;
		}
		const new_opacity = Math.max(0, Math.min(1, old_opacity + delta_opacity));
		$("body").attr("data-reference-opacity", new_opacity);
		// prevent scrolling, keeping the screenshot lined up
		// e.preventDefault(); // doesn't work
		// $canvas_area.scrollTop(0); // doesn't work with smooth scrolling
		// $canvas_area.scrollLeft(0);
	}
}, { passive: false });
// #endregion

// #region Initialization
// This sort of thing should really be at the END of the file.

reset_file();
reset_selected_colors();
reset_canvas_and_history(); // (with newly reset colors)
set_magnification(default_magnification);

// this is synchronous for now, but @TODO: handle possibility of loading a document before callback
// when switching to asynchronous storage, e.g. with localforage
localStore.get({
	width: default_canvas_width,
	height: default_canvas_height,
}, (err, stored_values) => {
	if (err) { return; }
	my_canvas_width = Number(stored_values.width);
	my_canvas_height = Number(stored_values.height);

	make_or_update_undoable({
		match: (history_node) => history_node.name === localize("New"),
		name: "Resize Canvas For New Document",
		icon: get_help_folder_icon("p_stretch_both.png"),
	}, () => {
		main_canvas.width = Math.max(1, my_canvas_width);
		main_canvas.height = Math.max(1, my_canvas_height);
		main_ctx.disable_image_smoothing();
		if (!transparency) {
			main_ctx.fillStyle = selected_colors.background;
			main_ctx.fillRect(0, 0, main_canvas.width, main_canvas.height);
		}
		$canvas_area.trigger("resize");
	});
});

if (window.initial_system_file_handle) {
	systemHooks.readBlobFromHandle(window.initial_system_file_handle).then((file) => {
		if (file) {
			open_from_file(file, window.initial_system_file_handle);
		}
	}, (error) => {
		// this handler is not always called, sometimes error message is shown from readBlobFromHandle
		show_error_message(`Failed to open file ${window.initial_system_file_handle}`, error);
	});
}
// #endregion

// #region Palette Updating From Theme

const update_palette_from_theme = () => {
	if (get_theme() === "winter.css") {
		palette = get_winter_palette();
		$colorbox.rebuild_palette();
	} else {
		palette = default_palette;
		$colorbox.rebuild_palette();
	}
};

$G.on("theme-load", update_palette_from_theme);
// #region Initialization (continued)
update_palette_from_theme();
// #endregion

// #endregion

function update_fill_and_stroke_colors_and_lineWidth(selected_tool) {
	main_ctx.lineWidth = stroke_size;

	const reverse_because_fill_only = !!(selected_tool.$options && selected_tool.$options.fill && !selected_tool.$options.stroke);
	/** @type {ColorSelectionSlot} */
	const color_k =
		(ctrl && selected_colors.ternary && pointer_active) ? "ternary" :
			((reverse !== reverse_because_fill_only) ? "background" : "foreground");
	main_ctx.fillStyle = fill_color =
		main_ctx.strokeStyle = stroke_color =
		selected_colors[color_k];

	/** @type {ColorSelectionSlot} */
	let fill_color_k =
		ctrl ? "ternary" : ((reverse !== reverse_because_fill_only) ? "background" : "foreground");
	/** @type {ColorSelectionSlot} */
	let stroke_color_k = fill_color_k;

	if (selected_tool.shape || selected_tool.shape_colors) {
		if (!selected_tool.stroke_only) {
			if ((reverse !== reverse_because_fill_only)) {
				fill_color_k = "foreground";
				stroke_color_k = "background";
			} else {
				fill_color_k = "background";
				stroke_color_k = "foreground";
			}
		}
		main_ctx.fillStyle = fill_color = selected_colors[fill_color_k];
		main_ctx.strokeStyle = stroke_color = selected_colors[stroke_color_k];
	}
	pick_color_slot = fill_color_k;
}

// #region Primary Canvas Interaction
function tool_go(selected_tool, event_name) {
	update_fill_and_stroke_colors_and_lineWidth(selected_tool);

	if (selected_tool[event_name]) {
		selected_tool[event_name](main_ctx, pointer.x, pointer.y);
	}
	if (selected_tool.paint) {
		selected_tool.paint(main_ctx, pointer.x, pointer.y);
	}
}
function canvas_pointer_move(e) {
	ctrl = e.ctrlKey;
	shift = e.shiftKey;
	pointer = to_canvas_coords(e);

	// Quick Undo (for mouse/pen)
	// (Note: pointermove also occurs when the set of buttons pressed changes,
	// except when another event would fire like pointerdown)
	if (pointers.length && e.button != -1) {
		// compare buttons other than middle mouse button by using bitwise OR to make that bit of the number the same
		const MMB = 4;
		if (e.pointerType != pointer_type || (e.buttons | MMB) != (pointer_buttons | MMB)) {
			cancel();
			pointer_active = false; // NOTE: pointer_active used in cancel()
			return;
		}
	}

	if (e.shiftKey) {
		// TODO: snap to 45 degrees for Pencil and Polygon tools
		// TODO: manipulating the pointer object directly is a bit of a hack
		if (
			selected_tool.id === TOOL_LINE ||
			selected_tool.id === TOOL_CURVE
		) {
			// snap to eight directions
			const dist = Math.sqrt(
				(pointer.y - pointer_start.y) * (pointer.y - pointer_start.y) +
				(pointer.x - pointer_start.x) * (pointer.x - pointer_start.x)
			);
			const eighth_turn = TAU / 8;
			const angle_0_to_8 = Math.atan2(pointer.y - pointer_start.y, pointer.x - pointer_start.x) / eighth_turn;
			const angle = Math.round(angle_0_to_8) * eighth_turn;
			pointer.x = Math.round(pointer_start.x + Math.cos(angle) * dist);
			pointer.y = Math.round(pointer_start.y + Math.sin(angle) * dist);
		} else if (selected_tool.shape) {
			// snap to four diagonals
			const w = Math.abs(pointer.x - pointer_start.x);
			const h = Math.abs(pointer.y - pointer_start.y);
			if (w < h) {
				if (pointer.y > pointer_start.y) {
					pointer.y = pointer_start.y + w;
				} else {
					pointer.y = pointer_start.y - w;
				}
			} else {
				if (pointer.x > pointer_start.x) {
					pointer.x = pointer_start.x + h;
				} else {
					pointer.x = pointer_start.x - h;
				}
			}
		}
	}
	selected_tools.forEach((selected_tool) => {
		tool_go(selected_tool);
	});
	pointer_previous = pointer;
}
$canvas.on("pointermove", (e) => {
	pointer = to_canvas_coords(e);
	$status_position.text(`${pointer.x},${pointer.y}`);
});
$canvas.on("pointerenter", (e) => {
	pointer_over_canvas = true;

	update_helper_layer(e);

	if (!update_helper_layer_on_pointermove_active) {
		$G.on("pointermove", update_helper_layer);
		update_helper_layer_on_pointermove_active = true;
	}
});
$canvas.on("pointerleave", (e) => {
	pointer_over_canvas = false;

	$status_position.text("");

	update_helper_layer(e);

	if (!pointer_active && update_helper_layer_on_pointermove_active) {
		$G.off("pointermove", update_helper_layer);
		update_helper_layer_on_pointermove_active = false;
	}
});
// #endregion

// #region Panning and Zooming
let last_zoom_pointer_distance;
let pan_last_pos;
// let pan_start_magnification; // for panning and zooming in the same gesture (...was this ever used?)
let first_pointer_time;
const discard_quick_undo_period = 500; // milliseconds in which to treat gesture as just a pan/zoom if you use two fingers, rather than treating it as a brush stroke you might care about
function average_points(points) {
	const average = { x: 0, y: 0 };
	for (const pointer of points) {
		average.x += pointer.x;
		average.y += pointer.y;
	}
	average.x /= points.length;
	average.y /= points.length;
	return average;
}
$canvas_area.on("pointerdown", (event) => {
	if (
		document.activeElement instanceof HTMLElement && // exists and (for type checker:) has blur()
		document.activeElement !== document.body &&
		document.activeElement !== document.documentElement
	) {
		// Allow unfocusing dialogs etc. in order to use keyboard shortcuts
		document.activeElement.blur();
	}

	if (pointers.every((pointer) =>
		// prevent multitouch panning in case of synthetic events from eye gaze mode
		pointer.pointerId !== 1234567890 &&
		// prevent multitouch panning in case of dragging across iframe boundary with a mouse/pen
		// Note: there can be multiple active primary pointers, one per pointer type
		!(pointer.isPrimary && (pointer.pointerType === "mouse" || pointer.pointerType === "pen"))
		// @TODO: handle case of dragging across iframe boundary with touch
	)) {
		pointers.push({
			pointerId: event.pointerId,
			pointerType: event.pointerType,
			// isPrimary not available on jQuery.Event, and originalEvent not available in synthetic case
			// @ts-ignore
			isPrimary: event.originalEvent && event.originalEvent.isPrimary || event.isPrimary,
			x: event.clientX,
			y: event.clientY,
		});
	}
	if (pointers.length === 1) {
		first_pointer_time = performance.now();
	}
	if (pointers.length == 2) {
		last_zoom_pointer_distance = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
		pan_last_pos = average_points(pointers);
		// pan_start_magnification = magnification;
	}
	// Quick Undo when there are multiple pointers (i.e. for touch)
	// See pointermove for other pointer types
	// SEE OTHER POINTERDOWN HANDLER ALSO
	if (pointers.length >= 2) {
		// If you press two fingers quickly, it shouldn't make a new history entry.
		// But if you draw something and then press a second finger to clear it, it should let you redo.
		const discard_document_state = first_pointer_time && performance.now() - first_pointer_time < discard_quick_undo_period;
		cancel(false, discard_document_state);
		pointer_active = false; // NOTE: pointer_active used in cancel(); must be set after cancel()
		return;
	}
});
$G.on("pointerup pointercancel", (event) => {
	pointers = pointers.filter((pointer) =>
		pointer.pointerId !== event.pointerId
	);
});
$G.on("pointermove", (event) => {
	for (const pointer of pointers) {
		if (pointer.pointerId === event.pointerId) {
			pointer.x = event.clientX;
			pointer.y = event.clientY;
		}
	}
	if (pointers.length >= 2) {
		const current_pos = average_points(pointers);
		const distance = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
		const difference_in_distance = distance - last_zoom_pointer_distance;
		let new_magnification = magnification;
		if (Math.abs(difference_in_distance) > 60) {
			last_zoom_pointer_distance = distance;
			if (difference_in_distance > 0) {
				new_magnification *= 1.5;
			} else {
				new_magnification /= 1.5;
			}
		}
		new_magnification = Math.max(0.5, Math.min(new_magnification, 40));
		if (new_magnification != magnification) {
			set_magnification(new_magnification, to_canvas_coords({ clientX: current_pos.x, clientY: current_pos.y }));
		}
		const difference_in_x = current_pos.x - pan_last_pos.x;
		const difference_in_y = current_pos.y - pan_last_pos.y;
		$canvas_area.scrollLeft($canvas_area.scrollLeft() - difference_in_x);
		$canvas_area.scrollTop($canvas_area.scrollTop() - difference_in_y);
		pan_last_pos = current_pos;
	}
});
// #endregion

// #region Primary Canvas Interaction (continued)
$canvas.on("pointerdown", (e) => {
	update_canvas_rect();

	// Quick Undo when there are multiple pointers (i.e. for touch)
	// see pointermove for other pointer types
	// SEE OTHER POINTERDOWN HANDLER ALSO
	// NOTE: this relies on event handler order for pointerdown
	// pointer is not added to pointers yet
	if (pointers.length >= 1) {
		// If you press two fingers quickly, it shouldn't make a new history entry.
		// But if you draw something and then press a second finger to clear it, it should let you redo.
		const discard_document_state = first_pointer_time && performance.now() - first_pointer_time < discard_quick_undo_period;
		cancel(false, discard_document_state);
		pointer_active = false; // NOTE: pointer_active used in cancel(); must be set after cancel()

		// in eye gaze mode, allow drawing with mouse after canceling gaze gesture with mouse
		pointers = pointers.filter((pointer) =>
			pointer.pointerId !== 1234567890
		);
		return;
	}

	history_node_to_cancel_to = current_history_node;

	pointer_active = !!(e.buttons & (1 | 2)); // as far as tools are concerned
	pointer_type = e.pointerType;
	pointer_buttons = e.buttons;
	$G.one("pointerup", (e) => {
		pointer_active = false;
		update_helper_layer(e);

		if (!pointer_over_canvas && update_helper_layer_on_pointermove_active) {
			$G.off("pointermove", update_helper_layer);
			update_helper_layer_on_pointermove_active = false;
		}
	});

	if (e.button === 0) {
		reverse = false;
	} else if (e.button === 2) {
		reverse = true;
	} else {
		return;
	}

	button = e.button;
	ctrl = e.ctrlKey;
	shift = e.shiftKey;
	pointer_start = pointer_previous = pointer = to_canvas_coords(e);

	const pointerdown_action = () => {
		let interval_ids = [];
		selected_tools.forEach((selected_tool) => {
			if (selected_tool.paint || selected_tool.pointerdown) {
				tool_go(selected_tool, "pointerdown");
			}
			if (selected_tool.paint_on_time_interval != null) {
				interval_ids.push(setInterval(() => {
					tool_go(selected_tool);
				}, selected_tool.paint_on_time_interval));
			}
		});

		$G.on("pointermove", canvas_pointer_move);

		$G.one("pointerup", (e, canceling, no_undoable) => {
			button = undefined;
			reverse = false;

			if (e.clientX !== undefined) { // may be synthetic event without coordinates
				pointer = to_canvas_coords(e);
			}
			// don't create undoables if you're two-finger-panning
			// @TODO: do any tools use pointerup for cleanup?
			if (!no_undoable) {
				selected_tools.forEach((selected_tool) => {
					selected_tool.pointerup?.(main_ctx, pointer.x, pointer.y);
				});
			}

			if (selected_tools.length === 1) {
				if (selected_tool.deselect) {
					select_tools(return_to_tools);
				}
			}
			$G.off("pointermove", canvas_pointer_move);
			for (const interval_id of interval_ids) {
				clearInterval(interval_id);
			}

			if (!canceling) {
				history_node_to_cancel_to = null;
			}
		});
	};

	pointerdown_action();

	update_helper_layer(e);
});
// #endregion

// #region Deselection / Selection Prevention
$canvas_area.on("pointerdown", (e) => {
	if (e.button === 0) {
		if ($canvas_area.is(e.target)) {
			if (selection) {
				deselect();
			}
		}
	}
});

function prevent_selection($el) {
	$el.on("mousedown selectstart contextmenu", (e) => {
		if (e.isDefaultPrevented()) {
			return;
		}
		if (
			e.target instanceof HTMLSelectElement ||
			e.target instanceof HTMLTextAreaElement ||
			(e.target instanceof HTMLLabelElement && e.type !== "contextmenu") ||
			(e.target instanceof HTMLInputElement && e.target.type !== "color")
		) {
			return;
		}
		if (e.button === 1) {
			return; // allow middle-click scrolling
		}
		e.preventDefault();
		// we're just trying to prevent selection
		// but part of the default for mousedown is *deselection*
		// so we have to do that ourselves explicitly
		window.getSelection().removeAllRanges();
	});
}

prevent_selection($app);
prevent_selection($toolbox);
// prevent_selection($toolbox2);
prevent_selection($colorbox);
// #endregion

// Stop drawing (or dragging or whatever) if you Alt+Tab or whatever
$G.on("blur", () => {
	$G.triggerHandler("pointerup");
});

// #region Fullscreen Handling for iOS
// For Safari on iPad, Fullscreen mode overlays the system bar, completely obscuring our menu bar.
// See CSS .fullscreen handling (and exit_fullscreen_if_ios) for more info.
function iOS() {
	return (
		[
			"iPad Simulator",
			"iPhone Simulator",
			"iPod Simulator",
			"iPad",
			"iPhone",
			"iPod",
		].includes(navigator.platform) ||
		// iPad on iOS 13 detection
		(navigator.userAgent.includes("Mac") && "ontouchend" in document)
	);
}
$("html").toggleClass("ios", iOS());
$G.on("fullscreenchange webkitfullscreenchange", () => {
	// const fullscreen = $G.is(":fullscreen") || $G.is(":-webkit-full-screen"); // gives "Script error."
	const fullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
	// $status_text.text(`fullscreen: ${fullscreen}`);
	$("html").toggleClass("fullscreen", fullscreen);
});
// #endregion

// #region Testing Helpers
// Note: this is defined here so the app is loaded when this is defined.
window.api_for_cypress_tests = {
	reset_for_next_test() {
		selected_colors.foreground = "#000";
		selected_colors.background = "#fff";
		brush_shape = default_brush_shape;
		brush_size = default_brush_size;
		eraser_size = default_eraser_size;
		airbrush_size = default_airbrush_size;
		pencil_size = default_pencil_size;
		stroke_size = default_stroke_size;
		clear();
	},
	selected_colors,
	set_theme,
	$,
};
// #endregion

init_webgl_stuff();
