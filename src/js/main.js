
@import "classes/grid.js"
@import "classes/grid-tools.js"
@import "classes/guides.js"
@import "classes/file.js"
@import "modules/color.js"
@import "modules/render.js"


const XLSX = await window.fetch("~/js/xdef.js");
// const XLSX = await window.fetch("~/js/xlsx.full.min.js");


// default settings
const DefaultSettings = {
	"document-zoom": 100,
	"guides-snap-sensitivity": 7,
};


const eniac = {
	init() {
		// fast references
		this.body = window.find("content .body .wrapper");
		// get settings or use default settings
		this.Settings = window.settings.getItem("settings") || DefaultSettings;
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
			case "window.paste":
				let rows = [];
				// create a two-dimensional array
				event.value.split("\n").map(row => {
					// add new "line"
					rows.push([]);
					// add "cell" values
					row.split("\t").map(col => rows[rows.length-1].push(col));
				});
				// paste 2D-array to grid
				Self.tools.table.table.paste(rows);
				break;
			case "window.keystroke":
				// forward event to tools
				return Self.tools.dispatch(event);
			case "new-file":
				// save reference to file
				let req = await defiant.shell(`fs -ur "~/sample/tables.xml"`);
				// let req = await defiant.shell(`fs -ur "~/sample/shapes.xml"`);
				// let req = await defiant.shell(`fs -ur "~/sample/images.xml"`);
				// let req = await defiant.shell(`fs -ur "~/sample/texts.xml"`);
				// let req = await defiant.shell(`fs -ur "~/sample/images.xml"`);
				Self.file = new File(req.result);
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
			// menubar events
			case "set-document-zoom":
				Self.Settings["document-zoom"] = +event.arg;
				// apply to element
				window.find(".body .wrapper").css({ zoom: +event.arg +"%" });
				break;
			case "set-guides-sensitivity":
				Self.Settings["guides-snap-sensitivity"] = +event.arg;
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
			// forwards events
			default:
				el = event.el || (event.origin && event.origin.el);
				if (el) {
					pEl = el.data("area") ? el : el.parents("[data-area]");
					name = pEl.data("area");
					if (pEl.length) {
						if (Self[name] && Self[name].dispatch) {
							return Self[name].dispatch(event);
						}
						if (Self.tools[name].dispatch) {
							return Self.tools[name].dispatch(event);
						}
					}
				}
		}
	},
	head: @import "modules/head.js",
	foot: @import "modules/foot.js",
	sidebar: @import "sidebar/sidebar.js",
	tools: @import "tools/tools.js",
	popups: @import "modules/popups.js",
};

window.exports = eniac;
