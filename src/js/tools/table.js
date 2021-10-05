
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
		// instantiate table tools
		this.gridTools = new GridTools();
		// placeholder
		this.grid = {};

		// bind event handlers
		this.els.layout.on("scroll", ".tbl-body > div:nth-child(2)", this.dispatch);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools.table,
			Table = Self.grid,
			top, left, width, height,
			grid, cols, rows, data,
			table, anchor, offset,
			xNum, yNum,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.keystroke":
				anchor = Self.grid.selected.anchor;
				data = { yNum: [], xNum: [] };

				switch (event.char) {
					case "up":
						data.yNum.push(Math.max(anchor.y - 1, 0));
						data.xNum.push(anchor.x);
						break;
					case "down":
						data.yNum.push(Math.min(anchor.y + 1, Self.grid.rows.length - 1));
						data.xNum.push(anchor.x);
						break;
					case "left":
						data.yNum.push(anchor.y);
						data.xNum.push(Math.max(anchor.x - 1, 0));
						break;
					case "right":
						data.yNum.push(anchor.y);
						data.xNum.push(Math.min(anchor.x + 1, Self.grid.rows[0].length - 1));
						break;
				}
				// move selection
				Self.grid.select(data);
				// Self.grid.select({ yNum: [anchor.y], xNum: [anchor.x] });
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
				// prevent table-tool sync, if table-tools aren't focus on event table
				if (!Table.isSame(Self.grid._el)) return;
				// tool cols + rows
				Self.els.cols.find("> div:nth-child(2) table").css({ left });
				Self.els.rows.find("> div:nth-child(2) table").css({ top });
				break;
			// menu events
			case "sort-column-asc":
			case "sort-column-desc":
				console.log("TODO:", event);
				break;
			case "add-column-before":
				xNum = Self.gridTools.getColIndex(event.origin.el[0]);
				Self.grid.addCol(xNum, "before");
				break;
			case "add-column-after":
				xNum = Self.gridTools.getColIndex(event.origin.el[0]);
				Self.grid.addCol(xNum, "after");
				break;
			case "delete-column":
				xNum = Self.gridTools.getColIndex(event.origin.el[0]);
				Self.grid.removeCol(xNum);
				break;
			case "add-row-above":
				yNum = Self.gridTools.getRowIndex(event.origin.el[0]);
				Self.grid.addRow(yNum, "before");
				break;
			case "add-row-below":
				yNum = Self.gridTools.getRowIndex(event.origin.el[0]);
				Self.grid.addRow(yNum, "after");
				break;
			case "delete-row":
				yNum = Self.gridTools.getRowIndex(event.origin.el[0]);
				Self.grid.removeRow(yNum);
				break;
			// custom events
			case "focus-cell":
				// anchor cell
				anchor = event.el;
				table = anchor.parents(".xl-table");
				// focus clicked table
				Self.dispatch({ type: "focus-table", table });

				[yNum, xNum] = Self.grid.getCoord(anchor[0]);
				Self.dispatch({ type: "select-coords", yNum: [yNum], xNum: [xNum], anchor });
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
				// reset current table, if any
				if (Self.grid._el) {
					Self.grid._el.find(".anchor, .selected").removeClass("anchor selected");
				}

				Self.grid = {};
				Self.els.root.addClass("hidden");
				break;
			case "set-table":
				el = event.table || Self.grid._el;
				if (!el.isSame(Self.grid._el)) {
					// zip table cells ordered
					Self.grid = new Grid(el, Self.gridTools);
				}
				// update active tool type
				APP.tools.active = "table";
				break;
			case "sync-table-tools":
				// if (event.table && Self.grid && event.table.isSame(Self.grid._el)) return;
				Self.dispatch({ ...event, type: "set-table" });
				Self.gridTools.syncDim(Self.grid);
				Self.gridTools.syncRowsCols(Self.grid);
				break;
			case "re-sync-selection":
				event.xNum = Self.grid.selected.xNum;
				event.yNum = Self.grid.selected.yNum;
				/* falls through */
			case "select-coords":
				Self.grid.select(event);
				break;
			case "select-columns":
				if (event.target.nodeName === "S") return;
				xNum = [Self.gridTools.getColIndex(event.target)];
				yNum = Self.grid.rows.map((item, index) => index);
				Self.grid.select({ xNum, yNum });
				break;
			case "select-rows":
				if (event.target.nodeName === "S") return;
				xNum = Self.grid.rows[0].map((item, index) => index);
				yNum = [Self.gridTools.getRowIndex(event.target)];
				Self.grid.select({ xNum, yNum });
				break;
		}
	},
	resizeColRow(event) {
		let Self = eniac.tools.table,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				let el = $(event.target.parentNode),
					tbl = el.parents("table:first"),
					tool = tbl.parents(".table-tool:first"),
					isTableCols = tool.hasClass("table-cols"),
					isTableRows = tool.hasClass("table-rows"),
					index;
				if (isTableCols || isTableRows) {
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
						index = Self.gridTools.getColIndex(el[0]);

						Self.drag.el = el;
						Self.drag.tblWidth = tbl.prop("offsetWidth");
						Self.drag.tblCol = Self.grid.getCoordCol(index);
						Self.drag.ttWidth = Self.drag.root[0].getBoundingClientRect().width;
						Self.drag.colWidth = Self.drag.el[0].getBoundingClientRect().width;
					} else if (event.offsetX < 0) {
						index = Self.gridTools.getRowIndex(el[0]);

						Self.drag.el = el.parent();
						Self.drag.tblRow = Self.grid.getCoordRow(index).parent();
						Self.drag.ttHeight = Self.drag.root[0].offsetHeight;
						Self.drag.rowHeight = Self.drag.el[0].offsetHeight;
					} else {
						// table tool "contextmenu arrow" is clicked
						if (isTableRows) {
							defiant.menu({
								el,
								menu: "table-tool-rows",
								add: { top: -4, left: 16 }
							});
						} else {
							defiant.menu({
								el,
								menu: "table-tool-cols",
								add: { top: -1, left: 73 }
							});
						}
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
		let Self = eniac.tools.table,
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
					table = Self.grid._el.find(".tbl-root"),
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
						width: Self.grid.width,
						height: Self.grid.height,
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
		let Self = eniac.tools.table,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown": {
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover");

				let el = Self.els.root,
					grid = Self.grid,
					table = grid._el.find(".tbl-root"),
					dimMin = grid.dimension.min,
					type = event.target.className.split(" ")[1].split("-")[0],
					add = { y: 0, x: 0 },
					snap = { x: 90, y: 25 },
					min = {
						width: Math.max(dimMin.width, snap.x * 3),
						height: Math.max(dimMin.height, snap.y * 4),
					},
					click = {
						x: event.clientX - table.prop("offsetWidth"),
						y: event.clientY - table.prop("offsetHeight"),
					};

				// create drag object
				Self.drag = {
					el,
					min,
					add,
					snap,
					grid,
					click,
					vResize: type.includes("v"),
					hResize: type.includes("h"),
					_max: Math.max,
					_floor: Math.floor,
				};

				// bind events
				Self.els.doc.on("mousemove mouseup", Self.resizeGrid);
				break; }
			case "mousemove":
				let height = Drag._max(event.clientY - Drag.click.y, Drag.min.height),
					width = Drag._max(event.clientX - Drag.click.x, Drag.min.width),
					// calculate how much to add to table
					addY = Drag._floor((height - Drag.min.height) / Drag.snap.y),
					addX = Drag._floor((width - Drag.min.width) / Drag.snap.x);
				// this prevents unnecessary DOM manipulation
				if (Drag.vResize && addY !== Drag.add.y) {
					Drag.grid[ addY > Drag.add.y ? "addRow" : "removeRow" ]();
					Drag.add.y = addY;
				}
				// this prevents unnecessary DOM manipulation
				if (Drag.hResize && addX !== Drag.add.x) {
					Drag.grid[ addX > Drag.add.x ? "addCol" : "removeCol" ]();
					Drag.add.x = addX;
				}
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
		let Self = eniac.tools.table,
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

				// collect info about event
				let table = Self.grid,
					[rowIndex, cellIndex] = table.getCoord(el[0]),
					offset = table.getOffset(el[0]),
					click = {
						x: event.clientX - event.offsetX,
						y: event.clientY - event.offsetY,
					},
					grid = [];
				// adjust position with 1px
				offset.top += 1;
				offset.left += 1;
				// collect cell info
				table.rows.map((item, index) => {
					if (!grid[index]) grid[index] = [];
					item.map(td => {
						let rect = table.getOffset(td);
						// calc "right" & "bottom" for faster loop in mousemove
						rect.bottom = rect.top + rect.height;
						rect.right = rect.left + rect.width;
						grid[index].push(rect);
					});
				});
				
				// create drag object
				Self.drag = {
					el,
					grid,
					click,
					offset,
					rowIndex,
					cellIndex,
				};

				// bind events
				Self.els.doc.on("mousemove mouseup", Self.resizeSelection);
				break;
			case "mousemove":
				let top = Drag.offset.top,
					left = Drag.offset.left,
					height = event.clientY - Drag.click.y,
					width = event.clientX - Drag.click.x,
					yNum = [Drag.rowIndex],
					xNum = [Drag.cellIndex];
				// checks whether box has negative values
				if (height < 0) { top += height; height *= -1; }
				if (width < 0)  { left += width; width *= -1; }
				// less calculation during comparison
				let bottom = top + height,
					right = left + width;
				// loop cell info
				for (let y=0, yl=Drag.grid.length; y<yl; y++) {
					for (let x=0, xl=Drag.grid[y].length; x<xl; x++) {
						let rect = Drag.grid[y][x];
						if (!((bottom < rect.top || top > rect.bottom) || (right < rect.left || left > rect.right))) {
							if (!yNum.includes(y)) yNum.push(y);
							if (!xNum.includes(x)) xNum.push(x);
						}
					}
				}
				// make tool columns + rows active
				Self.grid.select({ yNum, xNum });
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
		let Self = eniac.tools.table,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover hideMouse");
				
				let table = Self.grid._el,
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
					clickTime: Date.now(),
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
				if (Date.now() - Drag.clickTime < 250) {
					// clear selection from grid instance
					Self.grid.unselect();
				}
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
