
class Grid {
	constructor(el) {
		this._el = el;
		// selectors
		this.parts = {
			hHead: ".tbl-col-head > div:nth-child(1)",
			hBody: ".tbl-col-head > div:nth-child(2)",
			bHead: ".tbl-body > div:nth-child(1)",
			bBody: ".tbl-body > div:nth-child(2)",
			fHead: ".tbl-col-foot > div:nth-child(1)",
			fBody: ".tbl-col-foot > div:nth-child(2)",
		};
		for (let key in this.parts) {
			let selector = this.parts[key],
				el = this._el.find(selector);
			this.parts[key] = { selector, el };
		}

		// temp
		setTimeout(() => {
			this.addRow(2);
		}, 500);

		// setTimeout(() => {
		// 	this.removeRow();
		// }, 1500);
	}

	createClone(body, type) {
		let clone;
		switch (type) {
			case "td":
				clone = body.find("td:nth(0)").clone(true)[0];
				clone.innerHTML = "";
				[...clone.attributes].map(a => clone.removeAttr(a.name));
				break;
			case "tr":
				clone = body.find("tr:nth(0)").clone(true)[0];
				clone.childNodes.map(cell => {
					if (cell.nodeType === 1) {
						cell.innerHTML = "1";
						[...cell.attributes].map(a => cell.removeAttr(a.name));
					}
				});
				[...clone.attributes].map(a => clone.removeAttr(a.name));
				break;
		}
		return clone;
	}

	addRow(n) {
		let layout = this.layout,
			index = n || this.rows.length - 1,
			method = index === 0 ? "before" : "after",
			clone;

		clone = this.createClone(this.parts.bHead.el, "tr");
		this.parts.bHead.el.find(`tbody tr:nth(${index})`)[method](clone);
		
		clone = this.createClone(this.parts.bBody.el, "tr");
		this.parts.bBody.el.find(`tbody tr:nth(${index})`)[method](clone);
	}

	removeRow() {
		this.parts.bBody.el.find(`tr:last-child`).remove();
	}

	addCol() {
		
	}

	removeCol() {
		
	}

	get rows() {
		let r1, r2,
			rows = [];
		// col head rows
		r1 = this.parts.hHead.el.find("tr");
		r2 = this.parts.hBody.el.find("tr");
		if (r1.length) r1.map((row, i) => rows.push([...$("td", row), ...r2.get(i).find("td")]));
		else r2.map((row, i) => rows.push([...$("td", row)]));
		// col body rows
		r1 = this.parts.bHead.el.find("tr");
		r2 = this.parts.bBody.el.find("tr");
		if (r1.length) r1.map((row, i) => rows.push([...$("td", row), ...r2.get(i).find("td")]));
		else r2.map((row, i) => rows.push([...$("td", row)]));
		// col foot rows
		r1 = this.parts.fHead.el.find("tr");
		r2 = this.parts.fBody.el.find("tr");
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
		r1 = this.parts.hHead.el.find("tr");
		r2 = this.parts.hBody.el.find("tr");
		rows.head = r1.length || r2.length;
		// col body rows
		r1 = this.parts.bHead.el.find("tr");
		r2 = this.parts.bBody.el.find("tr");
		rows.body = r1.length || r2.length;
		cols.head = r1.length ? r1.get(0).find("td").length : 0;
		cols.body = r2.get(0).find("td").length;
		// col foot rows
		r1 = this.parts.fHead.el.find("tr");
		r2 = this.parts.fBody.el.find("tr");
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
