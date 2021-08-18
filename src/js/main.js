
@import "modules/color.js"
@import "modules/render.js"
@import "modules/cursor.js"
@import "modules/file.js"

const XLSX = await window.fetch("~/js/xdef.js");
// const XLSX = await window.fetch("~/js/xlsx.full.min.js");

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
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.open":
				break;
			case "window.close":
				break;
			case "new-file":
				// save reference to file
				Self.file = new File();
				break;
			case "open.file":
				return Self.dispatch({ type: "new-file" });

				event.open({ responseType: "arrayBuffer" })
					.then(file => {
						let data = new Uint8Array(file.arrayBuffer);
						
						// save reference to file
						Self.file = new File(file, data);

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
				Cursor.dispatch(event);
				break;
			// system menu events
			case "before-menu:sheet-tab":
				return Self.head.dispatch(event);
			// custom events
			case "popup-view-options":
			case "insert-text-box":
				return Self.popups.dispatch(event);
			case "hide-popups":
				Self.popups.dispatch({ type: "close-popup" });
				break;
			case "toggle-sidebar":
				return Self.sidebar.dispatch(event);
			case "blur-table":
				el = $(event.target);
				switch (true) {
					case el.hasClass("table-title"):
						return Cursor.dispatch({ type: "focus-table-title", el });
					case el.hasClass("table-caption"):
						return Cursor.dispatch({ type: "focus-table-caption", el });
				}
				Self.shape.dispatch({ type: "blur-shape", el });
				return Cursor.dispatch({ type: "blur-table", el });
			// forwards events
			default:
				el = event.el || (event.origin && event.origin.el);
				if (el) {
					pEl = el.data("area") ? el : el.parents("[data-area]");
					name = pEl.data("area");
					if (pEl.length && Self[name].dispatch) {
						Self[name].dispatch(event);
					}
				}
		}
	},
	head: @import "modules/head.js",
	foot: @import "modules/foot.js",
	tools: @import "modules/tools.js",
	shape: @import "modules/shape.js",
	sidebar: @import "modules/sidebar.js",
	popups: @import "modules/popups.js",
};

window.exports = eniac;
