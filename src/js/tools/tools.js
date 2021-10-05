
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
			el;
		switch (event.type) {
			// native events
			case "mousedown":
				// proxies mousedown event
				let el = $(event.target),
					nodeName = el.prop("nodeName"),
					name = el.attr("class") || "";
				
				if (name.startsWith("xl-") ) {
					name = name.slice(3).split(" ")[0];
				}

				switch (true) {
					// let other handlers handle it
					case el.hasClass("tool"):
						switch (el.prop("className").split(" ")[1]) {
							case "hv-resize":
							case "h-resize":
							case "v-resize": return Self.table.resizeClip(event);
							case "move": return Self.table.move(event);
						}
						break;
					case el.hasClass("body"):
						// forward event to lasso
						return Self.sheet.lasso(event);
					case el.hasClass("handle"):
						name = el.parents("[data-area]").data("area");
						Self[name].move(event);
						return;
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
						// update sidebar
						APP.sidebar.dispatch({ type: "show-sheet" });
						// blur XL element, if any
						Self.dispatch({ type: "blur-focused" });
				}
				break;
			// system events
			case "window.keystroke":
				console.log(event);
				break;
			// csutom events
			case "blur-focused":
				Self.types.map(n =>
					Self[n].dispatch({ type: `blur-${n}`, el: Self.els.body }));
				break;
		}
	},
	sheet: @import "sheet.js",
	table: @import "table.js",
	shape: @import "shape.js",
	image: @import "image.js",
	text: @import "text.js",
}
