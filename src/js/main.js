
@import "../../public/js/bundle.min.js"

@import "classes/file.js"
@import "modules/files.js"


// defiant adapted xlsx library
const XLSX = await window.fetch("~/js/xdef.js");

// default settings
const DefaultSettings = {
	"document-zoom": 100,
	"guides-snap-sensitivity": 7,
};


const eniac = {
	init() {
		// fast references
		this.els = {
			layout: window.find("layout"),
			body: window.find("content .body .wrapper"),
			blankView: window.find(".blank-view"),
			tools: {
				sidebar: window.find(`.toolbar-tool_[data-click="toggle-sidebar"]`),
			}
		};
		// get settings or use default settings
		this.Settings = window.settings.getItem("settings") || DefaultSettings;
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
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.init":
				// reset app by default - show initial view
				Self.dispatch({ type: "reset-app" });
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
			case "open.file":
				event.open({ responseType: "arrayBuffer" })
					.then(file => {
						let data = new Uint8Array(file.arrayBuffer);
						
						// save reference to file
						Files.activeFile = new File(file, data);

						// setTimeout(() => Self.dispatch({ type: "save-file-as" }), 500);
					});
				break;
			// custom events
			case "prepare-file":
				// add file to "recent" list
				Self.blankView.dispatch({ ...event, type: "add-recent-file" });
				// set up workspace
				Self.dispatch({ ...event, type: "setup-workspace" });
				break;
			case "setup-workspace":
				// show blank view
				Self.els.layout.removeClass("show-blank-view");
				// open file + prepare workspace
				Files.open(event.file, event);
				break;
			case "reset-app":
				// render blank view
				window.render({
					template: "blank-view",
					match: `//Data`,
					target: Self.els.blankView
				});
				// show blank view
				Self.els.layout.addClass("show-blank-view");
				break;
			case "open-file":
				window.dialog.open({
					xlsx: item => Self.dispatch(item),
					xml: item => Self.dispatch(item),
				});
				break;
			case "save-file":
				console.log("todo");
				break;
			case "save-file-as":
				file = Files.activeFile;
				// pass on available file types
				window.dialog.saveAs(file._file, {
					xlsx: () => file.toBlob("xlsx"),
					xml: () => file.toBlob("xml"),
				});
				break;
			case "close-file":
				file = Files.activeFile;
				// open file + prepare workspace
				Files.close();
				// show blank view
				Self.els.layout.addClass("show-blank-view");
				// hide sidebar, if needed
				if (Self.els.tools.sidebar.hasClass("tool-active_")) {
					Self.els.tools.sidebar.trigger("click");
				}
				break;
			case "open-help":
				defiant.shell("fs -u '~/help/index.md'");
				break;
			case "toggle-toolbars":
				// console.log(event);
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
			case "popup-view-options":
			case "insert-text-box":
				return Self.popups.dispatch(event);
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
	blankView: @import "modules/blankView.js",
	sidebar: @import "sidebar/sidebar.js",
	tools: @import "tools/tools.js",
	popups: @import "modules/popups.js",
};

window.exports = eniac;
