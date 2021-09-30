
// eniac.tools.table

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
			selection: root.find(".selection"),
			resizes: root.find(".tool.hv-resize, .tool.v-resize, .tool.h-resize"),
		};
		// placeholder
		this.table = {};

		// bind event handlers
		this.els.layout.on("scroll", ".tbl-body > div:nth-child(2)", this.dispatch);
		this.els.layout.on("mousedown", ".table-cols, .table-rows", this.resizeColRow);
		// this.els.resizes.on("mousedown", this.resizeClip);
		// this.els.move.on("mousedown", this.move);

		// temp
		setTimeout(() => {
			let table = window.find(".xl-table:nth(0)");
			this.dispatch({ type: "focus-table", table });

			this.dispatch({
				type: "select-coords",
				xNum: [1, 2],
				yNum: [4, 5],
			});
		}, 400);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools.table,
			Table = Self.table,
			top, left, width, height,
			grid, cols, rows,
			table, anchor, offset,
			xNum, yNum,
			el;
		switch (event.type) {
			// system events
			case "window.keystroke":
				console.log(event);
				break;
			// native events
			case "scroll":
				el = $(event.target);
				Table = el.parents(".xl-table:first");
				top = -event.target.scrollTop;
				left = -event.target.scrollLeft;
				
				// vertical sync
				Table.find(`.tbl-col-head > div:nth(1) table,
							.tbl-col-foot > div:nth(1) table`).css({ left });
				// horizontal sync
				Table.find(".tbl-body div:nth-child(1) table").css({ top });

				if (!Table.isSame(Self.table.el)) return;

				// tool cols + rows
				Self.els.cols.find("> div:nth-child(2) table").css({ left });
				Self.els.rows.find("> div:nth-child(2) table").css({ top });
				break;
			// custom events
			case "focus-cell":
				// anchor cell
				anchor = event.el;
				table = anchor.parents(".xl-table");
				// focus clicked table
				Self.dispatch({ type: "focus-table", table });

				[yNum, xNum] = Self.table.grid.getCoord(anchor[0]);
				Self.dispatch({ type: "select-coords", yNum: [yNum], xNum: [xNum] });
				// UI select element
				Self.dispatch({ ...event, anchor, type: "select-cell" });
				break;
			case "blur-cell":
				// reset reference to cell
				Self.anchor = false;
				break;
			case "focus-table":
				// sync tools table
				Self.dispatch({ ...event, type: "sync-table-tools" });
				// update sidebar
				APP.sidebar.dispatch({ ...event, type: "show-table" });
				// show tools for table
				Self.els.root.removeClass("hidden");
				break;
			case "blur-table":
				Self.table = {};
				Self.els.root.addClass("hidden");
				break;
			case "set-table":
				el = event.table;
				// zip table cells ordered
				grid = Self.grid.table(el);

				Self.table = {
					el,
					grid,
					colNum: grid.getRowCells(0).length,
					rowNum: grid.rows.length,
				};
				// update active tool type
				APP.tools.active = "table";
				break;
			case "sync-tools-dim":
				top = Table.el.prop("offsetTop");
				left = Table.el.prop("offsetLeft");
				width = Table.el.prop("offsetWidth");
				height = Table.el.prop("offsetHeight");
				Self.els.root.css({ top, left, width, height });

				el = Table.el.find(".table-title");
				top = (el.prop("offsetHeight") + parseInt(el.css("margin-bottom"), 10));
				top = isNaN(top) ? 0 : top;
				Self.els.rows.css({ "--rows-top": `${top}px` });
				break;
			case "sync-table-tools":
				// if (event.table && Self.table && event.table.isSame(Self.table.el)) return;
				Self.dispatch({ ...event, type: "set-table" });
				Self.dispatch({ ...event, type: "sync-tools-dim" });

				// toggle between "clip" resizers
				if (Self.table.el.hasClass("clipped")) Self.els.root.addClass("clip");
				else Self.els.root.removeClass("clip");

				let toolCols = Self.els.cols.find("> div").html(""),
					toolRows = Self.els.rows.find("> div").html(""),
					cNames = [],
					rNames = [];
				/*
				 * tools columns
				 */
				cols = Self.table.el.find(".tbl-col-head > div");
				if (!cols.length || !cols.find("tr:nth(0) td").length) {
					cols = Self.table.el.find(".tbl-body > div");
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
				rows = Self.table.el.find(".tbl-root > div > div:nth-child(1)");
				if (!rows.find("tr").length) {
					rows = Self.table.el.find(".tbl-root > div > div:nth-child(2)");
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
				Self.table.toolGrid = Self.grid.tools();
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
			case "re-sync-selection":
			case "select-cell":
				anchor = event.anchor || Self.anchor;
				table = anchor.parents(".tbl-root:first");
				offset = APP.popups.getOffset(anchor[0], table[0]);
				Self.els.selection.addClass("show").css(offset);

				// save anchor reference
				Self.anchor = anchor;
				break;
			case "select-columns":
			case "select-rows":
				console.log(event);
				break;
		}
	},
	grid: {
		tools() {
			let Els = eniac.tools.table.els,
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
				},
				// col head rows
				r1 = Els.cols.find("> div:nth-child(1) tr"),
				r2 = Els.cols.find("> div:nth-child(2) tr");
			
			if (r1.length) r1.map((row, i) => grid.cols.push(...$("td", row), ...r2.get(i).find("td")));
			else r2.map((row, i) => grid.cols.push(...$("td", row)));

			return grid;
		},
		table(table) {
			let r1, r2,
				grid = {
					table,
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
						return this.table.find(".tbl-body > div > table").reduce((acc, el) => acc + el.offsetWidth, 0);
					},
					get height() {
						return this.table.find(".tbl-root div > div:nth-child(2) > table").reduce((acc, el) => acc + el.offsetHeight, 0);
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
			r1 = table.find(".tbl-col-head > div:nth-child(1) tr");
			r2 = table.find(".tbl-col-head > div:nth-child(2) tr");
			if (r1.length) r1.map((row, i) => grid.rows.push([...$("td", row), ...r2.get(i).find("td")]));
			else r2.map((row, i) => grid.rows.push([...$("td", row)]));
			// column layout info
			grid.layout.rows.head = r1.length || r2.length;

			// col body rows
			r1 = table.find(".tbl-body > div:nth-child(1) tr");
			r2 = table.find(".tbl-body > div:nth-child(2) tr");
			if (r1.length) r1.map((row, i) => grid.rows.push([...$("td", row), ...r2.get(i).find("td")]));
			else r2.map((row, i) => grid.rows.push([...$("td", row)]));
			// column layout info
			grid.layout.rows.body = r1.length || r2.length;
			grid.layout.cols.head = r1.length ? r1.get(0).find("td").length : 0;
			grid.layout.cols.body = r2.get(0).find("td").length;

			// all cells
			grid.cells.push(...table.find(".tbl-col-head td"));
			r1.map((row, i) => {
				grid.cells.push( ...$("td", row) );
				grid.cells.push( ...r2.get(i).find("td") );
			});
			grid.cells.push(...table.find(".tbl-col-foot td"));
			// col foot rows
			r1 = table.find(".tbl-col-foot > div:nth-child(1) tr");
			r2 = table.find(".tbl-col-foot > div:nth-child(2) tr");
			if (r1.length) r1.map((row, i) => grid.rows.push([...$("td", row), ...r2.get(i).find("td")]));
			else r2.map((row, i) => grid.rows.push([...$("td", row)]));
			// column layout info
			grid.layout.rows.foot = r1.length || r2.length;

			return grid;
		}
	},
	resizeColRow(event) {
		let APP = eniac,
			Self = APP.tools.table,
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
						index = Self.table.toolGrid.getColIndex(el[0]);

						Self.drag.el = el;
						Self.drag.tblWidth = tbl.prop("offsetWidth");
						Self.drag.tblCol = Self.table.grid.getCoordCol(index);
						Self.drag.ttWidth = Self.drag.root[0].getBoundingClientRect().width;
						Self.drag.colWidth = Self.drag.el[0].getBoundingClientRect().width;
					} else if (event.offsetX < 0) {
						index = Self.table.toolGrid.getRowIndex(el[0]);

						Self.drag.el = el.parent();
						Self.drag.tblRow = Self.table.grid.getCoordRow(index).parent();
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
				if (Drag.tblCol) {
					let width = Math.max(event.clientX - Drag.clickX + Drag.colWidth, Drag.minX);
					Drag.el.css({ width });
					Drag.tblCol.css({ width });
					Drag.tbl.css({ width: Drag.tblWidth + width - Drag.colWidth });
					Drag.root.css({ width: Drag.ttWidth + width - Drag.colWidth });
				} else {
					let height = Math.max(event.clientY - Drag.clickY + Drag.rowHeight, Drag.minY);
					Drag.el.css({ height });
					Drag.tblRow.css({ height });
					Drag.root.css({ height: Drag.ttHeight + height - Drag.rowHeight });
				}
				Self.dispatch({ type: "re-sync-selection" });
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
			Self = APP.tools.table,
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
					table = Self.table.el.find(".tbl-root"),
					type = event.target.className.split(" ")[1].split("-")[0];

				// create drag object
				Self.cDrag = {
					el,
					table,
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
						width: table.prop("offsetWidth"),
						height: table.prop("offsetHeight"),
					},
					diff: {
						width: table.prop("offsetWidth") - el.prop("offsetWidth"),
						height: table.prop("offsetHeight") - el.prop("offsetHeight"),
					},
					min: {
						width: 320,
						height: 176,
					},
					max: {
						width: Self.table.grid.width,
						height: Self.table.grid.height,
					}
				};

				// bind events
				Self.els.doc.on("mousemove mouseup", Self.resizeClip);
				break;
			case "mousemove":
				let tableCss = {},
					toolsCss = {};
				if (Drag.hResize) {
					tableCss.width = Math.max(Math.min(event.clientX - Drag.clickX + Drag.offset.width, Drag.max.width), Drag.min.width);
					toolsCss.width = tableCss.width - Drag.diff.width;
					Drag.input.width.val(tableCss.width);
					Drag.input.btnWidth.toggleAttr("disabled", tableCss.width < Drag.max.width);
				}
				if (Drag.vResize) {
					tableCss.height = Math.max(Math.min(event.clientY - Drag.clickY + Drag.offset.height, Drag.max.height), Drag.min.height);
					toolsCss.height = tableCss.height - Drag.diff.height;
					Drag.input.height.val(tableCss.height);
					Drag.input.btnHeight.toggleAttr("disabled", tableCss.height < Drag.max.height);
				}
				Drag.table.css(tableCss);
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
			Self = APP.tools.table,
			Drag = Self.gDrag,
			add, width, height,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover");

				let table = Self.table.el.find(".tbl-root"),
					type = event.target.className.split(" ")[1].split("-")[0],
					min = Self.table.grid.dimension.min,
					snap = { x: 90, y: 25 },
					tbody = [
						table.find(".tbl-col-head > div:nth-child(2) tbody"),
						table.find(".tbl-body > div:nth-child(1) tbody"),
						table.find(".tbl-body > div:nth-child(2) tbody"),
						table.find(".tbl-col-foot > div:nth-child(2) tbody"),
						Self.els.cols.find("> div:nth-child(2) tbody"),
						Self.els.rows.find("> div:nth-child(2) tbody"),
					].map(e => e.length ? e[0] : null);

				// create drag object
				Self.gDrag = {
					el: Self.els.root,
					table,
					tbody,
					snap,
					clickX: event.clientX,
					clickY: event.clientY,
					vResize: type.includes("v"),
					hResize: type.includes("h"),
					toolWidth: tbody[4].parentNode.offsetWidth,
					add: { y: 0, x: 0 },
					min: {
						width: Math.max(min.width, snap.x * 5),
						height: Math.max(min.height, snap.y * 6),
					},
					offset: {
						width: table.prop("offsetWidth"),
						height: table.prop("offsetHeight"),
					},
					addRow: body => {
						let clone = body.lastChild.cloneNode(true);
						clone.childNodes.map(cell => {
							cell.innerHTML = "";
							cell.className = "";
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
							if (Drag.tbody[1]) Drag.addRow(Drag.tbody[1]);
							Drag.addRow(Drag.tbody[2]);
							Drag.addRow(Drag.tbody[5]);
							Drag.el.css({ height: Drag.table.prop("offsetHeight") });
						} else if (add.y < Drag.add.y) {
							if (Drag.tbody[1]) Drag.tbody[1].removeChild(Drag.tbody[1].lastChild);
							Drag.tbody[2].removeChild(Drag.tbody[2].lastChild);
							Drag.tbody[5].removeChild(Drag.tbody[5].lastChild);
							Drag.el.css({ height: Drag.table.prop("offsetHeight") });
						}
						Drag.add.y = add.y;
					},
					syncCols: (Drag, add) => {
						if (add.x > Drag.add.x) {
							if (Drag.tbody[0]) Drag.addColumn(Drag.tbody[0]);
							if (Drag.tbody[3]) Drag.addColumn(Drag.tbody[3]);
							Drag.addColumn(Drag.tbody[2]);
							Drag.addColumn(Drag.tbody[4]);

							Drag.toolWidth += Drag.snap.x;
							Drag.tbody[4].parentNode.style.width = `${Drag.toolWidth}px`;
							Drag.el.css({ width: Drag.table.prop("offsetWidth") });
						} else if (add.x < Drag.add.x) {
							if (Drag.tbody[0]) Drag.tbody[0].childNodes.map(row => row.removeChild(row.lastChild))
							if (Drag.tbody[3]) Drag.tbody[3].childNodes.map(row => row.removeChild(row.lastChild))
							Drag.tbody[2].childNodes.map(row => row.removeChild(row.lastChild))
							Drag.tbody[4].childNodes.map(row => row.removeChild(row.lastChild))
							
							Drag.toolWidth -= Drag.snap.x;
							Drag.tbody[4].parentNode.style.width = `${Drag.toolWidth}px`;
							Drag.el.css({ width: Drag.table.prop("offsetWidth") });
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
				};

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
	resizeSelection(event) {
		let APP = eniac,
			Self = APP.tools.table,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover");

				// auto focus cell
				let el = $(event.target);
				Self.dispatch({ type: "focus-cell", el });

				let offset = {
						top: el.prop("offsetTop"),
						left: el.prop("offsetLeft"),
						width: el[0].getBoundingClientRect().width,
						height: el.prop("offsetHeight"),
					},
					click = {
						x: event.clientX - event.offsetX,
						y: event.clientY - event.offsetY,
					},
					table = Self.table.grid,
					[rowIndex, cellIndex] = table.getCoord(el[0]),
					cells = table.rows[0].map((td, index) => {
						let rect = td.getBoundingClientRect();
						return {
							index,
							left: rect.x - offset.left,
							right: rect.right - offset.left,
						};
					}),
					rows = table.rows.map((item, index) => {
						let rect = item[0].parentNode.getBoundingClientRect();
						return {
							index,
							top: rect.y - offset.top,
							bottom: rect.bottom - offset.top,
						};
					});

				// create drag object
				Self.drag = {
					el,
					click,
					offset,
					cellIndex,
					rowIndex,
					grid: {
						x: [offset.width, ...cells],
						y: [offset.height, ...rows],
					},
				};

				// bind events
				Self.els.doc.on("mousemove mouseup", Self.resizeSelection);
				break;
			case "mousemove":
				let top = Drag.offset.top,
					left = Drag.offset.left,
					height = event.clientY - Drag.click.y + Drag.offset.height,
					width = event.clientX - Drag.click.x + Drag.offset.width,
					yNum,
					xNum;

				if (height < 0) {
					// top = event.clientY - Drag.clickY + Drag.offset.top;
					// Drag.grid.filterY = Drag.grid.y.filter(b => b.top > top);
					// top = Math.min(...Drag.grid.filterY.map(b => b.top));
					// height = Drag.offset.top + Drag.offset.height - top;
					// // get columns to be highlighted
					// yNum = [Drag.rowIndex, ...Drag.grid.filterY.map(b => b.index).filter(i => i < Drag.rowIndex)];
				} else {
					Drag.grid.filterY = Drag.grid.y.filter(b => b.bottom < height);
					height = Math.max(...Drag.grid.filterY.map(b => b.bottom));
					// get columns to be highlighted
					yNum = [Drag.rowIndex, ...Drag.grid.filterY.map(b => b.index).filter(i => i > Drag.rowIndex)];
				}

				if (width < 0) {
					// left = event.clientX - Drag.clickX + Drag.offset.left;
					// Drag.grid.filterX = Drag.grid.x.filter(b => b.left > left);
					// left = Math.min(...Drag.grid.filterX.map(b => b.left));
					// width = Drag.offset.left + Drag.offset.width - left;
					// // get rows to be highlighted
					// xNum = [Drag.cellIndex, ...Drag.grid.filterX.map(b => b.index).filter(i => i < Drag.cellIndex)];
				} else {
					Drag.grid.filterX = Drag.grid.x.filter(b => b.right < width);
					width = Math.max(...Drag.grid.filterX.map(b => b.right));
					// get rows to be highlighted
					xNum = [Drag.cellIndex, ...Drag.grid.filterX.map(b => b.index).filter(i => i > Drag.cellIndex)];
				}

				// make tool columns + rows active
				Self.dispatch({ type: "select-coords", yNum, xNum });
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover");
				// unbind events
				Self.els.doc.off("mousemove mouseup", Self.resizeSelection);
				break;
		}
	},
	move(event) {
		let APP = eniac,
			Self = APP.tools.table,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover hideMouse");
				
				let table = Self.table.el,
					el = $([table[0], Self.els.root[0]]),
					offset = {
						y: table.prop("offsetTop"),
						x: table.prop("offsetLeft"),
					},
					guides = new Guides({
						offset: {
							el: table[0],
							w: table.width(),
							h: table.height(),
						},
					});

				// create drag object
				Self.drag = {
					el,
					guides,
					click: {
						y: event.clientY - offset.y,
						x: event.clientX - offset.x,
					},
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.move);
				break;
			case "mousemove":
				let pos = {
						top: event.clientY - Drag.click.y,
						left: event.clientX - Drag.click.x,
					};
				// "filter" position with guide lines
				Drag.guides.snapPos(pos);
				// apply position on table (and table-tools)
				Drag.el.css(pos);
				break;
			case "mouseup":
				// hide guides
				Drag.guides.reset();
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.move);
				break;
		}
	}
}
