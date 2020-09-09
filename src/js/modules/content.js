
{
	init() {
		// fast references
		this.els = {
			tools: window.find(".table-tools"),
			toolCols: window.find(".table-cols"),
			toolRows: window.find(".table-rows"),
			selection: window.find(".selection"),
			selText: window.find(".selection textarea"),
		};

		setTimeout(() => {
			// temp
			window.find("table.sheet td").get(5).trigger("click");
		//	Parser.compute(7);
		}, 300);

		// setTimeout(() => {
		// 	numbers.selection.dispatch({ type: "move-right" });
		// }, 1000);
	},
	dispatch(event) {
		let APP = numbers,
			Self = APP.content,
			top, left, width, height,
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

				if (!Parser.table) return;
				// auto blur active cell
				Self.dispatch({ type: "blur-cell" });

				Parser.reset();

				Self.els.tools.addClass("hidden");
				break;
			case "focus-cell":
				// auto blur active cell
				Self.dispatch({ type: "blur-cell" });

				el = $(event.target).addClass("active");
				xNum = el.index();
				yNum = el.parent().index();

				// focus table
				Self.dispatch({ type: "focus-table", el });
				// make column + row active
				Self.els.toolCols.find(".active").removeClass("active");
				Self.els.toolCols.find("td").get(xNum).addClass("active");
				Self.els.toolRows.find(".active").removeClass("active");
				Self.els.toolRows.find("tr").get(yNum).addClass("active");

				top = (event.target.offsetTop - 2) +"px";
				left = (event.target.offsetLeft - 2) +"px";
				width = (event.target.offsetWidth + 5) +"px";
				height = (event.target.offsetHeight + 5) +"px";

				Self.els.selection.css({ top, left, width, height, });
				Self.els.selText.val(el.text()).focus();

				// remember active cell
				Self.activeEl = el;
				break;
			case "blur-cell":
				if (!Self.activeEl) return;

				Self.activeEl.text(Self.els.selText.val());
				Self.activeEl.removeClass("active");

				Self.els.selText.val("");

				// check cell and compute if needed
				Parser.checkCell(Self.activeEl);

				// delete reference to cell
				delete Self.activeEl;
				break;
		}
	}
}
