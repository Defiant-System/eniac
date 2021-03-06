
@import "modules/render.js"
@import "modules/parser.js"

const XLSX = await window.fetch("~/js/xlsx.js")

const eniac = {
	init() {
		// init renderer
		Render.init();
		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());
	},
	async dispatch(event) {
		let Self = eniac,
			file,
			data,
			workbook,
			name,
			pEl,
			el,
			str;
		switch (event.type) {
			// system events
			case "window.open":
				window.find(".sidebar-head > span").get(1).trigger("click");
				break;
			case "window.close":
				break;
			case "open.file":
				file = await event.open();
				data = await file.read();
				workbook = XLSX.read(data, { type:"array" });
				console.log(workbook);

				// file = await event.open({ arrayBuffer: true });
				// workbook = XLSX.read(file.data, { type:"array" });
				// Render.workbook(workbook);
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
	tools: @import "modules/tools.js",
	selection: @import "modules/selection.js",
	sidebar: @import "modules/sidebar.js",
	content: @import "modules/content.js",
};

window.exports = eniac;
