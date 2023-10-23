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
					if (cell.nodeType === Node.ELEMENT_NODE) {
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
		// cell contents editable
		this._tools.cellEditableOff();
		// reset cells
		this._el.find(".selected, .anchor").removeClass("selected anchor");
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
					top = offset.top - 3,
					left = offset.left - 3,
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

		let td = this._el.find(".selected:last"),
			tr = td.parent(),
			tbl = td.parents(".tbl-body:first");
		if (tr[0] === tr.parent().find("tr:last")[0] && tbl.length) css.height += 1;

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
		// cell contents editable
		if (!data.editing) {
			this._tools.cellEditableOn(anchor.el);
		}
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


class GridTools {
	constructor(Spawn) {
		this._el = Spawn.find(".table-tools");
		this._cols = this._el.find(".table-cols");
		this._rows = this._el.find(".table-rows");
		this._selection = this._el.find(".selection");
		// selectors
		this.parts = {
			cHead: ".table-cols > div:nth-child(1)",
			cBody: ".table-cols > div:nth-child(2)",
			rHead: ".table-rows > div:nth-child(1)",
			rBody: ".table-rows > div:nth-child(2)",
			rFoot: ".table-rows > div:nth-child(3)",
		};
		for (let key in this.parts) {
			let selector = this.parts[key],
				el = this._el.find(selector);
			this.parts[key] = { selector, el };
		}
	}

	cellEditableOff() {
		if (this._anchor) {
			let str = this._anchor.find("> div[contenteditable]").html();
			// if new value is number
			if (str == parseInt(str, 10)) this._anchor.attr({ t: "n" });
			else this._anchor.removeAttr("t");
			// remove "contentEditable" div
			this._anchor.html(str);
			// reset reference
			this._anchor = false;
		}
	}

	cellEditableOn(anchor) {
		if (!anchor.find("div[contenteditable]").length) {
			let str = `<div autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" contenteditable="true">${anchor.html()}</div>`;
			anchor.html(str);
		}
		// reference to ediable anchor
		this._anchor = anchor;
	}

	createClones() {
		if (this._TD !== undefined) return;
		// prepare TD clone
		this._TD = this.parts.cBody.el.find("td:nth(0)").clone(true)[0];
		// [...this._TD.attributes].map(a => this._TD.removeAttribute(a.name));
		this._TD.className = "";
		// prepare TR clone
		this._TR = this.parts.rBody.el.find("tr:nth(0)").clone(true)[0];
		[...this._TR.attributes].map(a => this._TR.removeAttribute(a.name));
	}

	syncDim(grid) {
		let table = grid._el || this._grid._el,
			top = table.prop("offsetTop"),
			left = table.prop("offsetLeft"),
			width = table.prop("offsetWidth"),
			height = table.prop("offsetHeight");
		this._el.css({ top, left, width, height });
		// adjust for table with "title"
		let _title = table.find(".tbl-title");
		top = _title.prop("offsetHeight") + parseInt(_title.css("margin-bottom"), 10);
		top = isNaN(top) ? 0 : top;
		this._rows.css({ "--rows-top": `${top}px` });
		// toggle between "clip" resizers
		this._el.toggleClass("clip", !table.hasClass("clipped"));
		// save reference to grid instance
		this._grid = grid;
	}

	syncRowsCols(grid) {
		let table = grid._el || this._grid._el,
			cNames = [],
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
		// prepare clones
		this.createClones();
		// reset tool columns UI
		this._rows.removeClass("has-row-head has-row-foot").addClass(rNames.join(" "));
	}

	addRow(n, where="after") {
		let rows = this._grid.layout.rows,
			i = n !== undefined ? n : rows.head + rows.body - 1,
			p;
		// adjust index and find out "position"
		switch (true) {
			case (i < rows.head): p = "Head"; break;
			case (i >= rows.head + rows.body): p = "Foot"; i -= rows.head + rows.body; break;
			default: p = "Body"; i -= rows.head + 1;
		}
		// insert clone at position
		this.parts[`r${p}`].el.find(`tbody tr:nth(${i})`)[where](this._TR.cloneNode(true));
		// UI update tools height
		this._el.css({ height: this._grid._el.prop("offsetHeight") });
	}

	removeRow(n) {
		let rows = this._grid.layout.rows,
			i = n !== undefined ? n : rows.head + rows.body - 1,
			p;
		// adjust index and find out "position"
		switch (true) {
			case (i < rows.head): p = "Head"; break;
			case (i >= rows.head + rows.body): p = "Foot"; i -= rows.head + rows.body; break;
			default: p = "Body"; i -= rows.head;
		}
		// remove row at position
		this.parts[`r${p}`].el.find(`tr:nth(${i})`).remove();
		// UI update tools height
		this._el.css({ height: this._grid._el.prop("offsetHeight") });
	}

	addCol(n, where="after") {
		let cols = this._grid.layout.cols,
			i = n !== undefined ? n : cols.head + cols.body - 1,
			p, part;
		// adjust index and find out "position"
		switch (true) {
			case (i < cols.head): p = "Head"; break;
			default: p = "Body"; i -= cols.head + 1;
		}
		// insert clone at position
		part = this.parts[`c${p}`];
		part.el.find(`tr td:nth-child(${i+1})`)[where](this._TD.cloneNode(true));
		// UI update column table width
		let width = part.el.find("td").reduce((acc, td) => acc + parseInt(td.style.width, 10), 0);
		part.el.find("table").css({ width });
		// UI update tools width
		this._el.css({ width: this._grid._el.prop("offsetWidth") });
	}

	removeCol(n) {
		let cols = this._grid.layout.cols,
			i = n !== undefined ? n : cols.head + cols.body - 1,
			p, part;
		// adjust index and find out "position"
		switch (true) {
			case (i < cols.head): p = "Head"; break;
			default: p = "Body"; i -= cols.head;
		}
		// remove row at position
		part = this.parts[`c${p}`];
		part.el.find(`tr td:nth-child(${i+1})`).remove();
		// UI update column table width
		let width = part.el.find("td").reduce((acc, td) => acc + parseInt(td.style.width, 10), 0);
		part.el.find("table").css({ width });
		// UI update tools width
		this._el.css({ width: this._grid._el.prop("offsetWidth") });
	}

	unselect() {
		// reset columns & rows
		this._cols.find(".active").removeClass("active");
		this._rows.find(".active").removeClass("active");
	}

	select(data) {
		let { cols, rows } = data;
		// reset columns & rows
		this.unselect();
		// make active selected columns & rows
		cols.map(i => this._cols.find("td").get(i).addClass("active"));
		rows.map(i => this._rows.find("tr").get(i).addClass("active"));
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


class Guides {

	static get selector() {
		return ".xl-table, .xl-shape, .xl-image, .xl-text";
	}

	static get context() {
		return "content .body";
	}

	constructor(opt={}) {
		// reference to root application
		let APP = eniac,
			Spawn = karaqu.getSpawn(opt.offset.el),
			opts = {
				// default selector & context
				selector: opt.selector || Guides.selector,
				context: opt.context || Guides.context,
				// offsets origo
				x: 0,
				y: 0,
				// offsets guide line
				w: 0,
				h: 0,
				mh: opt.offset.h >> 1 || 0,
				mw: opt.offset.w >> 1 || 0,
				lines: opt.lines || [],
				// snap sensitivity
				sensitivity: APP.Settings["guides-snap-sensitivity"] || 7,
				// override defaults, if any
				...opt.offset,
			};
		// default properties
		this.els = [...opts.lines];
		// selector = "#shape-rounded";
		Spawn.find(opts.selector, opts.context).map(elem => {
				let el = $(elem),
					y = parseInt(el.css("top"), 10),
					x = parseInt(el.css("left"), 10),
					w = parseInt(el.css("width"), 10),
					h = parseInt(el.css("height"), 10),
					mh = h >> 1,
					mw = w >> 1;
				if (el.hasClass("xl-table")) {
					w += 1;
					h += 1;
					mh = h >> 1;
					mw = w >> 1;
				}
				if (!isNaN(y) && !isNaN(x) && elem !== opts.el) {
					this.els.push({ y, x, w, h, mh, mw });
				}
			});

		// add guide line element to "this"
		this.lines = {
			horizontal: Spawn.find(".guide-lines .horizontal"),
			vertical: Spawn.find(".guide-lines .vertical"),
			diagonal: Spawn.find(".guide-lines .diagonal"),
		};
		// add guide line element to "this"
		this.opts = opts;
	}

	snapDim(d) {
		let o = this.opts,
			s = o.sensitivity,
			u = d.uniform,
			b = {
				t: o.type,
				d: d.diagonal,
				n: o.type.includes("n"),
				w: o.type.includes("w"),
				e: o.type.includes("e"),
				s: o.type.includes("s"),
			},
			vert = { top: -99, left: -99, width: 1 },
			hori = { top: -99, left: -99, height: 1 },
			diag = { top: -99, left: -99, height: 1 },
			calcH = (g, c, add = { h: 0 }) => {
				let minX = o.x,
					maxX = g.x,
					w = g.w;
				d.height -= c.h;
				d.top -= c.t;
				if (maxX < minX) {
					minX = g.x;
					maxX = o.x;
					w = o.w;
				}
				if (u) freeze(true);
				return { top: g.y+add.h, left: minX, width: maxX-minX+w };
			},
			calcV = (g, c, add = { w: 0 }) => {
				let minY = o.y,
					maxY = g.y,
					h = g.h;
				d.width -= c.w;
				d.left -= c.l;
				if (maxY < minY) {
					minY = g.y;
					maxY = o.y;
					h = o.h;
				}
				if (u) freeze();
				return { top: minY, left: g.x+add.w, height: maxY-minY+h };
			},
			freeze = (h) => {
				switch (b.t) {
					case "ne":
						if (h) {
							d.width = d.height * d.ratio;
							d.left = o.x - ((d.height - o.h) * o.ratio);
						} else {
							d.height = d.width / d.ratio;
							d.top = o.y - ((d.width - o.w) / o.ratio);
						}
						break;
					case "se":
						if (h) {
							d.width = d.height * d.ratio;
							d.left = o.x - ((d.height - o.h) * o.ratio);
						} else {
							d.height = d.width / d.ratio;
						}
						break;
					case "sw":
						if (h) d.width = d.height * d.ratio;
						else d.height = d.width / d.ratio;
						break;
					case "nw":
						if (h) d.width = d.height * d.ratio;
						else {
							d.height = d.width / d.ratio;
							d.top = o.y - ((d.width - o.w) / o.ratio);
						}
						break;
					case "e":
					case "w":
						d.top = o.y - (((d.width - o.w) / o.ratio) >> 1);
						d.height = d.width / d.ratio;
						break;
					case "n":
					case "s":
						d.left = o.x - (((d.height - o.h) * o.ratio) >> 1);
						d.width = d.height * d.ratio;
						break;
				}
			};
		
		if (b.d) {
			switch (b.t) {
				case "ne":
				case "nw":
					d.height = Math.max(Math.round(d.width / d.ratio), d.min.h);
					d.top = Math.round(d.y + d.h - d.height);
					break;
				case "se":
					d.width = Math.max(Math.round(d.height * d.ratio), d.min.w);
					d.left = Math.round(d.x + d.w - d.width);
					break;
				case "sw":
					d.width = Math.max(Math.round(d.height * d.ratio), d.min.w);
					break;
			}

			diag = {
				top: d.top || o.y,
				left: d.left || o.x,
				transform: `rotate(${o.r}deg)`,
				width: Math.sqrt(d.height*d.height + d.width*d.width) + 10,
			};
			if (o.r > 90) diag.left += d.width;

		} else if (u) { // uniform resize
			switch (b.t) {
				case "n":
					d.top = Math.round(d.y + d.h - d.height);
					d.width = Math.max(Math.round(d.height * d.ratio), d.min.w);
					d.left = o.x + ((o.w - d.width) >> 1);
					break;
				case "s":
					d.width = Math.max(Math.round(d.height * d.ratio), d.min.w);
					d.left = o.x + ((o.w - d.width) >> 1);
					break;
				case "e":
				case "w":
					d.height = Math.max(Math.round(d.width / d.ratio), d.min.h);
					d.top = Math.round(d.y + ((d.h - d.height) >> 1));
					break;
			}
		}
		
		// iterate guide lines
		this.els.map(g => {
			let t = d.top - g.y,
				th = t - g.h,
				thm = t - g.mh,
				dh = d.height + o.y - g.y,
				ohy = dh - g.h,
				ohm = dh - g.mh,
				l = d.left - g.x,
				lw = l - g.w,
				lwm = l - g.mw,
				dw = d.width + o.x - g.x,
				owx = dw - g.w,
				owm = dw - g.mw,
				c = { w: 0, h: 0, t: 0, l: 0 };
			// horizontal comparisons
			switch (true) {
				// east
				case (b.e && l < s && l > -s):     c.l = l;   c.w -= l;   vert = calcV(g, c);              break;
				case (b.e && lw < s && lw > -s):   c.l = lw;  c.w -= lw;  vert = calcV(g, c, { w: g.w });  break;
				case (b.e && lwm < s && lwm > -s): c.l = lwm; c.w -= lwm; vert = calcV(g, c, { w: g.mw }); break;
				// west
				case (b.w && dw < s && dw > -s): c.w = dw; vert = calcV(g, c, { w: (u?1:0) });           break;
				case (b.w && owx < s && owx > -s): c.w = owx; vert = calcV(g, c, { w: g.w + (u?1:0) });  break;
				case (b.w && owm < s && owm > -s): c.w = owm; vert = calcV(g, c, { w: g.mw + (u?1:0) }); break;
			}
			// vertical comparisons
			switch (true) {
				// north
				case (b.n && t < s && t > -s):     c.t = t;   c.h -= t;   hori = calcH(g, c);              break;
				case (b.n && th < s && th > -s):   c.t = th;  c.h -= th;  hori = calcH(g, c, { h: g.h });  break;
				case (b.n && thm < s && thm > -s): c.t = thm; c.h -= thm; hori = calcH(g, c, { h: g.mh }); break;
				// south
				case (b.s && dh < s && dh > -s):   c.h = dh;  hori = calcH(g, c, { h: (u?-1:0) });        break;
				case (b.s && ohy < s && ohy > -s): c.h = ohy; hori = calcH(g, c, { h: g.h + (u?-1:0) });  break;
				case (b.s && ohm < s && ohm > -s): c.h = ohm; hori = calcH(g, c, { h: g.mh + (u?-1:0) }); break;
			}
		});

		// apply UI update
		this.lines.vertical.css(vert);
		this.lines.horizontal.css(hori);
		this.lines.diagonal.css(diag);
	}

	snapPos(m) {
		let o = this.opts,
			s = o.sensitivity,
			t = m.top + o.y,
			l = m.left + o.x,
			vert = { top: -1, left: -1, width: 1 },
			hori = { top: -1, left: -1, height: 1 },
			calcH = (g, y, add = { t: 0 }) => {
				let minX = l,
					maxX = g.x,
					w = maxX-minX+g.w;
				if (w < o.w) w = o.w;
				m.top -= y;
				if (maxX < minX) {
					minX = g.x;
					maxX = l;
					w = maxX-minX+o.w;
					if (w < g.w) w = g.w;
				}
				return { top: g.y+add.t, left: minX, width: w };
			},
			calcV = (g, x, add = { l: 0 }) => {
				let minY = t,
					maxY = g.y,
					h = maxY-minY+g.h;
				if (h < o.h) h = o.h;
				m.left -= x;
				if (maxY < minY) {
					minY = g.y;
					maxY = t;
					h = maxY-minY+o.h;
					if (h < g.h) h = g.h;
				}
				return { top: minY, left: g.x+add.l, height: h };
			};
		// restrains position
		if (m.restrict) {
			let dy = m.top - o.t,
				dx = m.left - o.l,
				tie = ["h", "ne", "v", "nw", "h", "ne", "v", "nw", "h"],
				deg = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
			if (deg < 0) deg += 360;
			switch (tie[Math.round(deg / 45)]) {
				case "v": m.left = o.l; break;
				case "h": m.top = o.t; break;
				case "ne": m.left = o.l + (m.top - o.t); break;
				case "nw": m.left = o.l - (m.top - o.t); break;
			}
		}
		// iterate guide lines
		this.els.map(g => {
			let dy = t - g.y,
				dx = l - g.x,
				ohy = dy + o.h,
				oh1 = dy + o.mh,
				oh2 = ohy - g.h - o.mh,
				ghy = dy - g.h,
				ogh = ohy - g.h,
				oym = ohy - g.mh - o.mh,
				owx = dx + o.w,
				ow1 = dx + o.mw,
				ow2 = owx - g.w - o.mw,
				gwx = dx - g.w,
				ogw = owx - g.w,
				oxm = owx - g.mw - o.mw,
				_hd = hori.top !== -1,
				_vd = vert.top !== -1;
			// vertical comparisons
			switch (true) {
				case (!_hd && dy  < s && dy  > -s): hori = calcH(g, dy);                break;
				case (!_hd && ohy < s && ohy > -s): hori = calcH(g, ohy);               break;
				case (!_hd && oh1 < s && oh1 > -s): hori = calcH(g, oh1);               break;
				case (!_hd && oh2 < s && oh2 > -s): hori = calcH(g, oh2, { t: g.h });   break;
				case (!_hd && oym < s && oym > -s): hori = calcH(g, oym, { t: g.mh });  break;
				case (!_hd && ghy < s && ghy > -s): hori = calcH(g, ghy, { t: g.h-1 }); break;
				case (!_hd && ogh < s && ogh > -s): hori = calcH(g, ogh, { t: g.h-1 }); break;
			}
			// horizontal comparisons
			switch (true) {
				case (!_vd && dx  < s && dx  > -s): vert = calcV(g, dx);                break;
				case (!_vd && owx < s && owx > -s): vert = calcV(g, owx);               break;
				case (!_vd && ow1 < s && ow1 > -s): vert = calcV(g, ow1);               break;
				case (!_vd && ow2 < s && ow2 > -s): vert = calcV(g, ow2, { l: g.w });   break;
				case (!_vd && oxm < s && oxm > -s): vert = calcV(g, oxm, { l: g.mw });  break;
				case (!_vd && gwx < s && gwx > -s): vert = calcV(g, gwx, { l: g.w-1 }); break;
				case (!_vd && ogw < s && ogw > -s): vert = calcV(g, ogw, { l: g.w-1 }); break;
			}
		});
		// apply UI update
		this.lines.vertical.css(vert);
		this.lines.horizontal.css(hori);
	}

	reset() {
		let data = { top: -99, left: -99, width: 1, height: 1 };
		this.lines.vertical.css(data);
		this.lines.horizontal.css(data);
		this.lines.diagonal.css(data);
	}
}


class Edit {

	constructor(options) {
		this._el = options.el;
		this._type = options.type;
		this._keys = {
				bold: "bold",
				italic: "italic",
				underline: "underline",
				strikeThrough: "strikeThrough",
				left: "justifyLeft",
				center: "justifyCenter",
				right: "justifyRight",
				justify: "justifyFull",
			};
		// default formatting style
		this.format("styleWithCSS", true);
		// make sure usage of "P" instead of "DIV"
		this.format("defaultParagraphSeparator", "p");
	}
	
	format(key, value) {
		let name = this._keys[key] || key,
			sel = new $election,
			isCollapsed;
		// if selection, save current range
		if (sel._root) {
			sel.save();
			// expand to word, if selection is collapsed
			if (sel.collapsed) sel.expand("word");
		}
		switch (name) {
			case "font-family":
				name = "fontName";
				break;
			case "font-color":
				name = "ForeColor";
				break;
			case "font-size":
				value = `<span style="font-size: ${value}px;">${sel.toString()}</span>`;
				name = "insertHTML";
				break;
		}
		document.execCommand(name, false, value || null);
		// restore range
		if (sel._root) sel.restore();
	}

	state() {
		let El = this._el,
			sel = new $election,
			el = $(sel.container),
			value,
			color = Color.rgbToHex(document.queryCommandValue("ForeColor")).slice(0,-2),
			fontFamily = el.css("font-family"),
			fontSize = parseInt(el.css("font-size"), 10),
			lineHeight = parseInt(el.css("line-height"), 10);
		// set value of font color
		El.find(`.color-preset_[data-change="set-${this._type}-color"]`).css({ "--preset-color": color });
		// font family
		if (fontFamily.startsWith('"') && fontFamily.endsWith('"')) {
			fontFamily = fontFamily.slice(1,-1);
		}
		El.find(`selectbox[data-change="set-${this._type}-font-family"]`).val(fontFamily);
		// font size
		El.find(`input[name="${this._type}-font-size"]`).val(fontSize);
		// line height
		value = (lineHeight / fontSize).toFixed(1).toString();
		El.find(`selectbox[data-menu="${this._type}-line-height"]`).val(value);
		// iterate
		Object.keys(this._keys).map(key => {
			let name = this._keys[key],
				value = document.queryCommandState(name);
			El.find(`[data-name="${key}"]`).toggleClass("active_", !value);
		});
	}

}


class $election {

	constructor(node, startOffset, endOffset) {
		this._selection = document.getSelection();
		// select if provided
		if (node && startOffset !== false) this.select(...arguments);
		// reference to root node
		this._root = this.getRoot();
	}

	expand(unit) {
		switch (unit) {
			case "word":
				// remember
				this._selection.collapseToStart();
				this._selection.modify("move", "backward", "word");
				this._selection.modify("extend", "forward", "word");
				break;
		}
	}

	get container() {
		let el = this._selection.focusNode;
		if (el.nodeType == Node.TEXT_NODE) el = el.parentNode;
		return el;
	}

	get collapsed() {
		return this._selection.getRangeAt(0).collapsed;
	}

	get type() {
		return this._selection.type;
	}

	collapse(node, offset) {
		if (this.collapsed) return;
		node = node || this._anchorNode;
		offset = offset || this._anchorOffset;
		this._selection.collapse(node, offset);
	}

	toString() {
		return this._selection.toString();
	}

	save() {
		let textNodes = this.getOnlyTextNodes(this._root),
			anchorNode = this._selection.anchorNode,
			anchorOffset = Math.min(this._selection.anchorOffset, this._selection.focusOffset),
			len = textNodes.indexOf(anchorNode) + 1,
			offset = 0,
			str;
		// calculate "start" offset
		while (len--) {
			str = textNodes[len].nodeValue.toString();
			if (textNodes[len] === anchorNode) {
				str = str.slice(0, anchorOffset);
			}
			offset += str.length;
		}
		this._startOffset = offset;
		// calculate "end" offset
		str = this._selection.toString().replace(/\n/g, "");
		this._endOffset = str.length;
		// console.log(this._startOffset, this._endOffset);
	}

	restore() {
		if (!this._root) return;
		this.select(this._root, this._startOffset, this._endOffset);
	}

	select(node, startOffset, endOffset) {
		let range = document.createRange(),
			textNodes = node.nodeType === 3 ? [node] : this.getOnlyTextNodes(node),
			anchorNode,
			anchorOffset = startOffset,
			focusNode,
			focusOffset = endOffset,
			il = textNodes.length,
			i = 0,
			str;
		for (; i<il; i++) {
			anchorNode = textNodes[i];
			if (anchorNode.nodeValue.length >= anchorOffset) break;
			anchorOffset -= anchorNode.nodeValue.length;
		}
		if (endOffset) {
			for (; i<il; i++) {
				focusNode = textNodes[i];
				str = focusNode.nodeValue;
				if (focusNode === anchorNode) str = str.slice(anchorOffset);
				if (str.length >= focusOffset) break;
				focusOffset -= str.length;
			}
			if (anchorNode === focusNode) focusOffset += anchorOffset;
			// else focusOffset += 1;
		} else {
			focusNode = anchorNode;
			focusOffset = anchorOffset;
		}
		range.setStart(anchorNode, anchorOffset);
		range.setEnd(focusNode, focusOffset);
		this._selection.removeAllRanges();
		this._selection.addRange(range);
	}

	getOnlyTextNodes(node) {
		let arr = [];
		// get all text nodes with in node
		node.childNodes.map(node => {
			// console.log(node);
			switch (node.nodeType) {
				case Node.TEXT_NODE:
					arr.push(node);
					break;
				case Node.ELEMENT_NODE:
					arr.push(...this.getOnlyTextNodes(node));
					break;
			}
		});
		return arr;
	}

	getRoot() {
		let node = this._selection.baseNode;
		if (!node) return;
		// climb to root node
		while (node.nodeType !== Node.ELEMENT_NODE || !node.getAttribute("contenteditable")) {
			node = node.parentNode;
		}
		return node;
	}

}


const CSV = {
	possibleDelimiters: [",", ";", "\t"],
	parse(data) {
		let APP = eniac,
			str = [],
			width = 400,
			height = 190,
			// top = (APP.spawn.els.body.parent().prop("offsetHeight") - height) >> 1,
			// left = (APP.spawn.els.body.parent().prop("offsetWidth") - width) >> 1,
			top = 40,
			left = 40,
			zIndex = APP.spawn.els.body.find(Guides.selector).length,
			style = `top:${top}px; left:${left}px; z-index:${zIndex}`,
			delimiter = this.detectDelimiter(data);
		// prepare workbook XML
		str.push(`<Workbook>`);
		str.push(`<Sheet name="Sheet 1">`);
		str.push(`<Table width="${width}" height="${height}" style="${style}">`);
		// parse data string to XML
		data.trim().split("\n").map(row => {
			let xRow = "";
			row.split(delimiter).map(cell => {
				let v = cell.trim();
				if (v.startsWith('"') && v.endsWith('"')) {
					v = v.slice(1,-1);
				}
				let type = v == new Number(v) ? `t="n"` : "";
				xRow += `<C ${type}><![CDATA[${v}]]></C>`;
			});
			str.push(`<R tp="2">${xRow}</R>`);
		});
		// closing tags
		str.push(`</Table>`);
		str.push(`</Sheet>`);
		str.push(`</Workbook>`);
		// return parsed document element
		return $.xmlFromString(str.join("")).documentElement;
	},
	detectDelimiter(text) {
		let weedOut = delimiter => {
				let cache = -1,
		        	checkLength = line => {
		        		if (!line) return true;
			            let length = line.split(delimiter).length;
			            if (cache < 0) cache = length;
			            return cache === length && length > 1;
		        	};
		        return text.split("\n").every(checkLength);
			};
		return this.possibleDelimiters.filter(weedOut);
	},
	export(table) {
		// TODO: export table to CSV
	}
};


const Color = {
	rgbToLightness(r, g, b) {
		return (1/2 * (Math.max(r, g, b) + Math.min(r, g, b))) / 255;
	},
	rgbToSaturation(r, g, b) {
		let L = this.rgbToLightness(r, g, b),
			max = Math.max(r, g, b),
			min = Math.min(r, g, b);
		return (L === 0 || L === 1)
			? 0
			: ((max - min) / (1 - Math.abs(2 * L - 1))) / 255;
	},
	rgbToHue(r, g, b) {
		let hue = Math.round(Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180 / Math.PI );
		return hue < 0 ? hue + 360 : hue;
	},
	hslToRgb(h, s, l, a=1) {
		let _round = Math.round,
			_min = Math.min,
			_max = Math.max,
			b = s * _min(l, 1-l);
		let f = (n, k = (n + h / 30) % 12) => l - b * _max(_min(k - 3, 9 - k, 1), -1);
		return [_round(f(0) * 255), _round(f(8) * 255), _round(f(4) * 255), a];
	},
	hslToHex(h, s, l, a=1) {
		let rgb = this.hslToRgb(h, s, l, a);
		return this.rgbToHex(`rgba(${rgb.join(",")})`);
	},
	hexToHsl(hex) {
		if (hex.startsWith("rgb")) hex = this.rgbToHex(hex);
		let rgb = this.hexToRgb(hex);
		return this.rgbToHsl(...rgb);
	},
	mixColors(hex1, hex2, p) {
		let rgb1 = this.hexToRgb(hex1),
			rgb2 = this.hexToRgb(hex2),
			w = p * 2 - 1,
			w1 = (w + 1) / 2.0,
			w2 = 1 - w1,
			rgb = [
				parseInt(rgb1[0] * w1 + rgb2[0] * w2, 10),
				parseInt(rgb1[1] * w1 + rgb2[1] * w2, 10),
				parseInt(rgb1[2] * w1 + rgb2[2] * w2, 10),
				rgb1[3] * w1 + rgb2[3] * w2
			];
		return this.rgbToHex(`rgba(${rgb.join(",")})`);
	},
	hexToHsv(hex) {
		let rgb = this.hexToRgb(hex);
		return this.rgbToHsv(...rgb);
	},
	rgbToHsv(r, g, b, a=1) {
		var max = Math.max(r, g, b), min = Math.min(r, g, b),
			d = max - min,
			h,
			s = (max === 0 ? 0 : d / max),
			v = max / 255;
		switch (max) {
			case min: h = 0; break;
			case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
			case g: h = (b - r) + d * 2; h /= 6 * d; break;
			case b: h = (r - g) + d * 4; h /= 6 * d; break;
		}
		return [Math.round(h*360), s, v, a];
	},
	hexToRgb(hex) {
		if (hex.length === 4) {
			let [h,r,g,b] = hex.split("");
			hex = h+r+r+g+g+b+b;
		}
		let r = parseInt(hex.substr(1,2), 16),
			g = parseInt(hex.substr(3,2), 16),
			b = parseInt(hex.substr(5,2), 16),
			a = parseInt(hex.substr(7,2) || "ff", 16) / 255;
		return [r, g, b, a];
	},
	rgbToHsl(r, g, b, a=1) {
		r /= 255;
		g /= 255;
		b /= 255;
		var max = Math.max(r, g, b),
			min = Math.min(r, g, b),
			l = (max + min) / 2,
			h, s;
		if (max == min){
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return [Math.round(h*360), s, l, a];
	},
	rgbToHex(rgb) {
		let d = "0123456789abcdef".split(""),
			hex = x => isNaN(x) ? "00" : d[( x - x % 16) / 16] + d[x % 16];
		rgb = rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\.\d]+)\)$/);
		if (!rgb) rgb = arguments[0].match(/^rgb?\((\d+),\s*(\d+),\s*(\d+)\)$/);
		let a = Math.round((rgb[4] || 1) * 255);
		return "#"+ hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]) + hex(a);
	}
};
