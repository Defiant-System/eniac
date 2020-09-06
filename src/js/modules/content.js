
{
	init() {
		// fast references
		this.els = {
			tools: window.find(".table-tools"),
			toolCols: window.find(".table-cols"),
			toolRows: window.find(".table-rows"),
			selection: window.find(".selection"),
		};

		setTimeout(() => Parser.compute(7), 100);
	},
	dispatch(event) {
		let APP = numbers,
			Self = APP.content,
			top, left, width, height,
			xNum, yNum,
			table,
			el;
		switch (event.type) {
			case "focus-table":
				table = event.el.parents("table.sheet");
				Parser.setTable(table);
				Self.els.tools.removeClass("hidden");
				break;
			case "blur-table":
				el = $(event.target);
				if (el.parents(".table-tools").length) return;
				Self.els.tools.addClass("hidden");
				break;
			case "focus-cell":
				el = $(event.target);
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
				break;
			case "blur-cell":
				break;
		}
	}
}
