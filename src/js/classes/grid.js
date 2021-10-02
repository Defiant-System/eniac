
class Grid {
	constructor(el) {
		this._el = el;
		// selectors
		this.selector = {
			hHead: ".tbl-col-head > div:nth-child(1)",
			hBody: ".tbl-col-head > div:nth-child(2)",
			bHead: ".tbl-body > div:nth-child(1)",
			bBody: ".tbl-body > div:nth-child(2)",
			fHead: ".tbl-col-foot > div:nth-child(1)",
			fBody: ".tbl-col-foot > div:nth-child(2)",
		};
		// prepare clones
		this.createClones("td");

		// temp
		setTimeout(() => {
			this.addRow();
		}, 500);

		// setTimeout(() => {
		// 	this.removeRow();
		// }, 1500);
	}

	createClones(type) {
		switch (type) {
			case "td":
				this._td = this._el.find("td:nth(0)").clone(true)[0];
				this._td.innerHTML = "";
				[...this._td.attributes].map(a => this._td.removeAttr(a.name));
				/* falls through */
			case "tr":
				this._tr = this._el.find("tr:nth(0)").clone(true)[0];
				this._tr.childNodes.map(cell => {
					if (cell.nodeType === 1) {
						cell.innerHTML = "1";
						[...cell.attributes].map(a => cell.removeAttr(a.name));
					}
				});
				[...this._tr.attributes].map(a => this._tr.removeAttr(a.name));
				break;
		}
	}

	addRow(n) {
		let layout = this.layout,
			index = n || this.rows.length - 1,
			method = index === 0 ? "before" : "after";
		console.log(layout);
		this._el.find(`${this.selector.bHead} tbody tr:nth(${index})`)[method](this._tr);
		this._el.find(`${this.selector.bBody} tbody tr:nth(${index})`)[method](this._tr);
	}

	removeRow() {
		this._el.find(`${this.selector.bBody} tr:last-child`).remove();
	}

	addCol() {
		
	}

	removeCol() {
		
	}

	get rows() {
		let r1, r2,
			rows = [];
		// col head rows
		r1 = this._el.find(`${this.selector.hHead} tr`);
		r2 = this._el.find(`${this.selector.hBody} tr`);
		if (r1.length) r1.map((row, i) => rows.push([...$("td", row), ...r2.get(i).find("td")]));
		else r2.map((row, i) => rows.push([...$("td", row)]));
		// col body rows
		r1 = this._el.find(`${this.selector.bHead} tr`);
		r2 = this._el.find(`${this.selector.bBody} tr`);
		if (r1.length) r1.map((row, i) => rows.push([...$("td", row), ...r2.get(i).find("td")]));
		else r2.map((row, i) => rows.push([...$("td", row)]));
		// col foot rows
		r1 = this._el.find(`${this.selector.fHead} tr`);
		r2 = this._el.find(`${this.selector.fBody} tr`);
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
		r1 = this._el.find(`${this.selector.hHead} tr`);
		r2 = this._el.find(`${this.selector.hBody} tr`);
		rows.head = r1.length || r2.length;
		// col body rows
		r1 = this._el.find(`${this.selector.bHead} tr`);
		r2 = this._el.find(`${this.selector.bBody} tr`);
		rows.body = r1.length || r2.length;
		cols.head = r1.length ? r1.get(0).find("td").length : 0;
		cols.body = r2.get(0).find("td").length;
		// col foot rows
		r1 = this._el.find(`${this.selector.fHead} tr`);
		r2 = this._el.find(`${this.selector.fBody} tr`);
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
		let layout = this.layout,
			rows = layout.rows.head + layout.rows.body + layout.rows.foot,
			cols = layout.cols.head + layout.cols.body,
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
		let layout = this.layout,
			found = [];
		if (layout.cols.head > 0) found.push(this.getRowCells(y)[0]);
		if (layout.cols.body > 0) found.push(this.getRowCells(y)[layout.cols.head]);
		return $(found);
	}
	
	getCoordCol(x) {
		let layout = this.layout,
			found = [];
		if (layout.rows.head > 0) found.push(this.getRowCells(0)[x]);
		if (layout.rows.body > 0) found.push(this.getRowCells(layout.rows.head)[x]);
		if (layout.rows.foot > 0) found.push(this.getRowCells(layout.rows.head + layout.rows.body)[x]);
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
