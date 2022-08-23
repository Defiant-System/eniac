
// eniac.spawn

{
	init() {
		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());
	},
	dispose(event) {
		// let Spawn = event.spawn;
		// let cmd = { type: "open.file", files: [] };
		// for (let key in Spawn.data.tabs._stack) {
		// 	let tab = Spawn.data.tabs._stack[key];
		// 	cmd.files.push(tab.file.path);
		// }
		// return cmd;
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.spawn,
			Spawn = event.spawn,
			tabs,
			file,
			table,
			data,
			name,
			value,
			pEl,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.keystroke":
				// forward event to tools
				return Self.tools.dispatch(event);
			case "spawn.open":
				Spawn.data.tabs = new Tabs(Self, Spawn);
				
				// blank view
				el = Spawn.find(".blank-view");
				if (!el.find(".div").length) {
					// window.settings.clear();
		
					// get settings, if any
					let xList = $.xmlFromString(`<Recents/>`);
					let xSamples = window.bluePrint.selectSingleNode(`//Samples`);

					Self.blankView.xRecent = window.settings.getItem("recents") || xList.documentElement;
					// add recent files in to data-section
					xSamples.parentNode.append(Self.blankView.xRecent);

					// render blank view
					window.render({
						template: "blank-view",
						match: `//Data`,
						target: el,
					});
				}
				
				// temp
				// setTimeout(() => Self.dispatch({ type: "tab.new", spawn: Spawn }), 300);
				// setTimeout(() => Self.dispatch({ type: "toggle-sidebar", value: true }), 300);
				// setTimeout(() => Spawn.find(".xl-shape:nth(0)").trigger("mousedown").trigger("mouseup"), 150);
				break;
			case "spawn.init":
				Self.dispatch({ ...event, type: "tab.new" });
				break;
			case "spawn.blur":
				// forward event to all sub-objects
				Object.keys(Self)
					.filter(i => typeof Self[i].dispatch === "function")
					.map(i => Self[i].dispatch(event));
				break;
			case "spawn.focus":
				// forward event to all sub-objects
				Object.keys(Self)
					.filter(i => typeof Self[i].dispatch === "function")
					.map(i => Self[i].dispatch(event));

				// fast references
				Self.els = {
					layout: Spawn.find("layout"),
					body: Spawn.find("content .body .wrapper"),
					blankView: Spawn.find(".blank-view"),
					tools: {
						selZoom: Spawn.find(`.toolbar-selectbox_[data-menu="view-zoom"]`),
						toolFormula: Spawn.find(`.toolbar-tool_[data-arg="formula"]`),
						toolGrid: Spawn.find(`.toolbar-tool_[data-arg="grid"]`),
						toolChart: Spawn.find(`.toolbar-tool_[data-arg="chart"]`),
						toolText: Spawn.find(`.toolbar-tool_[data-click="insert-text-box"]`),
						toolShape: Spawn.find(`.toolbar-tool_[data-arg="shape"]`),
						toolImage: Spawn.find(`.toolbar-tool_[data-arg="image"]`),
						sidebar: Spawn.find(`.toolbar-tool_[data-click="toggle-sidebar"]`),
					}
				};
				break;
			case "open.file":
				(event.files || [event]).map(async fHandle => {
					let fItem = await fHandle.open({ responseType: "arrayBuffer" }),
						data = new Uint8Array(fItem.arrayBuffer),
						file = new File(fItem, data);
					// auto add first base "tab"
					Self.dispatch({ ...event, file, type: "tab.new" });
				});
				break;
			case "load-samples":
				event.samples.map(async path => {
					let fItem = await Spawn.data.tabs.openLocal(`~/sample/${path}`),
						file = new File(fItem, data);
					// auto add first base "tab"
					Self.dispatch({ ...event, file, type: "tab.new" });
				});
				break;

			// tab related events
			case "tab.new":
				// add "file" to tab row
				Spawn.data.tabs.add(event.file);
				break;
			case "tab.clicked":
				Spawn.data.tabs.focus(event.el.data("id"));
				break;
			case "tab.close":
				Spawn.data.tabs.remove(event.el.data("id"));
				break;

			// system menu events
			case "before-menu:sheet-tab":
				return Self.head.dispatch(event);

			// from menubar
			case "new-spawn":
				APP.dispatch({ type: "new", id: "spawn" });
				break;
			case "merge-all-windows":
				Spawn.siblings.map(oSpawn => {
					for (let key in oSpawn.data.tabs._stack) {
						let ref = oSpawn.data.tabs._stack[key];
						Spawn.data.tabs.merge(ref);
					}
					// close sibling spawn
					oSpawn.close();
				});
				break;
			case "close-tab":
				value = Spawn.data.tabs.length;
				if (value > 1) {
					Spawn.data.tabs._active.tabEl.find(`[sys-click]`).trigger("click");
				} else if (value === 1) {
					Self.dispatch({ ...event, type: "close-spawn" });
				}
				break;
			case "close-spawn":
				// system close window / spawn
				karaqu.shell("win -c");
				break;
			case "toggle-toolbars":
				for (name in Self.els.tools) {
					Self.els.tools[name][event.value ? "removeClass" : "addClass"]("tool-disabled_");
				}
				break;
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
	head: @import "./head.js",
	foot: @import "./foot.js",
	popups: @import "./popups.js",
	blankView: @import "./blankView.js",
	tools: @import "../tools/tools.js",
	sidebar: @import "../sidebar/sidebar.js",
}
