
defiant.require("modules/parser.js")

const numbers = {
	init() {
		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());
	},
	async dispatch(event) {
		let Self = numbers,
			pEl,
			name;
		switch (event.type) {
			// system events
			case "window.open":
				break;
			case "window.close":
				break;
			case "window.keystroke":
				if (event.target) {
					el = $(event.target);
					pEl = el.parents("[data-area]");
					name = pEl.data("area");
					if (pEl.length && Self[name].dispatch) {
						Self[name].dispatch(event);
					}
				}
				break;
			// custom events
			case "toggle-sidebar":
				return Self.sidebar.dispatch(event);
			// forwards events
			default:
				if (event.el) {
					pEl = event.el.parents("[data-area]");
					name = pEl.data("area");
					if (pEl.length && Self[name].dispatch) {
						Self[name].dispatch(event);
					}
				}
		}
	},
	tools: defiant.require("modules/tools.js"),
	selection: defiant.require("modules/selection.js"),
	sidebar: defiant.require("modules/sidebar.js"),
	content: defiant.require("modules/content.js"),
};

window.exports = numbers;
