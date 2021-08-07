
// eniac.tools

{
	init() {
		// fast references
		let root = window.find(".table-tools");
		this.els = {
			root,
			doc: $(document),
			layout: window.find("layout"),
			cols: root.find(".table-cols"),
			rows: root.find(".table-rows"),
			move: root.find(".tool.move"),
			resizes: root.find(".tool.hv-resize, .tool.v-resize, .tool.h-resize"),
		};
		// placeholder
		this.sheet = {};

		// bind event handlers
		this.els.layout.on("scroll", ".tbl-body > div:nth-child(2)", this.dispatch);
		this.els.layout.on("mousedown", ".table-cols, .table-rows", this.resizeColRow);
		this.els.resizes.on("mousedown", this.resizeClip);
		this.els.move.on("mousedown", this.move);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools,
			Sheet = Self.sheet,
			top, left, width, height,
			grid, cols, rows,
			el;
		switch (event.type) {
			// native events
			case "scroll":
				el = $(event.target);
				Sheet = el.parents(".sheet:first");
				top = -event.target.scrollTop;
				left = -event.target.scrollLeft;
				
				// vertical sync
				Sheet.find(`.tbl-col-head > div:nth(1) table,
							.tbl-col-foot > div:nth(1) table`).css({ left });
				// horizontal sync
				Sheet.find(".tbl-body div:nth-child(1) table").css({ top });

				if (!Sheet.isSame(Self.sheet.el)) return;

				// tool cols + rows
				Self.els.cols.find("> div:nth-child(2) table").css({ left });
				Self.els.rows.find("> div:nth-child(2) table").css({ top });
				break;
			// custom events
			case "set-sheet":
				el = event.sheet;
				// zip sheet cells ordered
				grid = Self.grid.sheet(el);

				Self.sheet = {
					el,
					grid,
					colNum: grid.getRowCells(0).length,
					rowNum: grid.rows.length,
				};
				break;
			case "reset-tools":
				Self.sheet = {};
				Self.els.root.addClass("hidden");
				break;
			case "sync-tools-dim":
				top = Sheet.el.prop("offsetTop");
				left = Sheet.el.prop("offsetLeft");
				width = Sheet.el.prop("offsetWidth");
				height = Sheet.el.prop("offsetHeight");
				Self.els.root.css({ top, left, width, height });

				el = Sheet.el.find(".table-title");
				top = (el.prop("offsetHeight") + parseInt(el.css("margin-bottom"), 10));
				top = isNaN(top) ? 0 : top;
				Self.els.rows.css({ "--rows-top": `${top}px` });
				break;
			case "sync-sheet-table":
				// if (event.sheet && Self.sheet && event.sheet.isSame(Self.sheet.el)) return;
				Self.dispatch({ ...event, type: "set-sheet" });
				Self.dispatch({ ...event, type: "sync-tools-dim" });

				// toggle between "clip" resizers
				if (Self.sheet.el.hasClass("clipped")) Self.els.root.addClass("clip");
				else Self.els.root.removeClass("clip");

				let toolCols = Self.els.cols.find("> div").html(""),
					toolRows = Self.els.rows.find("> div").html(""),
					cNames = [],
					rNames = [];
				/*
				 * tools columns
				 */
				cols = Self.sheet.el.find(".tbl-col-head > div");
				if (!cols.length || !cols.find("tr:nth(0) td").length) {
					cols = Self.sheet.el.find(".tbl-body > div");
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
				Self.els.cols
					.removeClass("has-col-head")
					.addClass(cNames.join(" "));
				/*
				 * tools rows
				 */
				rows = Self.sheet.el.find(".tbl-root > div > div:nth-child(1)");
				if (!rows.find("tr").length) {
					rows = Self.sheet.el.find(".tbl-root > div > div:nth-child(2)");
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
				Self.els.rows
					.removeClass("has-row-head has-row-foot")
					.addClass(rNames.join(" "));
				// zip tool cells
				Self.sheet.toolGrid = Self.grid.tools();
				break;
			case "select-coords":
				cols = event.xNum.length ? event.xNum : [event.xNum];
				rows = event.yNum.length ? event.yNum : [event.yNum];
				// remember selected coords
				Self.selected = { xNum: event.xNum, yNum: event.yNum };

				Self.els.cols.find(".active").removeClass("active");
				cols.map(i => Self.els.cols.find("td").get(i).addClass("active"));

				Self.els.rows.find(".active").removeClass("active");
				rows.map(i => Self.els.rows.find("tr").get(i).addClass("active"));
				break;
		}
	},
	grid: {
		tools() {
			let Els = eniac.tools.els,
				grid = {
					rows: [...Els.rows.find("td")],
					cols: [],
					getRow(y) {
						return $(this.rows[y]);
					},
					getCol(x) {
						return $(this.cols[x]);
					},
					getRowIndex(td) {
						return this.rows.indexOf(td);
					},
					getColIndex(td) {
						return this.cols.indexOf(td);
					}
				};
			// col head rows
			let r1 = Els.cols.find("> div:nth-child(1) tr"),
				r2 = Els.cols.find("> div:nth-child(2) tr");
			if (r1.length) r1.map((row, i) => grid.cols.push(...$("td", row), ...r2.get(i).find("td")));
			else r2.map((row, i) => grid.cols.push(...$("td", row)));

			return grid;
		},
		sheet(sheet) {
			let r1, r2,
				grid = {
					sheet,
					layout: {
						rows: {},
						cols: {},
					},
					rows: [],
					cells: [],
					getRow(y) {
						return $(this.rows[y]);
					},
					getRowCells(y) {
						return $(this.rows[y]);
					},
					getCoordCell(y, x) {
						return $(this.getRowCells(y)[x]);
					},
					getCoordRow(y) {
						let found = [];
						if (this.layout.cols.head > 0) found.push(this.getRowCells(y)[0]);
						if (this.layout.cols.body > 0) found.push(this.getRowCells(y)[this.layout.cols.head]);
						return $(found);
					},
					getCoordCol(x) {
						let found = [];
						if (this.layout.rows.head > 0) found.push(this.getRowCells(0)[x]);
						if (this.layout.rows.body > 0) found.push(this.getRowCells(this.layout.rows.head)[x]);
						if (this.layout.rows.foot > 0) found.push(this.getRowCells(this.layout.rows.head + this.layout.rows.body)[x]);
						return $(found);
					},
					getCoord(td) {
						for (let y=0, yl=this.rows.length; y<yl; y++) {
							let row = this.rows[y];
							for (let x=0, xl=row.length; x<xl; x++) {
								if (row[x] === td) return [y, x];
							}
						}
					},
					get width() {
						return this.sheet.find(".tbl-body > div > table").reduce((acc, el) => acc + el.offsetWidth, 0);
					},
					get height() {
						return this.sheet.find(".tbl-root div > div:nth-child(2) > table").reduce((acc, el) => acc + el.offsetHeight, 0);
					},
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
				};
			// col head rows
			r1 = sheet.find(".tbl-col-head > div:nth-child(1) tr");
			r2 = sheet.find(".tbl-col-head > div:nth-child(2) tr");
			if (r1.length) r1.map((row, i) => grid.rows.push([...$("td", row), ...r2.get(i).find("td")]));
			else r2.map((row, i) => grid.rows.push([...$("td", row)]));
			// column layout info
			grid.layout.rows.head = r1.length || r2.length;

			// col body rows
			r1 = sheet.find(".tbl-body > div:nth-child(1) tr");
			r2 = sheet.find(".tbl-body > div:nth-child(2) tr");
			if (r1.length) r1.map((row, i) => grid.rows.push([...$("td", row), ...r2.get(i).find("td")]));
			else r2.map((row, i) => grid.rows.push([...$("td", row)]));
			// column layout info
			grid.layout.rows.body = r1.length || r2.length;
			grid.layout.cols.head = r1.length ? r1.get(0).find("td").length : 0;
			grid.layout.cols.body = r2.get(0).find("td").length;

			// all cells
			grid.cells.push(...sheet.find(".tbl-col-head td"));
			r1.map((row, i) => {
				grid.cells.push( ...$("td", row) );
				grid.cells.push( ...r2.get(i).find("td") );
			});
			grid.cells.push(...sheet.find(".tbl-col-foot td"));
			// col foot rows
			r1 = sheet.find(".tbl-col-foot > div:nth-child(1) tr");
			r2 = sheet.find(".tbl-col-foot > div:nth-child(2) tr");
			if (r1.length) r1.map((row, i) => grid.rows.push([...$("td", row), ...r2.get(i).find("td")]));
			else r2.map((row, i) => grid.rows.push([...$("td", row)]));
			// column layout info
			grid.layout.rows.foot = r1.length || r2.length;

			return grid;
		}
	},
	resizeColRow(event) {
		let APP = eniac,
			Self = APP.tools,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				let el = $(event.target.parentNode),
					tbl = el.parents("table:first"),
					tool = tbl.parents(".table-tool:first"),
					index;
				if (tool.hasClass("table-cols") || tool.hasClass("table-rows")) {
					// create drag object
					Self.drag = {
						tbl,
						root: Self.els.root,
						clickX: event.clientX,
						clickY: event.clientY,
						minX: 30,
						minY: 25,
					};
					// identify if "column" or "row"
					if (event.offsetX > event.target.offsetWidth) {
						index = Self.sheet.toolGrid.getColIndex(el[0]);

						Self.drag.el = el;
						Self.drag.tblWidth = tbl.prop("offsetWidth");
						Self.drag.sheetCol = Self.sheet.grid.getCoordCol(index);
						Self.drag.ttWidth = Self.drag.root[0].getBoundingClientRect().width;
						Self.drag.colWidth = Self.drag.el[0].getBoundingClientRect().width;
					} else if (event.offsetX < 0) {
						index = Self.sheet.toolGrid.getRowIndex(el[0]);

						Self.drag.el = el.parent();
						Self.drag.sheetRow = Self.sheet.grid.getCoordRow(index).parent();
						Self.drag.ttHeight = Self.drag.root[0].offsetHeight;
						Self.drag.rowHeight = Self.drag.el[0].offsetHeight;
					}
					if (Self.drag.el) {
						// prevent default behaviour
						event.preventDefault();
						// cover layout
						Self.els.layout.addClass("cover");
						// bind event
						Self.els.doc.on("mousemove mouseup", Self.resizeColRow);
					}
				}
				break;
			case "mousemove":
				if (Drag.sheetCol) {
					let width = Math.max(event.clientX - Drag.clickX + Drag.colWidth, Drag.minX);
					Drag.el.css({ width });
					Drag.sheetCol.css({ width });
					Drag.tbl.css({ width: Drag.tblWidth + width - Drag.colWidth });
					Drag.root.css({ width: Drag.ttWidth + width - Drag.colWidth });
				} else {
					let height = Math.max(event.clientY - Drag.clickY + Drag.rowHeight, Drag.minY);
					Drag.el.css({ height });
					Drag.sheetRow.css({ height });
					Drag.root.css({ height: Drag.ttHeight + height - Drag.rowHeight });
				}
				Cursor.dispatch({ type: "re-sync-selection" });
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resizeColRow);
				break;
		}
	},
	resizeClip(event) {
		let APP = eniac,
			Self = APP.tools,
			Drag = Self.cDrag,
			el;
		switch (event.type) {
			case "mousedown":
				el = Self.els.root;
				if (!el.hasClass("clip")) {
					return Self.resizeGrid(event);
				}

				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover");

				let Sidebar = APP.sidebar.els.el,
					sheet = Self.sheet.el.find(".tbl-root"),
					type = event.target.className.split(" ")[1].split("-")[0];

				// create drag object
				Self.cDrag = {
					el,
					sheet,
					vResize: type.includes("v"),
					hResize: type.includes("h"),
					clickX: event.clientX,
					clickY: event.clientY,
					input: {
						width: Sidebar.find("input#table-clip-width"),
						height: Sidebar.find("input#table-clip-height"),
						btnWidth: Sidebar.find(`.table-clipping button[arg="width"]`),
						btnHeight: Sidebar.find(`.table-clipping button[arg="height"]`),
					},
					offset: {
						width: sheet.prop("offsetWidth"),
						height: sheet.prop("offsetHeight"),
					},
					diff: {
						width: sheet.prop("offsetWidth") - el.prop("offsetWidth"),
						height: sheet.prop("offsetHeight") - el.prop("offsetHeight"),
					},
					min: {
						width: 320,
						height: 176,
					},
					max: {
						width: Self.sheet.grid.width,
						height: Self.sheet.grid.height,
					}
				};

				// bind events
				Self.els.doc.on("mousemove mouseup", Self.resizeClip);
				break;
			case "mousemove":
				let sheetCss = {},
					toolsCss = {};
				if (Drag.hResize) {
					sheetCss.width = Math.max(Math.min(event.clientX - Drag.clickX + Drag.offset.width, Drag.max.width), Drag.min.width);
					toolsCss.width = sheetCss.width - Drag.diff.width;
					Drag.input.width.val(sheetCss.width);
					Drag.input.btnWidth.toggleAttr("disabled", sheetCss.width < Drag.max.width);
				}
				if (Drag.vResize) {
					sheetCss.height = Math.max(Math.min(event.clientY - Drag.clickY + Drag.offset.height, Drag.max.height), Drag.min.height);
					toolsCss.height = sheetCss.height - Drag.diff.height;
					Drag.input.height.val(sheetCss.height);
					Drag.input.btnHeight.toggleAttr("disabled", sheetCss.height < Drag.max.height);
				}
				Drag.sheet.css(sheetCss);
				Drag.el.css(toolsCss);
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover");
				// unbind events
				Self.els.doc.off("mousemove mouseup", Self.resizeClip);
				break;
		}
	},
	resizeGrid(event) {
		let APP = eniac,
			Self = APP.tools,
			Drag = Self.gDrag,
			add, width, height,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover");

				let sheet = Self.sheet.el.find(".tbl-root"),
					type = event.target.className.split(" ")[1].split("-")[0],
					snap = { x: 90, y: 25 },
					min = Self.sheet.grid.dimension.min,
					tbody = [
						sheet.find(".tbl-col-head > div:nth-child(1) tbody"),
						sheet.find(".tbl-col-head > div:nth-child(2) tbody"),
						sheet.find(".tbl-body > div:nth-child(1) tbody"),
						sheet.find(".tbl-body > div:nth-child(2) tbody"),
						sheet.find(".tbl-col-foot > div:nth-child(1) tbody"),
						sheet.find(".tbl-col-foot > div:nth-child(2) tbody"),
					].map(e => e.length ? e[0] : null);

				// create drag object
				Self.gDrag = {
					el,
					sheet,
					tbody,
					snap,
					clickX: event.clientX,
					clickY: event.clientY,
					vResize: type.includes("v"),
					hResize: type.includes("h"),
					add: { y: 0, x: 0 },
					min: {
						width: Math.max(min.width - snap.x, snap.x),
						height: Math.max(min.height - snap.y, snap.y),
					},
					offset: {
						width: sheet.prop("offsetWidth"),
						height: sheet.prop("offsetHeight"),
					},
					addRow: body => {
						let clone = body.lastChild.cloneNode(true);
						clone.childNodes.map(cell => {
							cell.innerHTML = "";
							[...cell.attributes].map(a => cell.removeAttr(a.name));
						});
						body.appendChild(clone);
					},
					addColumn: body => {
						let cell = body.firstChild.lastChild.cloneNode();
						cell.innerHTML = "";
						[...cell.attributes].map(a => cell.removeAttr(a.name));
						body.childNodes.map(row => row.appendChild(cell.cloneNode()));
					},
					syncRows: (Drag, add) => {
						if (add.y > Drag.add.y) {
							if (Drag.tbody[2]) Drag.addRow(Drag.tbody[2]);
							Drag.addRow(Drag.tbody[3]);
						} else if (add.y < Drag.add.y) {
							if (Drag.tbody[2]) Drag.tbody[2].removeChild(Drag.tbody[2].lastChild);
							Drag.tbody[3].removeChild(Drag.tbody[3].lastChild);
						}
						Drag.add.y = add.y;
					},
					syncCols: (Drag, add) => {
						if (add.x > Drag.add.x) {
							if (Drag.tbody[1]) Drag.addColumn(Drag.tbody[1]);
							if (Drag.tbody[5]) Drag.addColumn(Drag.tbody[5]);
							Drag.addColumn(Drag.tbody[3]);
						} else if (add.x < Drag.add.x) {
							if (Drag.tbody[1]) Drag.tbody[1].childNodes.map(row => row.removeChild(row.lastChild))
							if (Drag.tbody[5]) Drag.tbody[5].childNodes.map(row => row.removeChild(row.lastChild))
							Drag.tbody[3].childNodes.map(row => row.removeChild(row.lastChild))
						}
						Drag.add.x = add.x;
					},
				};

				// bind events
				Self.els.doc.on("mousemove mouseup", Self.resizeGrid);
				break;
			case "mousemove":
				height = Math.max(event.clientY - Drag.clickY + Drag.offset.height, Drag.min.height);
				width = Math.max(event.clientX - Drag.clickX + Drag.offset.width, Drag.min.width);

				// calculate how much to add to table
				add = {
					y: Math.floor((height - Drag.min.height) / Drag.snap.y),
					x: Math.floor((width - Drag.min.width) / Drag.snap.x),
				}
				// this prevents unnecessary DOM manipulation
				if (Drag.vResize && add.y !== Drag.add.y) Drag.syncRows(Drag, add);
				// this prevents unnecessary DOM manipulation
				if (Drag.hResize && add.x !== Drag.add.x) Drag.syncCols(Drag, add);
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover");
				// unbind events
				Self.els.doc.off("mousemove mouseup", Self.resizeGrid);
				break;
		}
	},
	move(event) {
		let APP = eniac,
			Self = APP.tools,
			Drag = Self.drag,
			top, left,
			sheet,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				
				sheet = Self.sheet.el;
				el = $([sheet[0], Self.els.root[0]]);
				// create drag object
				Self.drag = {
					el,
					clickX: event.clientX,
					clickY: event.clientY,
					offset: {
						x: sheet.prop("offsetLeft"),
						y: sheet.prop("offsetTop"),
					}
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.move);
				break;
			case "mousemove":
				top = event.clientY - Drag.clickY + Drag.offset.y;
				left = event.clientX - Drag.clickX + Drag.offset.x;
				Drag.el.css({ top, left });
				break;
			case "mouseup":
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.move);
				break;
		}
	}
}
