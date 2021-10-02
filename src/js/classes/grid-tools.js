
class GridTools {
	constructor() {
		this._el = window.find(".table-tools");
		this._cols = this._el.find(".table-cols");
		this._rows = this._el.find(".table-rows");
	}

	syncDim(table) {
		let top = table.prop("offsetTop"),
			left = table.prop("offsetLeft"),
			width = table.prop("offsetWidth"),
			height = table.prop("offsetHeight");
		this._el.css({ top, left, width, height });
		// adjust for table with "title"
		let _title = table.find(".table-title");
		top = _title.prop("offsetHeight") + parseInt(_title.css("margin-bottom"), 10);
		top = isNaN(top) ? 0 : top;
		this._rows.css({ "--rows-top": `${top}px` });

		// toggle between "clip" resizers
		this._el.toggleClass("clip", !table.hasClass("clipped"));
	}

	syncRowsCols(table) {
		let cNames = [],
			rNames = [],
			toolCols = this._cols.find("> div").html(""),
			toolRows = this._rows.find("> div").html("");

		// tools columns
		let cols = table.find(".tbl-col-head > div");
		if (!cols.length || !cols.find("tr:nth(0) td").length) {
			cols = table.find(".tbl-body > div");
		}
		// populate tool columns
		cols.map((el, i) => {
			let str = $("tr:nth(0) td", el).map(col => {
					let rect = col.getBoundingClientRect();
					return `<td style="width: ${Math.round(rect.width)}px;"><s></s></td>`;
				});
			if (i === 0 && str.length) cNames.push("has-col-head");
			let width = Math.floor(el.firstChild.getBoundingClientRect().width);
			str = `<table style="width: ${width}px;"><tr>${str.join("")}</tr></table>`;
			toolCols.get(i).html(str);
		});
		// reset tool columns UI
		this._cols.removeClass("has-col-head").addClass(cNames.join(" "));

		// tools rows
		let rows = table.find(".tbl-root > div > div:nth-child(1)");
		if (!rows.find("tr").length) {
			rows = table.find(".tbl-root > div > div:nth-child(2)");
		}
		// populate tool rows
		rows.map((el, i) => {
			let str = $("tr", el).map(row =>
						`<tr style="height: ${row.offsetHeight}px;"><td><s></s></td></tr>`);
			if (i === 0 && str.length) rNames.push("has-row-head");
			if (i === 2 && str.length) rNames.push("has-row-foot");
			toolRows.get(i).html(`<table>${str.join("")}</table>`);
		});
		// reset tool columns UI
		this._rows.removeClass("has-row-head has-row-foot").addClass(rNames.join(" "));
	}

	addRow(n, where="after") {
		
	}

	removeRow(n) {
		
	}

	addCol(n, where="after") {
		
	}

	removeCol(n) {
		
	}

	get rows() {
		return [...this._el.find(".table-rows td")];
	}
	get cols() {
		let colEl = this._el.find(".table-cols"),
			r1 = colEl.find("> div:nth-child(1) tr"),
			r2 = colEl.find("> div:nth-child(2) tr"),
			cols = [];
		if (r1.length) r1.map((row, i) => cols.push(...$("td", row), ...r2.get(i).find("td")));
		else r2.map((row, i) => cols.push(...$("td", row)));
		return cols;
	}
	
	getRow(y) {
		return $(this.rows[y]);
	}

	getCol(x) {
		return $(this.cols[x]);
	}
	
	getRowIndex(td) {
		return this.rows.indexOf(td);
	}

	getColIndex(td) {
		return this.cols.indexOf(td);
	}
}
