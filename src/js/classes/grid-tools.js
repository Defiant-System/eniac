
class GridTools {
	constructor() {
		this._el = window.find(".table-tools");
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
