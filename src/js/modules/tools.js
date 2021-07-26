
// eniac.tools

{
	init() {
		// fast references
		let root = window.find(".table-tools");
		this.els = {
			root,
			doc: $(document),
			layout: window.find("layout"),
			move: root.find(".tool.move"),
			resizes: root.find(".tool.hv-resize, .tool.v-resize, .tool.h-resize"),
			cols: root.find(".table-cols"),
			rows: root.find(".table-rows"),
		};

		let templ = $(`<table><col width="90"/><tr><td><s></s></td></tr></table>`);
		this.templ = {
			colEl: templ.find("col"),
			trEl: templ.find("tr"),
			tdEl: templ.find("td"),
		};

		// bind event handlers
		this.els.layout.on("mousedown", ".table-cols, .table-rows", this.resizeColRow);
		this.els.move.on("mousedown", this.move);
		this.els.resizes.on("mousedown", this.resize);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools,
			table,
			rows,
			cols,
			width,
			height,
			str,
			el;
		switch (event.type) {
			// custom events
			case "sync-tools-ui":
				table = event.table || Parser.table;
				width = table.prop("offsetWidth");
				height = table.prop("offsetTop") + table.prop("offsetHeight");
				Self.els.root.css({ width, height });
				break;
			case "sync-sheet-table":
				if (event.table && event.table.isSame(Self.table)) return;
				Self.table = event.table || Parser.table;

				Self.dispatch({ ...event, type: "sync-tools-ui" });

				// tools columns
				cols = Self.table.find("tr:nth(0) td");
				str = cols.map(col => {
						let rect = col.getBoundingClientRect();
						return `<col width="${Math.round(rect.width)}"/>`;
					}).join("");
				str += `<tr>`+ cols.map(col => `<td><s></s></td>`).join("") +`</tr>`;
				Self.els.cols.html(str);

				// tools rows
				str = Self.table.find("tr").map(row =>
					`<tr style="height: ${row.offsetHeight}px;"><td><s></s></td></tr>`);
				
				let tblTitle = Self.table.parent().find(".table-title:first");
				if (tblTitle.length) {
					let ttlHeight = tblTitle.prop("offsetHeight") + 3;
					str.unshift(`<tr class="tblTtl" style="height: ${ttlHeight}px;"><td></td></tr>`);
				}
				Self.els.rows.html(str.join(""));

				// active rows/columns
				if (event.updateCoords) {
					Self.dispatch({
						type: "select-coords",
						tblTitle: !!Self.table.parent().find(".table-title:first").length,
						...Self.selected,
					});
				}
				break;
			case "append-row":
				Self.els.rows.find("tbody").append(Self.templ.trEl.clone(true));
				Self.dispatch({ ...event, type: "sync-tools-ui" });
				break;
			case "remove-last-row":
				Self.els.rows.find("tr:last").remove();
				Self.dispatch({ ...event, type: "sync-tools-ui" });
				break;
			case "append-column":
				Self.els.cols.find("col:last").after(Self.templ.colEl.clone(true));
				Self.els.cols.find("td:last").after(Self.templ.tdEl.clone(true));
				Self.dispatch({ ...event, type: "sync-tools-ui" });
				break;
			case "remove-last-column":
				Self.els.cols.find("col:last, td:last").remove();
				Self.dispatch({ ...event, type: "sync-tools-ui" });
				break;
			case "select-coords":
				cols = event.xNum.length ? event.xNum : [event.xNum];
				rows = event.yNum.length ? event.yNum : [event.yNum];

				// remember selected coords
				Self.selected = { xNum: event.xNum, yNum: event.yNum };

				Self.els.cols.find(".active").removeClass("active");
				cols.map(i => Self.els.cols.find("td").get(i).addClass("active"));
				Self.els.rows.find(".active").removeClass("active");
				rows.map(i => Self.els.rows.find("tr").get(i + (event.tblTitle ? 1 : 0)).addClass("active"));

				// UI change on sheet table
				Parser.table.find(".selected, .anchor").removeClass("selected anchor");

				let anchor;
				rows.sort((a, b) => a - b)
					.map(i => {
						Parser.table.find(`tr:nth(${i}) td`).map(td => {
							let cell = $(td);
							if (cols.includes(cell.index())) {
								cell.addClass("selected");
							}
						});
					});
				break;
			case "select-columns":
				el = $(event.target);
				if (el.prop("nodeName") === "S") {
					let rect = el[0].getBoundingClientRect();
					return defiant.menu({
						el,
						invoke: "tool-cols",
						top: rect.top + rect.height + 2,
						left: rect.left,
					});
				}
				// auto blur active cell
				Cursor.dispatch({ type: "blur-cell" });

				// UI change on sheet table
				Parser.table.find(".selected").removeClass("selected");
				cols = Parser.table.find(`td:nth-child(${el.index()+1})`).addClass("selected");

				// selection element
				Cursor.dispatch({ type: "select-column", cols });
				// make all rows "active"
				Self.els.rows.find("tr.active").removeClass("active");
				// make column active
				Self.els.cols.find(".active").removeClass("active");
				el.addClass("active");
				break;
			case "select-rows":
				el = $(event.target);
				if (el.prop("nodeName") === "S") {
					let rect = el[0].getBoundingClientRect();
					return defiant.menu({
						el,
						invoke: "tool-rows",
						top: rect.top,
						left: rect.left + rect.width + 2,
					});
				}
				// auto blur active cell
				Cursor.dispatch({ type: "blur-cell" });

				rows = Parser.table.find("tr").get(el.parent().index());
				// UI change on sheet table
				rows.parent().find("td.selected").removeClass("selected");
				rows.find("td").addClass("selected");

				// selection element
				Cursor.dispatch({ type: "select-row", anchor: rows[0] });
				// make all columns "active"
				Self.els.cols.find("td.active").removeClass("active");
				// make row active
				Self.els.rows.find(".active").removeClass("active");
				el.parent().addClass("active");
				break;
		}
	},
	resizeColRow(event) {
		let APP = eniac,
			Self = APP.tools,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				let el = $(event.target.parentNode),
					tbl = el.parents("table:first");
				if (tbl.hasClass("table-cols") || tbl.hasClass("table-rows")) {
					// create drag object
					Self.drag = {
						tblTools: Self.els.root,
						clickX: event.clientX,
						clickY: event.clientY,
						minX: 30,
						minY: 25,
					};
					// identify if "column" or "row"
					if (event.offsetX > event.target.offsetWidth) {
						Self.drag.el = el;
						Self.drag.sheetCol = Parser.table.find(`td:nth(${Self.drag.el.index()})`);
						Self.drag.ttWidth = Self.drag.tblTools[0].getBoundingClientRect().width;
						Self.drag.colWidth = Self.drag.el[0].getBoundingClientRect().width;
					} else if (event.offsetX < 0) {
						Self.drag.el = el.parent();
						Self.drag.sheetRow = Parser.table.find(`tr:nth(${Self.drag.el.index()})`);
						Self.drag.ttHeight = Self.drag.tblTools[0].offsetHeight;
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
					Drag.tblTools.css({ width: Drag.ttWidth + width - Drag.colWidth });
				} else {
					let height = Math.max(event.clientY - Drag.clickY + Drag.rowHeight, Drag.minY);
					Drag.el.css({ height });
					Drag.sheetRow.css({ height });
					Drag.tblTools.css({ height: Drag.ttHeight + height - Drag.rowHeight });
				}
				Cursor.dispatch({ type: "selection-box" });
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resizeColRow);
				break;
		}
	},
	resize(event) {
		let APP = eniac,
			Self = APP.tools,
			Drag = Self.drag,
			top, left, width, height,
			table,
			last,
			add,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover");
				// blur cell, if any
				Cursor.dispatch({ type: "blur-cell" });

				el = Self.els.root;
				table = Parser.table;
				width = table.prop("offsetWidth");
				height = table.prop("offsetHeight");

				let rType = event.target.className.split(" ")[1].split("-")[0],
					tbody = table.find("tbody"),
					row = tbody.find("tr:last").clone(true),
					dim = Parser.tableAbsDim(table),
					minRow = tbody.find("tr").get(dim.row),
					minCol = minRow.find("td").get(dim.col);
				// empty cells of cloned row
				row.find("td").html("");
				// clone and reset cell node
				let cell = row.find("td:last").clone();
				[...cell[0].attributes].map(a => cell.removeAttr(a.name));

				// create drag object
				Self.drag = {
					el,
					table,
					tbody,
					row,
					cell,
					vResize: rType.includes("v"),
					hResize: rType.includes("h"),
					clickX: event.clientX,
					clickY: event.clientY,
					offset: { width, height },
					add: { y: 0, x: 0 },
					snap: { x: 90, y: 25 },
					min: {
						height: minRow.prop("offsetTop"),
						width: minCol.prop("offsetLeft"),
					},
					syncRows: (Drag, add) => {
						if (add.y > Drag.add.y) {
							// add rows
							Drag.tbody[0].appendChild(Drag.row[0].cloneNode(true));
							// sync tool rows
							Self.dispatch({ type: "append-row", table: tbody.parent() });
						} else if (add.y < Drag.add.y) {
							// delete rows
							Drag.tbody[0].removeChild(Drag.tbody[0].lastChild);
							// sync tool rows
							Self.dispatch({ type: "remove-last-row", table: tbody.parent() });
						}
						Drag.add.y = add.y;
						// updates sidebar values
						APP.sidebar.dispatch({ type: "update-table-row-col", table: Drag.table });
					},
					syncCols: (Drag, add) => {
						if (add.x > Drag.add.x) {
							// add cells
							Drag.tbody.find("tr").map(row => row.appendChild(Drag.cell[0].cloneNode()));
							// sync tool columns
							Self.dispatch({ type: "append-column", table: tbody.parent() });
						} else if (add.x < Drag.add.x) {
							// delete cells
							Drag.tbody.find("tr").map(row => row.removeChild(row.lastChild));
							// sync tool rows
							Self.dispatch({ type: "remove-last-column", table: tbody.parent() });
						}
						Drag.add.x = add.x;
						// updates sidebar values
						APP.sidebar.dispatch({ type: "update-table-row-col", table: Drag.table });
					},
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
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
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	},
	move(event) {
		let APP = eniac,
			Self = APP.tools,
			Drag = Self.drag,
			top, left,
			table,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				
				el = window.find(".sheet, .table-tools");
				table = window.find(".sheet");
				// create drag object
				Self.drag = {
					el,
					clickX: event.clientX,
					clickY: event.clientY,
					offset: {
						x: table.prop("offsetLeft"),
						y: table.prop("offsetTop"),
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
