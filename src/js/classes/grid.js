
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
		// setTimeout(() => { this.addCol(1); }, 500);
		// setTimeout(() => { this.removeCol(2); }, 1500);
		// setTimeout(() => { this.addRow(1); }, 500);
		// setTimeout(() => { this.removeRow(2); }, 1500);

		// setTimeout(() => {
		// 	let data = {
		// 			yNum: [2,3,4,5],
		// 			xNum: [2,3],
		// 			anchor: { y: 5, x: 2 }

		// 			// yNum: [6,7,8],
		// 			// xNum: [4,5],
		// 			// anchor: { y: 8, x: 5 }
		// 		};
		// 	this.select(data);
		// }, 500);
	}

	paste(rows) {
		let anchor = this.selected ? this.selected.anchor : { y: 0, x: 0 },
			yNum = [],
			xNum = [],
			gridRows = this.rows;
		// make sure there is enough rows
		rows.map((row, y) => {
			if (!gridRows[anchor.y + y]) {
				this.addRow(anchor.y);
				// refresh reference to rows
				gridRows = this.rows;
			}
		});
		// actual paste
		rows.map((row, y) => {
			row.map((cell, x) => {
				let cY = anchor.y + y,
					cX = anchor.x + x;
				// make sure there is enough columns
				if (!gridRows[cY][cX]) {
					this.addCol(anchor.x);
					// refresh reference to rows
					gridRows = this.rows;
				}
				// insert cell contents
				gridRows[cY][cX].innerHTML = cell;
				// remember for selection
				if (!yNum.includes(cY)) yNum.push(cY);
				if (!xNum.includes(cX)) xNum.push(cX);
			});
		});
		// select pasted cells
		this.select({ yNum, xNum, anchor });
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

	moveRows(from, to, rowNum) {
		let tblFrom = from.find("tbody"),
			tblTo = to.find("tbody"),
			rowsFrom = tblFrom.find("tr"),
			rowsTo = tblTo.length ? tblTo.find("tr") : [],
			rowsCurr = tblTo.length ? tblTo.find("tr") : [];
		// course of action
		if (rowsTo.length && rowsCurr.length > rowNum) {
			tblTo = tblFrom;
			tblFrom = to.find("tbody");
			// manipulate DOM
			[...Array(rowsCurr.length - rowNum)].map(i =>
				tblTo.prepend(tblFrom[0].lastChild));
		} else {
			if (!tblTo.length) {
				to.append(tblFrom[0].cloneNode(false));
				tblTo = to.find("tbody");
			}
			// manipulate DOM
			[...Array(rowNum - rowsCurr.length)].map(i => {
				// delete potential text-elements
				while (tblFrom[0].firstChild.nodeName !== "TR") {
					tblFrom[0].removeChild(tblFrom[0].firstChild);
				}
				tblTo.append(tblFrom[0].firstChild);
			});
		}
	}

	moveCols(from, to, colNum) {
		let tblFrom = from.find("tbody"),
			tblTo = to.find("tbody");
		// exit if both tables are empty
		if (!tblFrom.length && !tblTo.length) return;

		let rowsFrom = tblFrom.find("tr"),
			rowsTo = tblTo.length ? tblTo.find("tr") : [],
			colCurr = rowsTo.length ? rowsTo.get(0).find("td") : [];
		// course of action
		if (rowsTo.length && colCurr.length > colNum) {
			tblFrom = tblTo;
			rowsFrom = rowsTo;
			tblTo = from.find("tbody");
			rowsTo = tblTo.find("tr");
			// manipulate DOM
			rowsFrom.map((tr, y) =>
				[...Array(colCurr.length - colNum)].map(i =>
					rowsTo.get(y).prepend(tr.lastChild)));
		} else {
			// in case to-table doesn't have TBODY
			if (!tblTo.length) {
				to.append(tblFrom[0].cloneNode(false));
				tblTo = to.find("tbody");
				// first make sure both tables have equal rows
				rowsFrom.map(tr => tblTo.append(tr.cloneNode(false)));
				// refresh reference
				rowsTo = tblTo.find("tr");
			}
			// manipulate DOM
			rowsFrom.map((tr, y) =>
				[...Array(colNum - colCurr.length)].map(i => {
					// delete potential text-elements
					while (tr.firstChild.nodeName !== "TD") {
						tr.removeChild(tr.firstChild);
					}
					rowsTo.get(y).append(tr.firstChild);
				}));
		}
	}

	alter(change) {
		switch (change.type) {
			case "row-head":
				this.moveCols(this.parts.hBody.el, this.parts.hHead.el, change.num);
				this.moveCols(this.parts.bBody.el, this.parts.bHead.el, change.num);
				this.moveCols(this.parts.fBody.el, this.parts.fHead.el, change.num);
				break;
			case "col-head":
				this.moveRows(this.parts.bHead.el, this.parts.hHead.el, change.num);
				this.moveRows(this.parts.bBody.el, this.parts.hBody.el, change.num);
				break;
			case "col-foot":
				this.moveRows(this.parts.bHead.el, this.parts.fHead.el, change.num);
				this.moveRows(this.parts.bBody.el, this.parts.fBody.el, change.num);
				break;
		}
		this._tools.syncDim(this);
		this._tools.syncRowsCols(this);
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
			anchor = data.anchor[0] ? { el: data.anchor } : data.anchor || {},
			// selection box dimensions
			css = {
				top: 1e5,
				left: 1e5,
				width: -1e2,
				height: -1e2,
			},
			// for selection "hole"
			aPos = "tl tr bl br t b l r none".split(" "),
			anchorPos = "";

		// clear selected cell className(s)
		this._el.find(".anchor, .selected").removeClass("anchor selected");
		// make sure selection arrays are in order
		data.yNum = data.yNum.sort((a,b) => a-b);
		data.xNum = data.xNum.sort((a,b) => a-b);
		// removes potential duplicates
		rows = [...new Set(rows)];
		cols = [...new Set(cols)];
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
				if (!anchor.x) anchor = { ...anchor, x, y };
				if (!anchor.el && anchor.y === y && anchor.x === x) {
					anchor = { ...anchor, el };
				}
			});
		});
		// UI indicate anchor cell
		anchor.el.addClass("anchor");
		// adjust width + height
		css.height -= css.top;
		css.width -= css.left;

		// if (!this.layout.rows.foot) css.height += 1;

		// anchor hole
		css["--aH"] = anchor.el.prop("offsetHeight") +"px";
		css["--aW"] = anchor.el.prop("offsetWidth") +"px";
		if (rows.length > 1) anchorPos += anchor.y === rows[0] ? "t" : "b";
		if (cols.length > 1) anchorPos += anchor.x === cols[0] ? "l" : "r";
		if (rows.length === 1 && cols.length === 1) anchorPos = "none";
		// apply CSS
		this._tools._selection
			.removeClass(aPos.map(n => `anchor-${n}`).join(" "))
			.addClass(`show anchor-${anchorPos}`)
			.css(css);
		// save reference data
		this._selected = { xNum: cols, yNum: rows, anchor };
		// sync grid tools
		this._tools.select({ cols, rows });
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
