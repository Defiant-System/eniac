
// eniac.content

{
	init() {
		// fast references
		this.els = {
			tools: window.find(".table-tools"),
			selection: window.find(".selection"),
			selText: window.find(".selection textarea"),
		};

		// setTimeout(() => {
		// 	// temp
		// 	window.find("table.sheet td").get(5).trigger("click");
		// //	Parser.compute(7);
		// }, 300);

		// setTimeout(() => {
		// 	eniac.selection.dispatch({ type: "move-right" });
		// }, 1000);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.content,
			xNum, yNum,
			table,
			val,
			el;
		switch (event.type) {
			// custom events
			case "focus-table":
				// set table for parser
				table = event.el.parents("table.sheet");
				Parser.setTable(table);
				// show tools for table
				Self.els.tools.removeClass("hidden");
				break;
			case "blur-table":
				if (event.target) {
					// don't blur table, if event originated in tools
					if ($(event.target).parents(".table-tools").length) return;
				}
				// if no table in Parser, exit
				if (!Parser.table) return;
				// auto blur active cell
				Self.dispatch({ type: "blur-cell" });
				// reset parser
				Parser.reset();
				// hide tools
				Self.els.tools.addClass("hidden");
				break;
			case "focus-cell":
				// auto blur active cell
				Self.dispatch({ type: "blur-cell" });
				// focus table
				el = $(event.target).addClass("active");
				// sync tools table
				APP.tools.dispatch({ type: "sync-sheet-table", table: el.parents("table.sheet") });
				// focus clicked table
				Self.dispatch({ type: "focus-table", el });

				xNum = el.index();
				yNum = el.parent().index();

				// make column + row active
				APP.tools.dispatch({ type: "select-coord", yNum, xNum });
				// selection element
				APP.selection.dispatch({ ...event, el, type: "select-cell" });

				// remember active cell
				Self.activeEl = el;
				break;
			case "blur-cell":
				if (!Self.activeEl) return;

				let v = Self.els.selText.val();
				Self.activeEl.attr({ v }).text(v);
				Self.activeEl.removeClass("active");

				Self.els.selText.val("");

				// check cell and compute if needed
				Parser.checkCell(Self.activeEl);

				// delete reference to cell
				Self.activeEl = false;
				break;
		}
	}
}
