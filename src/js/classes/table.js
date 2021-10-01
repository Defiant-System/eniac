
class Table {
	constructor(el) {
		this._el = el;
	}

	get rows() {
		let r1, r2,
			rows = [];
		// col head rows
		r1 = this._el.find(".tbl-col-head > div:nth-child(1) tr");
		r2 = this._el.find(".tbl-col-head > div:nth-child(2) tr");
		if (r1.length) r1.map((row, i) => rows.push([...$("td", row), ...r2.get(i).find("td")]));
		else r2.map((row, i) => rows.push([...$("td", row)]));
		// col body rows
		r1 = this._el.find(".tbl-body > div:nth-child(1) tr");
		r2 = this._el.find(".tbl-body > div:nth-child(2) tr");
		if (r1.length) r1.map((row, i) => rows.push([...$("td", row), ...r2.get(i).find("td")]));
		else r2.map((row, i) => rows.push([...$("td", row)]));
		// col foot rows
		r1 = this._el.find(".tbl-col-foot > div:nth-child(1) tr");
		r2 = this._el.find(".tbl-col-foot > div:nth-child(2) tr");
		if (r1.length) r1.map((row, i) => rows.push([...$("td", row), ...r2.get(i).find("td")]));
		else r2.map((row, i) => rows.push([...$("td", row)]));

		return rows;
	}

	get cells() {
		let cells = [];
		this.rows.map(row => cells.push(...row));
		return cells;
	}

	get layout() {
		let rows = {},
			cols = {},
			r1, r2;
		// col head rows
		r1 = this._el.find(".tbl-col-head > div:nth-child(1) tr");
		r2 = this._el.find(".tbl-col-head > div:nth-child(2) tr");
		rows.head = r1.length || r2.length;
		// col body rows
		r1 = this._el.find(".tbl-body > div:nth-child(1) tr");
		r2 = this._el.find(".tbl-body > div:nth-child(2) tr");
		rows.body = r1.length || r2.length;
		cols.head = r1.length ? r1.get(0).find("td").length : 0;
		cols.body = r2.get(0).find("td").length;
		// col foot rows
		r1 = this._el.find(".tbl-col-foot > div:nth-child(1) tr");
		r2 = this._el.find(".tbl-col-foot > div:nth-child(2) tr");
		rows.foot = r1.length || r2.length;

		return { rows, cols };
	}

	get width() {
		return this._el.find(".tbl-body > div > table").reduce((acc, el) => acc + el.offsetWidth, 0);
	}

	get height() {
		return this._el.find(".tbl-root div > div:nth-child(2) > table").reduce((acc, el) => acc + el.offsetHeight, 0);
	}
	
	get dimension() {
		let rows = this.layout.rows.head + this.layout.rows.body + this.layout.rows.foot,
			cols = this.layout.cols.head + this.layout.cols.body,
			min = { rows: 0, cols: 0, height: 0, width: 0 };
		this.rows.map((tr, y) => {
			let s = false;
			tr.map((td, x) => {
				s = !!td.innerHTML;
				if (s) {
					min.width = Math.max(min.width, td.offsetLeft + td.offsetWidth);
					min.height = Math.max(min.height, td.offsetTop + td.offsetHeight);
					min.rows = Math.max(min.rows, y+1);
					min.cols = Math.max(min.cols, x+1);
				}
			});
		});
		return { rows, cols, min };
	}

	getRowCells(y) {
		return $(this.rows[y]);
	}
	
	getCoordCell(y, x) {
		return $(this.getRowCells(y)[x]);
	}
	
	getCoordRow(y) {
		let found = [];
		if (this.layout.cols.head > 0) found.push(this.getRowCells(y)[0]);
		if (this.layout.cols.body > 0) found.push(this.getRowCells(y)[this.layout.cols.head]);
		return $(found);
	}
	
	getCoordCol(x) {
	let found = [];
		if (this.layout.rows.head > 0) found.push(this.getRowCells(0)[x]);
		if (this.layout.rows.body > 0) found.push(this.getRowCells(this.layout.rows.head)[x]);
		if (this.layout.rows.foot > 0) found.push(this.getRowCells(this.layout.rows.head + this.layout.rows.body)[x]);
		return $(found);
	}
	
	getCoord(td) {
		for (let y=0, yl=this.rows.length; y<yl; y++) {
			let row = this.rows[y];
			for (let x=0, xl=row.length; x<xl; x++) {
				if (row[x] === td) return [y, x];
			}
		}
	}
	
	getOffset(td) {
		let rect1 = td.getBoundingClientRect(),
			rect2 = this._el[0].getBoundingClientRect(),
			top = Math.floor(rect1.top - rect2.top),
			left = Math.floor(rect1.left - rect2.left),
			width = rect1.width,
			height = rect1.height;
		return { top, left, width, height };
	}
}
