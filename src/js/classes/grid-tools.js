
class GridTools {
	constructor() {
		this._el = window.find(".table-tools");
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
