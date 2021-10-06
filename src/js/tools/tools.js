
// eniac.tools

{
	init() {
		// fast references
		this.els = {
			root: window.find(".shape-tools"),
			body: window.find("content > div.body"),
		};

		// default tools
		this.active = "sheet";
		this.types = ["table", "shape", "image", "text"];

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());

		// bind event handlers
		window.find("content > div.body").on("mousedown", this.dispatch);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools,
			selected,
			value,
			name,
			el;
		switch (event.type) {
			// system events
			case "window.keystroke":
				// get selected items
				selected = event.selected || Self.els.body.find(".wrapper > .selected");
				if (!selected.length) selected = Self[Self.active][Self.active];

				if (selected && !selected.length && ["sheet", "table"].includes(Self.active)) {
					// forward event to table tools
					return Self[Self.active].dispatch(event);
				}
				// shiftKey => 10px movement
				value = event.shiftKey ? 10 : 1;
				// iterate selected element
				selected.map(item => {
					let el = $(item),
						[a, name] = el.prop("className").split(" ")[0].split("-"),
						data = {},
						move;
					switch (event.char) {
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
					case el.hasClass("body"):
						// reference of active tool
						Self.active = "sheet";
						// blur XL element, if any
						Self.dispatch({ type: "blur-focused" });
						// focus shape
						Self.sheet.dispatch({ type: `focus-sheet`, el });
						// forward event to lasso
						return Self.sheet.lasso(event);
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
						// proxy event to "selection resize"
						return Self.table.resizeSelection(event);
					case Self.types.includes(name):
						// reference of active tool
						Self.active = name;
						// blur XL element, if any
						Self.dispatch({ type: "blur-focused" });
						// switch context for Self
						Self.els.root.data({ "area": name });
						// focus shape
						Self[name].dispatch({ type: `focus-${name}`, el });
						// update sidebar
						APP.sidebar.dispatch({ type: `show-${name}` });
						// trigger "move" mousedown event
						Self[name].move(event);
						break;
					default:
						// reference of active tool
						Self.active = "sheet";
						// update sidebar
						APP.sidebar.dispatch({ type: "show-sheet" });
						// blur XL element, if any
						Self.dispatch({ type: "blur-focused" });
				}
				break;
			// csutom events
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
	},
	sheet: @import "sheet.js",
	table: @import "table.js",
	shape: @import "shape.js",
	image: @import "image.js",
	text: @import "text.js",
}
