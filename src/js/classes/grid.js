
class Grid {
	constructor(el, tools) {
		this._el = el;
		this._tools = tools;
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
		// setTimeout(() => { this.addCol(); }, 500);
		// setTimeout(() => { this.removeCol(2); }, 1500);
		// setTimeout(() => { this.addRow(); }, 500);
		// setTimeout(() => { this.removeRow(2); }, 1500);
	}

	createClone(body, type) {
		let clone;
		switch (type) {
			case "td":
				clone = body.find("td:nth(0)").clone(true)[0];
				clone.innerHTML = "";
				[...clone.attributes].map(a => clone.removeAttribute(a.name));
				break;
			case "tr":
				clone = body.find("tr:nth(0)").clone(true)[0];
				clone.childNodes.map(cell => {
					if (cell.nodeType === 1) {
						cell.innerHTML = "";
						[...cell.attributes].map(a => cell.removeAttribute(a.name));
					}
				});
				[...clone.attributes].map(a => clone.removeAttribute(a.name));
				break;
		}
		return clone;
	}

	addRow(n, where="after") {
		let cols = this.layout.cols,
			rows = this.layout.rows,
			i = n !== undefined ? n : rows.head + rows.body - 1,
			p, part, clone;
		// adjust index and find out "position"
		switch (true) {
			case (i < rows.head): p = "h"; break;
			case (i >= rows.head + rows.body): p = "f"; i -= rows.head + rows.body; break;
			default: p = "b"; i -= rows.head;
		}
		if (cols.head) {
			part = this.parts[`${p}Head`];
			clone = this.createClone(part.el, "tr");
			part.el.find(`tbody tr:nth(${i})`)[where](clone);
		}
		part = this.parts[`${p}Body`];
		clone = this.createClone(part.el, "tr");
		part.el.find(`tbody tr:nth(${i})`)[where](clone);
		// sync grid tools
		this._tools.addRow(n, where);
	}

	removeRow(n) {
		let rows = this.layout.rows,
			i = n !== undefined ? n : rows.head + rows.body - 1,
			p;
		// adjust index and find out "position"
		switch (true) {
			case (i < rows.head): p = "h"; break;
			case (i >= rows.head + rows.body): p = "f"; i -= rows.head + rows.body; break;
			default: p = "b"; i -= rows.head;
		}
		this.parts[`${p}Head`].el.find(`tr:nth(${i})`).remove();
		this.parts[`${p}Body`].el.find(`tr:nth(${i})`).remove();
		// sync grid tools
		this._tools.removeRow(n);
	}

	addCol(n, where="after") {
		let cols = this.layout.cols,
			rows = this.layout.rows,
			i = n !== undefined ? n : cols.head + cols.body - 1,
			clone = this.createClone(this.parts.bBody.el, "td"),
			p, part;
		// adjust index and find out "position"
		switch (true) {
			case (i < cols.head): p = "Head"; break;
			default: p = "Body"; i -= cols.head;
		}
		if (rows.head) {
			this.parts[`h${p}`].el.find(`tr td:nth-child(${i+1})`).map(td => td[where](clone.cloneNode(true)));
		}
		if (rows.foot) {
			this.parts[`f${p}`].el.find(`tr td:nth-child(${i+1})`).map(td => td[where](clone.cloneNode(true)));
		}
		this.parts[`b${p}`].el.find(`tr td:nth-child(${i+1})`).map(td => td[where](clone.cloneNode(true)));
		// sync grid tools
		this._tools.addCol(n, where);
	}

	removeCol(n) {
		let cols = this.layout.cols,
			i = n !== undefined ? n : cols.head + cols.body - 1,
			p;
		// adjust index and find out "position"
		switch (true) {
			case (i < cols.head): p = "Head"; break;
			default: p = "Body"; i -= cols.head;
		}
		this.parts[`h${p}`].el.find(`tr td:nth-child(${i+1})`).remove();
		this.parts[`b${p}`].el.find(`tr td:nth-child(${i+1})`).remove();
		this.parts[`f${p}`].el.find(`tr td:nth-child(${i+1})`).remove();
		// sync grid tools
		this._tools.removeCol(n);
	}

	unselect() {
		// remove reference to selected
		this._selected = false;
		// UI update
		this._tools._selection
			.removeClass("show")
			.css({
				top: 1e5,
				left: 1e5,
				width: -1e2,
				height: -1e2,
			});
		// sync grid tools
		this._tools.unselect();
	}

	select(data) {
		let cols = data.xNum.length ? data.xNum : [data.xNum],
			rows = data.yNum.length ? data.yNum : [data.yNum],
			_rows = this.rows,
			// anchor cell
			anchor = {},
			// selection box dimensions
			css = {
				top: 1e5,
				left: 1e5,
				width: -1e2,
				height: -1e2,
			};
		// clear selected cell className(s)
		this._el.find(".anchor, .selected").removeClass("anchor selected");

		// set selected cell className(s)
		rows.map(y => {
			cols.map(x => {
				let td = _rows[y][x],
					offset = this.getOffset(td),
					top = offset.top - 2,
					left = offset.left - 2,
					height = top + offset.height + 5,
					width = left + offset.width + 5,
					el = $(td);

				el.addClass("selected");
				if (css.top > top) css.top = top;
				if (css.left > left) css.left = left;
				if (css.width < width) css.width = width;
				if (css.height < height) css.height = height;
				// if (y === Table.rows.length-1) css.height -= 1;
				if (!anchor.el) {
					anchor = { el, y, x };
				}
			});
		});
		// UI indicate anchor cell
		anchor.el.addClass("anchor");

		// adjust width + height down
		css.height -= css.top;
		css.width -= css.left;
		this._tools._selection.addClass("show").css(css);

		// save reference data
		this._selected = { xNum: cols, yNum: rows, anchor };
		// sync grid tools
		this._tools.select(cols, rows);
	}

	get selected() {
		return this._selected;
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
