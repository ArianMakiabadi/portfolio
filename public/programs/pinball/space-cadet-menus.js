// Thin input-bridging layer between the parent React window (its own MenuBar)
// and the compiled game's internal ImGui menu, which has no exposed JS API.
// Actions are delivered as synthetic mouse clicks at the fixed pixel
// coordinates the internal menu renders at (baked into the compiled binary),
// ported from the original 98.js "space-cadet-menus.js".

var audio_enabled = true;
var canvas = document.getElementById("canvas");
var overlay_canvas = document.getElementById("overlay-canvas");
var overlay_context = overlay_canvas.getContext("2d");
var freezing_display = false;

function start_freeze_frame() {
	if (freezing_display) return;
	freezing_display = true;
	overlay_context.fillStyle = "black";
	overlay_context.fillRect(0, 0, canvas.width, canvas.height);
	overlay_context.drawImage(canvas, 0, 0);
}

function stop_freeze_frame() {
	freezing_display = false;
	overlay_context.clearRect(0, 0, canvas.width, canvas.height);
}

function click(canvas_x, canvas_y, event_types = ["mouseenter", "mousedown", "mouseup"], options = {}) {
	const rect = canvas.getBoundingClientRect();
	const client_x = canvas_x + rect.left;
	const client_y = canvas_y + rect.top;
	const params = Object.assign({
		clientX: client_x,
		clientY: client_y,
		pageX: client_x,
		pageY: client_y,
		offsetX: canvas_x,
		offsetY: canvas_y,
		screenX: client_x,
		screenY: client_y,
		movementX: 0,
		movementY: 0,
		which: 1,
		button: 0,
		buttons: 1,
		altKey: false,
		ctrlKey: false,
		shiftKey: false,
		metaKey: false,
		bubbles: true,
		cancelable: true,
		view: window,
		target: canvas,
	}, options);
	for (const event_type of event_types) {
		canvas.dispatchEvent(new MouseEvent(event_type, params));
	}
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Simulates opening the internal menu at top_level_menu_index and clicking
// item_index (and optionally a submenu_item_index), with a freeze-frame so
// the transient ImGui dropdown isn't visible mid-sequence.
async function handle_menu_item(top_level_menu_index, item_index, submenu_item_index) {
	window.dispatchEvent(new Event("focus")); // make the game think it's focused
	canvas.style.pointerEvents = "none";
	canvas.focus();
	start_freeze_frame();
	const delay = 100;
	await sleep(delay);
	click(30 + top_level_menu_index * 50, 15);
	await sleep(delay);
	click(30 + top_level_menu_index * 50, 35 + item_index * 16);
	await sleep(delay);
	if (submenu_item_index !== undefined) {
		click(200 + top_level_menu_index * 50, 35 + item_index * 16 + submenu_item_index * 16);
		await sleep(delay);
	}
	canvas.style.pointerEvents = "auto";
	stop_freeze_frame();
}

function toggle_fullscreen() {
	if (document.fullscreenElement) {
		document.exitFullscreen();
	} else {
		document.body.requestFullscreen();
	}
}

window.pinballBridge = {
	newGame: () => handle_menu_item(0, 0),
	launchBall: () => handle_menu_item(0, 1),
	pauseOrResume: () => handle_menu_item(0, 2),
	toggleFullScreen: () => toggle_fullscreen(),
	toggleAudio: () => {
		audio_enabled = !audio_enabled;
		if (audio_enabled) {
			window.unmute_game_audio?.();
		} else {
			window.mute_game_audio?.();
		}
	},
};

window.addEventListener("keydown", function (e) {
	if (e.key === "F4") {
		e.preventDefault();
		toggle_fullscreen();
	}
});
