
const Cursor = {
	init() {
		// fast references
		let root = window.find(".selection");
		this.els = {
			root,
			doc: $(document),
			layout: window.find("layout"),
			tools: window.find(".table-tools"),
		};

		// bind event handlers
		this.els.layout.on("mousedown", ".sheet td", this.resize);
	},
	dispatch(event) {
		let APP = eniac,
			Self = Cursor,
			sheet,
			anchor,
			xNum, yNum,
			el;
		switch (event.type) {
			// system events
			case "window.keystroke":
				break;
			// custom events
			case "focus-cell":
				// anchor cell
				anchor = $(event.anchor);
				sheet = anchor.parents(".sheet");
				if (anchor.prop("nodeName") !== "TD") anchor = anchor.parents("td");

				// focus clicked table
				Self.dispatch({ type: "focus-table", sheet });
				// sync tools sheet
				APP.tools.dispatch({ type: "sync-sheet-table", sheet });
				// make column + row active
				[yNum, xNum] = APP.tools.sheet.grid.getCoord(anchor[0]);
				APP.tools.dispatch({ type: "select-coords", yNum, xNum });
				break;
			case "focus-table":
				if (APP.tools.sheet && event.sheet.isSame(APP.tools.sheet.el)) return;

				// show tools for table
				Self.els.tools.removeClass("hidden");
				// update sidebar
				APP.sidebar.dispatch({ ...event, type: "show-table" });
				break;
			case "blur-table":
				if (event.el.hasClass("body")) {
					// update sidebar
					APP.sidebar.dispatch({ type: "show-sheet" });
					// hide table tools
					APP.tools.dispatch({ type: "reset-tools" });
				}
				break;
		}
	},
	resize(event) {
		let APP = eniac,
			Self = Cursor,
			Drag = Self.drag,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				let cell = $(event.target);

				// set table for tools
				Self.dispatch({ type: "focus-cell", anchor: cell });
				break;
		}
	}
};
