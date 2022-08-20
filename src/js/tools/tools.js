
// eniac.spawn.tools

{
	init() {
		// default tools
		this.active = "sheet";
		this.types = ["table", "shape", "line", "image", "text"];
		this.shapeTypes = ["circle", "ellipse", "rect", "polygon", "polyline", "path", "line", "bezier", "image"];
		
		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());

	},
	sheet: @import "sheet.js",
	formula: @import "formula.js",
	chart: @import "chart.js",
	table: @import "table.js",
	shape: @import "shape.js",
	image: @import "image.js",
	text: @import "text.js",
	line: @import "line.js",
	dispatch(event) {
		let APP = eniac,
			Self = APP.spawn.tools,
			Spawn = event.spawn || karaqu.getSpawn(event.target),
			isEditable,
			selected,
			value,
			name,
			el;
		switch (event.type) {
			// system events
			case "spawn.blur":
				// unbind event handlers
				Self.els.body.off("mousedown", Self.dispatch);
				// reset fast references
				Self.els = {};
				break;
			case "spawn.focus":
				// fast references
				Self.els = {
					root: Spawn.find(".shape-tools"),
					body: Spawn.find("content > div.body"),
				};
				// forward event to sub-objects
				Object.keys(Self)
					.filter(i => typeof Self[i].dispatch === "function")
					.map(i => Self[i].dispatch(event));

				// bind event handlers
				Self.els.body.on("mousedown", Self.dispatch);
				break;
			case "window.keystroke":
				// get selected items
				selected = event.selected || Self.els.body.find(".wrapper > .selected");
				if (!selected.length) selected = Self[Self.active][Self.active];

				isEditable = event.target && (event.target.nodeName === "INPUT" || event.target.contentEditable);

				//console.log( Self.table.table.selected.anchor.el.html() );
				if (event.target) {
					el = $(event.target);
					switch (event.char) {
						case "esc":
							el = el.parents(Guides.selector);
							if (isEditable && el.length) {
								// blur XL element, if any
								Self[Self.active].dispatch({ type: "exit-edit-mode", el });
								// blur XL element, if any
								Self.dispatch({ type: "blur-focused" });
							}
							break;
						case "return":
							if (isEditable) {
								// prevent default
								event.preventDefault();
								// blur XL element, if any
								Self[Self.active].dispatch({ type: "exit-edit-mode", el });
								return false;
							}
							break;
					}
					// notify table tools
					Self[Self.active].dispatch({ type: "query-command-state" });
					return;
				}
				if (selected && !selected.length && ["sheet", "table"].includes(Self.active)) {
					// forward event to table tools
					return Self[Self.active].dispatch(event);
				}
				// exit no element is selected
				if (!selected) return;

				// shiftKey => 10px movement
				value = event.shiftKey ? 10 : 1;
				// iterate selected element
				selected.map(item => {
					let el = $(item),
						[a, name] = el.prop("className").split(" ")[0].split("-"),
						// name = Self.els.root.data("area"),
						data = {},
						move;
					switch (event.char) {
						case "esc":
							// blur XL element, if any
							return Self.dispatch({ type: "blur-focused" });
						case "up":
						case "down":
							move = event.char === "up" ? -1 : 1;
							data.top = Math.max(parseInt(el.css("top"), 10) + (move * value), 3);
							break;
						case "left":
						case "right":
							move = event.char === "left" ? -1 : 1;
							data.left = Math.max(parseInt(el.css("left"), 10) + (move * value), 3);
							break;
					}
					// move element
					el.css(data);
					if (selected.length === 1) {
						// focus shape
						Self[name].dispatch({ type: `focus-${name}`, el });
					}
				});
				break;
			// native events
			case "mousedown":
				// proxies mousedown event
				el = $(event.target);
				name = el.attr("class") || "";
				if (name.startsWith("xl-") ) {
					name = name.slice(3).split(" ")[0];
				}
				let nodeName = el.prop("nodeName");

				switch (true) {
					case event.button === 2:
						// TODO: handle context menu
						karaqu.menu({
							el: APP.tools.table.gridTools._selection,
							menu: "cell-selection",
							top: event.clientY,
							left: event.clientX,
						});
						break;
					// let other handlers handle it
					case el.hasClass("tool"):
						switch (el.prop("className").split(" ")[1]) {
							case "hv-resize":
							case "h-resize":
							case "v-resize":
								return Self.table.resizeClip(event);
							case "move":
								return Self.table.move(event);
						}
						break;
					case el.hasClass("tbl-title"):
					case el.hasClass("tbl-caption"):
						// blur XL element, if any
						Self[Self.active].dispatch({ type: "exit-edit-mode" });
						Self[Self.active].dispatch({ type: `blur-${Self.active}` });
						// reference of active tool
						Self.active = "table";
						// focus table
						Self[Self.active].dispatch({ type: `focus-${Self.active}`, table: el.parents(".xl-table") });
						setTimeout(() => {
							// special UI for title & caption
							name = el.prop("className").split(" ").find(n => n.startsWith("tbl-")).split("tbl-")[1];
							APP.spawn.sidebar.els.tbl.addClass(`show-${name}-tab`);
							// auto switch to tab
							APP.spawn.sidebar.els.tbl.find(`.sidebar-head .${name}-tab`).trigger("click");
						});
						break;
					case el.hasClass("body"):
						// reference of active tool
						Self.active = "sheet";
						// blur XL element, if any
						Self.dispatch({ type: "blur-focused" });
						// focus shape
						Self.sheet.dispatch({ type: `focus-sheet`, el });
						// forward event to lasso
						return Self.sheet.lasso(event);
					case el.hasClass("img-wrapper"):
						return Self.image.move(event);
					case el.hasClass("handle"):
						switch (el.prop("className").split(" ")[1]) {
							case "top-left":
							case "bottom-right":
								return Self.table.selectionHandles(event);
							default:
								name = el.parents("[data-area]").data("area");
								return Self[name].move(event);
						}
						break;
					case nodeName === "S":
						return Self.table.resizeColRow(event);
					case nodeName === "TD":
						// if table-tool related; let it be handled by "others"
						if (el.parents(".table-tool").length) return;
						// reference of active tool
						Self.active = "table";
						// blur XL element, if any
						Self.dispatch({ type: "blur-focused" });
						// auto switch to first tab
						APP.spawn.sidebar.els.tbl.find(`.sidebar-head span`).get(0).trigger("click");
						// proxy event to "selection resize"
						return Self.table.resizeSelection(event);
					case Self.types.includes(name):
						// reset tools
						Self.els.root
							.removeClass(Self.types.map(e => `is-${e}`).join(" "))
							.removeClass(Self.shapeTypes.map(e => `is-${e}`).join(" "));
						if (name === "shape" && Self.shape.isLine(el)) {
							name = "line";
						}
						// reference of active tool
						Self.active = name;
						// blur XL element, if any
						Self.dispatch({ type: "blur-focused" });
						// switch context for Self
						Self.els.root.data({ "area": name });
						// focus shape
						Self[name].dispatch({ type: `focus-${name}`, el });
						// update sidebar
						APP.spawn.sidebar.dispatch({ type: `show-${name}` });
						// trigger "move" mousedown event
						Self[name].move(event);
						break;
					case el[0].isContentEditable:
						Self[Self.active].dispatch({
							type: "enter-edit-mode",
							el: el.parents(Guides.selector)
						});
						break;
					default:
						// reference of active tool
						Self.active = "sheet";
						// update sidebar
						APP.spawn.sidebar.dispatch({ type: "show-sheet", spawn: Spawn });
						// blur XL element, if any
						// Self.dispatch({ type: "blur-focused", spawn: Spawn });
				}
				break;
			// csutom events
			case "reset-tools":
				Self.active = false;
				/* falls through */
			case "blur-focused":
				// make elements "unselected"
				Self.els.body.find(".wrapper > .selected").removeClass("selected");
				// notify all sub-tools
				Self.types.map(n => {
					if (Self.active === n) return;
					Self[n].dispatch({ type: `blur-${n}`, el: Self.els.body })
				});
				break;
		}
	}
}
