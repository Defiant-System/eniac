
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

				// sync tools sheet
				APP.tools.dispatch({ type: "sync-sheet-table", sheet });
				// focus clicked table
				Self.dispatch({ type: "focus-table", sheet });
				break;
			case "focus-table":
				if (event.sheet.isSame(APP.tools.sheet)) return;
				// show tools for table
				Self.els.tools.removeClass("hidden");
				// update sidebar
				APP.sidebar.dispatch({ type: "show-table" });
				break;
			case "blur-table":
				// update sidebar
				// APP.sidebar.dispatch({ type: "show-sheet" });
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
