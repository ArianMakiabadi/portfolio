// @ts-check
const default_theme = "classic.css";
const theme_storage_key = "jspaint theme";
const href_for = (theme) => `styles/themes/${theme}`;

let current_theme;
try {
	current_theme = localStorage[theme_storage_key] || default_theme;
} catch (error) {
	console.error(error);
	current_theme = default_theme;
}

const theme_link = document.createElement("link");
theme_link.rel = "stylesheet";
theme_link.type = "text/css";
theme_link.href = href_for(current_theme);
theme_link.id = "theme-link";
document.head.appendChild(theme_link);

update_not_for_modern_theme();

function update_not_for_modern_theme() {
	const not_for_modern = /** @type {NodeListOf<HTMLLinkElement>} */(document.querySelectorAll("link.not-for-modern"));
	for (const link of not_for_modern) {
		link.disabled = current_theme === "modern.css" || current_theme === "modern-dark.css" || current_theme === "bubblegum.css";
	}
}

