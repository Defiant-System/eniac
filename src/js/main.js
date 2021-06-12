
@import "modules/render.js"
@import "modules/parser.js"
@import "modules/cursor.js"
@import "modules/file.js"

const XLSX = await window.fetch("~/js/xlsx.full.min.js")

const eniac = {
	init() {
		// init renderer
		Cursor.init();
		Render.init();
		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());
	},
	async dispatch(event) {
		let Self = eniac,
			file,
			table,
			data,
			name,
			pEl,
			el,
			str;
		switch (event.type) {
			// system events
			case "window.open":
				// window.find(".sidebar-head > span").get(1).trigger("click");
				break;
			case "window.close":
				break;
			case "open.file":
				event.open({ responseType: "arrayBuffer" })
					.then(file => {
						let data = new Uint8Array(file.arrayBuffer),
							book = XLSX.read(data, { type: "array" });
						// render workbook
						Render.workbook(book);
						// save reference to file
						Self.file = new File(file);

						// setTimeout(() => Self.dispatch({ type: "save-file-as" }), 500);
					});
				break;
			case "save-file":
				console.log("todo");
				break;
			case "save-file-as":
				file = Self.file;
				// pass on available file types
				window.dialog.saveAs(file._file, {
					xlsx: () => file.toBlob("xlsx"),
					xml:  () => file.toBlob("xml"),
				});
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
	sidebar: @import "modules/sidebar.js",
	head: @import "modules/head.js",
};

window.exports = eniac;
