
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
		this.els.layout.on("mousedown", ".xl-table td", this.resize);
	},
	dispatch(event) {
		let APP = eniac,
			Tools = APP.tools.table,
			Self = Cursor,
			sheet, table,
			anchor, offset,
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
				sheet = anchor.parents(".xl-table");
				if (anchor.prop("nodeName") !== "TD") anchor = anchor.parents("td");

				// focus clicked table
				Self.dispatch({ type: "focus-table", sheet });
				// make column + row active
				[yNum, xNum] = Tools.sheet.grid.getCoord(anchor[0]);
				Tools.dispatch({ type: "select-coords", yNum: [yNum], xNum: [xNum] });
				// UI select element
				Self.dispatch({ ...event, anchor, type: "select-cell" });
				break;
			case "focus-table":
				sheet = event.sheet;
				if (Tools.sheet && sheet.isSame(Tools.sheet.el)) return;
				// blur XL element, if any
				APP.tools.shape.dispatch({ type: "blur-focused" });
				// sync tools sheet
				Tools.dispatch({ type: "sync-sheet-table", sheet });
				// show tools for table
				Self.els.tools.removeClass("hidden");
				// update sidebar
				APP.sidebar.dispatch({ ...event, type: "show-table" });
				break;
			case "blur-cell":
				// reset reference to cell
				Self.anchor = false;
				break;
			case "blur-table":
				break;
			case "re-sync-selection":
			case "select-cell":
				anchor = event.anchor || Self.anchor;
				table = anchor.parents(".tbl-root:first");
				offset = Self.getOffset(anchor[0], table[0]);
				Self.els.root.addClass("show").css(offset);

				// save anchor reference
				Self.anchor = anchor;
				break;
		}
	},
	getOffset(el, pEl) {
		let rect1 = el.getBoundingClientRect(),
			rect2 = pEl.getBoundingClientRect(),
			top = Math.floor(rect1.top - rect2.top) + pEl.offsetTop - 2,
			left = Math.floor(rect1.left - rect2.left) + pEl.offsetLeft - 2,
			width = rect1.width + 5,
			height = rect1.height + 5;
		return { top, left, width, height };
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
