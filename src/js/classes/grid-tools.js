
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
	}

	addRow() {
		
	}

	removeRow() {
		
	}

	addCol() {
		
	}

	removeCol() {
		
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
