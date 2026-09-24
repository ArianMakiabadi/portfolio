// @ts-check

/** @type {ImageFileFormat[]} */
let image_formats = [];
// const ext_to_image_formats = {}; // there can be multiple with the same extension, e.g. different bit depth BMP files
// const mime_type_to_image_formats = {};
/**
 * @param {string} mime_type
 * @param {string} name_and_exts
 * @param {ImageFileFormat[]} [target_array]
 */
const add_image_format = (mime_type, name_and_exts, target_array = image_formats) => {
	// Note: some localizations have commas instead of semicolons to separate file extensions
	// Assumption: file extensions are never localized
	const format = {
		formatID: mime_type,
		mimeType: mime_type,
		name: name_and_exts.replace(/\s+\([^(]+$/, ""),
		nameWithExtensions: name_and_exts,
		extensions: [],
	};
	const ext_regexp = /\*\.([^);,]+)/g;
	let match;
	// eslint-disable-next-line no-cond-assign
	while (match = ext_regexp.exec(name_and_exts)) {
		const ext = match[1];
		// ext_to_image_formats[ext] = ext_to_image_formats[ext] || [];
		// ext_to_image_formats[ext].push(format);
		// mime_type_to_image_formats[mime_type] = mime_type_to_image_formats[mime_type] || [];
		// mime_type_to_image_formats[mime_type].push(format);
		format.extensions.push(ext);
	}

	target_array.push(format);
};
// First file extension in a parenthetical defines default for the format.
add_image_format("image/png", "PNG (*.png)");
add_image_format("image/webp", "WebP (*.webp)");
add_image_format("image/gif", "GIF (*.gif)");
add_image_format("image/tiff", "TIFF (*.tif;*.tiff)");
add_image_format("image/jpeg", "JPEG (*.jpg;*.jpeg;*.jpe;*.jfif)");
add_image_format("image/x-bmp-1bpp", "Monochrome Bitmap (*.bmp;*.dib)");
add_image_format("image/x-bmp-4bpp", "16 Color Bitmap (*.bmp;*.dib)");
add_image_format("image/x-bmp-8bpp", "256 Color Bitmap (*.bmp;*.dib)");
add_image_format("image/bmp", "24-bit Bitmap (*.bmp;*.dib)");
// add_image_format("image/x-bmp-32bpp", "32-bit Transparent Bitmap (*.bmp;*.dib)");

// For the Open dialog, show more general format categories, like "Bitmap Files", maybe "Icon Files", etc.
// @TODO: probably need to do this differently for showOpenFilePicker...
/*
const image_format_categories = (image_formats) => {
	image_formats = image_formats.filter((format) =>
		!format.extensions.includes("bmp")
	);
	add_image_format("image/bmp", "Bitmap Files (*.bmp)".replace("(*.bmp)", "(*.bmp;*.dib)"), image_formats);
	// add_image_format("", "Icon Files (*.ico;*.cur;*.ani;*.icns)", image_formats);
	// add_image_format("", "All Picture Files", image_formats);
	// add_image_format("", "All Files", image_formats);
	image_formats.push({
		// TODO: we don't treat formatID and mimeType interchangeably, do we?
		formatID: "IMAGE_FILES",
		mimeType: "image/*", // but also application/pdf, not included here, but hopefully the mime type isn't what we go off of (I don't remember)
		name: "All Picture Files",
		nameWithExtensions: "All Picture Files",
		extensions: image_formats.map((format) => format.extensions).flat(),
	});
	image_formats.push({
		formatID: "ALL_FILES",
		mimeType: "*" + "/*",
		name: "All Files",
		nameWithExtensions: "All Files",
		extensions: ["*"], // Note: no other wildcard is allowed in the extension list
	});
	return image_formats;
};
*/

export { image_formats };
