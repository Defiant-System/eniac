
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
		this.table = {};

		// bind event handlers
		this.els.layout.on("scroll", ".tbl-body > div:nth-child(2)", this.dispatch);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools.table,
			Table = Self.table,
			top, left, width, height,
			grid, cols, rows, data,
			table, selected, anchor, offset,
			xNum, yNum,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.keystroke":
				rows = Self.table.rows;
				selected = Self.table.selected;
				anchor = selected ? selected.anchor : false;
				data = { yNum: [], xNum: [] };
				
				if (!anchor && ["del", "backspace"].includes(event.char)) {
					// notify gracefully
					Self.dispatch({ type: "blur-table" });
					// detach table from DOM
					Table._el.remove();
					// focus sheet root
					return APP.body.trigger("mousedown");
				}

				if (!anchor) {
					// this means, table need to be moved
					return APP.tools.dispatch({ ...event, selected: Self.table._el });
				}

				let isShiftKey = event.shiftKey,
					index;
				// remember "old" selection
				if (isShiftKey) {
					data.xNum.push(...selected.xNum);
					data.yNum.push(...selected.yNum);
				}
				// arrow keys
				switch (event.char) {
					case "up":
						anchor.y = Math.max(anchor.y - 1, 0);
						index = data.yNum.indexOf(anchor.y);
						if (isShiftKey && index >= 0) data.yNum = data.yNum.splice(0, index);
						break;
					case "down":
						anchor.y = Math.min(anchor.y + 1, rows.length - 1);
						index = data.yNum.indexOf(anchor.y);
						if (isShiftKey && index >= 0) data.yNum = data.yNum.splice(index);
						break;
					case "left":
						anchor.x = Math.max(anchor.x - 1, 0);
						index = data.xNum.indexOf(anchor.x);
						if (isShiftKey && index >= 0) data.xNum = data.xNum.splice(0, index);
						break;
					case "right":
						anchor.x = Math.min(anchor.x + 1, rows[0].length - 1);
						index = data.xNum.indexOf(anchor.x);
						if (isShiftKey && index >= 0) data.xNum = data.xNum.splice(index);
						break;
				}

				if (index !== undefined) {
					data.yNum.push(anchor.y);
					data.xNum.push(anchor.x);
					data.anchor = { y: anchor.y, x: anchor.x };
					// move selection
					Self.table.select(data);
					// dispatch focus event
					Self.dispatch({ type: "focus-cell", el: Self.table.selected.anchor.el });
				}
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
				if (!Table.isSame(Self.table._el)) return;
				// tool cols + rows
				Self.els.cols.find("> div:nth-child(2) table").css({ left });
				Self.els.rows.find("> div:nth-child(2) table").css({ top });
				// remove selection
				Self.table.unselect();
				break;
			// menu events
			case "sort-column-asc":
			case "sort-column-desc":
				console.log("TODO:", event);
				break;
			case "add-column-before":
				xNum = Self.gridTools.getColIndex(event.origin.el[0]);
				Self.table.addCol(xNum, "before");
				// sync table tools / selection
				Self.dispatch({ type: "sync-table-tools" });
				Self.dispatch({ type: "re-sync-selection" });
				// update sidebar
				APP.sidebar.table.dispatch({ ...event, type: "update-table-head-footer-rows" });
				APP.sidebar.table.dispatch({ type: "update-table-row-col" });
				break;
			case "add-column-after":
				xNum = Self.gridTools.getColIndex(event.origin.el[0]);
				Self.table.addCol(xNum, "after");
				// sync table tools / selection
				Self.dispatch({ type: "sync-table-tools" });
				Self.dispatch({ type: "re-sync-selection" });
				// update sidebar
				APP.sidebar.table.dispatch({ ...event, type: "update-table-head-footer-rows" });
				APP.sidebar.table.dispatch({ type: "update-table-row-col" });
				break;
			case "delete-column":
				xNum = Self.gridTools.getColIndex(event.origin.el[0]);
				Self.table.removeCol(xNum);
				// sync table tools / selection
				Self.dispatch({ type: "sync-table-tools" });
				Self.dispatch({ type: "re-sync-selection" });
				// update sidebar
				APP.sidebar.table.dispatch({ ...event, type: "update-table-head-footer-rows" });
				APP.sidebar.table.dispatch({ type: "update-table-row-col" });
				break;
			case "add-row-above":
				yNum = Self.gridTools.getRowIndex(event.origin.el[0]);
				Self.table.addRow(yNum, "before");
				// sync table tools / selection
				Self.dispatch({ type: "sync-table-tools" });
				Self.dispatch({ type: "re-sync-selection" });
				// update sidebar
				APP.sidebar.table.dispatch({ ...event, type: "update-table-head-footer-rows" });
				APP.sidebar.table.dispatch({ type: "update-table-row-col" });
				break;
			case "add-row-below":
				yNum = Self.gridTools.getRowIndex(event.origin.el[0]);
				Self.table.addRow(yNum, "after");
				// update sidebar
				APP.sidebar.table.dispatch({ ...event, type: "update-table-head-footer-rows" });
				APP.sidebar.table.dispatch({ type: "update-table-row-col" });
				break;
			case "delete-row":
				yNum = Self.gridTools.getRowIndex(event.origin.el[0]);
				Self.table.removeRow(yNum);
				// update sidebar
				APP.sidebar.table.dispatch({ ...event, type: "update-table-head-footer-rows" });
				APP.sidebar.table.dispatch({ type: "update-table-row-col" });
				break;
			// custom events
			case "focus-cell":
				// anchor cell
				anchor = event.el;
				table = anchor.parents(".xl-table");
				// focus clicked table
				Self.dispatch({ type: "focus-table", table });

				[yNum, xNum] = Self.table.getCoord(anchor[0]);
				Self.dispatch({ type: "select-coords", yNum: [yNum], xNum: [xNum], anchor });

				// update sidebar cell values
				APP.sidebar.table.dispatch({ type: "update-table-cell-size", table });
				break;
			case "blur-cell":
				// reset reference to cell
				Self.anchor = false;
				break;
			case "focus-table":
				// blur any table, if any
				if (Self.table._el) Self.dispatch({ type: "blur-table" });
				// sync tools table
				Self.dispatch({ ...event, type: "sync-table-tools" });
				// update sidebar
				APP.sidebar.dispatch({ ...event, type: "show-table" });
				// show tools for table
				Self.els.root.removeClass("hidden");
				break;
			case "blur-table":
				// reset current table, if any
				if (Self.table._el) {
					Self.table._el.find(".anchor, .selected, .edit-mode").removeClass("anchor selected edit-mode");
				}
				Self.table = {};
				Self.els.root.addClass("hidden");
				// hide footer
				APP.foot.dispatch({ type: "hide" });
				break;
			case "set-table":
				el = event.table || Self.table._el;
				if (el && !el.isSame(Self.table._el)) {
					// zip table cells ordered
					Self.table = new Grid(el, Self.gridTools);
				}
				// update active tool type
				APP.tools.active = "table";
				break;
			case "focus-table-title":
			case "focus-table-caption":
				// prepare element for edit-mode
				event.el.addClass("edit-mode");
				// hide footer
				APP.foot.dispatch({ type: "hide" });
				// table._tools._selection
				if (Self.table._el) {
					Self.table.unselect();
				}
				break;
			case "sync-table-tools":
				// if (event.table && Self.table && event.table.isSame(Self.table._el)) return;
				Self.dispatch({ ...event, type: "set-table" });
				Self.gridTools.syncDim(Self.table);
				Self.gridTools.syncRowsCols(Self.table);
				break;
			case "re-sync-selection":
				event.xNum = Self.table.selected.xNum;
				event.yNum = Self.table.selected.yNum;
				event.anchor = Self.table.selected.anchor;
				/* falls through */
			case "select-coords":
				Self.table.select(event);
				break;
			case "select-columns":
				if (event.target.nodeName === "S") return;
				xNum = [Self.gridTools.getColIndex(event.target)];
				yNum = Self.table.rows.map((item, index) => index);
				anchor = Self.table.selected.anchor;
				Self.table.select({ xNum, yNum, anchor });
				break;
			case "select-rows":
				if (event.target.nodeName === "S") return;
				xNum = Self.table.rows[0].map((item, index) => index);
				yNum = [Self.gridTools.getRowIndex(event.target)];
				anchor = Self.table.selected.anchor;
				Self.table.select({ xNum, yNum, anchor });
				break;
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
					isTableCols = tool.hasClass("table-cols"),
					isTableRows = tool.hasClass("table-rows"),
					index;
				if (isTableCols || isTableRows) {
					// create drag object
					Self.drag = {
						tbl,
						grid: Self.table,
						root: Self.els.root,
						sidebar: APP.sidebar.table,
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
						Self.drag.tblCol = Self.table.getCoordCol(index);
						Self.drag.ttWidth = Self.drag.root[0].getBoundingClientRect().width;
						Self.drag.colWidth = Self.drag.el[0].getBoundingClientRect().width;
					} else if (event.offsetX < 0) {
						index = Self.gridTools.getRowIndex(el[0]);

						Self.drag.el = el.parent();
						Self.drag.tblRow = Self.table.getCoordRow(index).parent();
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
				if (Drag.grid.selected) {
					Self.dispatch({ type: "re-sync-selection" });
				}
				// TODO: if selection includes anchor - update cell dimensions
				Drag.sidebar.dispatch({ type: "update-table-cell-size" });
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

				let sEl = APP.sidebar.els.el,
					table = Self.table._el.find(".tbl-root"),
					type = event.target.className.split(" ")[1].split("-")[0];

				// create drag object
				Self.cDrag = {
					el,
					table,
					sidebar: APP.sidebar.table,
					vResize: type.includes("v"),
					hResize: type.includes("h"),
					clickX: event.clientX,
					clickY: event.clientY,
					input: {
						width: sEl.find("input#table-clip-width"),
						height: sEl.find("input#table-clip-height"),
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
						width: +sEl.find(`.table-box-size input[name="width"]`).attr("min"),
						height: +sEl.find(`.table-box-size input[name="height"]`).attr("min"),
					},
					max: {
						width: Self.table.width,
						height: Self.table.height,
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
				}
				if (Drag.vResize) {
					tableCss.height = Math.max(Math.min(event.clientY - Drag.clickY + Drag.offset.height, Drag.max.height), Drag.min.height);
					toolsCss.height = tableCss.height - Drag.diff.height;
					Drag.input.height.val(tableCss.height);
				}
				Drag.table.css(tableCss);
				Drag.el.css(toolsCss);
				// update sidebar
				Drag.sidebar.dispatch({ type: "update-table-box-size" });
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
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown": {
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover");

				let el = Self.els.root,
					grid = Self.table,
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
					sidebar: APP.sidebar.table,
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
					// update sidebar
					Drag.sidebar.dispatch({ type: "update-table-row-col" });
				}
				// this prevents unnecessary DOM manipulation
				if (Drag.hResize && addX !== Drag.add.x) {
					Drag.grid[ addX > Drag.add.x ? "addCol" : "removeCol" ]();
					Drag.add.x = addX;
					// update sidebar
					Drag.sidebar.dispatch({ type: "update-table-row-col" });
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
	selectionHandles(event) {
		let Self = eniac.tools.table,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover");

				let el = $(event.target),
					type = el.prop("className").split(" ")[1],
					table = Self.table,
					selEl = table._tools._selection,
					offset = {
						y: selEl.prop("offsetTop"),
						x: selEl.prop("offsetLeft"),
						w: selEl.prop("offsetWidth"),
						h: selEl.prop("offsetHeight"),
					},
					click = {
						y: event.clientY - event.offsetY,
						x: event.clientX - event.offsetX,
					},
					grid = [];
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
					type,
					grid,
					table,
					click,
					offset,
					anchor: {
						y: table.selected.anchor.y,
						x: table.selected.anchor.x,
					}
				};
				// bind events
				Self.els.doc.on("mousemove mouseup", Self.selectionHandles);
				break;
			case "mousemove":
				let dim = {
						top: Drag.offset.y + 4,
						left: Drag.offset.x + 4,
						height: Drag.offset.h - 8,
						width: Drag.offset.w - 8,
					},
					anchor = Drag.anchor,
					yNum = [],
					xNum = [];
				if (Drag.type === "top-left") {
					// resize: north-east
					dim.top += event.clientY - Drag.click.y;
					dim.left += event.clientX - Drag.click.x;
					dim.width += Drag.click.x - event.clientX;
					dim.height += Drag.click.y - event.clientY;
				} else {
					// resize: south-west
					dim.width += event.clientX - Drag.click.x;
					dim.height += event.clientY - Drag.click.y;
				}
				if (dim.width < 0 || dim.height < 0) return;
				// less calculation during comparison
				dim.bottom = dim.top + dim.height;
				dim.right = dim.left + dim.width;
				// loop cell info
				for (let y=0, yl=Drag.grid.length; y<yl; y++) {
					for (let x=0, xl=Drag.grid[y].length; x<xl; x++) {
						let rect = Drag.grid[y][x];
						if (!((dim.bottom < rect.top || dim.top > rect.bottom)
								|| (dim.right < rect.left || dim.left > rect.right))) {
							if (!yNum.includes(y)) yNum.push(y);
							if (!xNum.includes(x)) xNum.push(x);
						}
					}
				}
				if (Drag.type === "bottom-right") {
					anchor.y = yNum[yNum.length-1];
					anchor.x = xNum[xNum.length-1];
				}
				// make tool columns + rows active
				Drag.table.select({ yNum, xNum, anchor });
				break;
			case "mouseup":
				// TODO
				console.log( "trigger table sidebar; 'populate-table-values'" );
				// uncover layout
				Self.els.layout.removeClass("cover");
				// unbind events
				Self.els.doc.off("mousemove mouseup", Self.selectionHandles);
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
				if (Self.table.selected && event.shiftKey) {
					let { yNum, xNum } = Self.table.selected,
						[y, x] = Self.table.getCoord(el[0]),
						anchor = { x, y },
						min, max;
					// selected rows
					min = Math.min(...yNum, y);
					max = Math.max(...yNum, y);
					yNum = [y, ...Array(max-min)].map((e,i) => min + i);
					// selected columns
					min = Math.min(...xNum, x);
					max = Math.max(...xNum, x);
					xNum = [x, ...Array(max-min)].map((e,i) => min + i);
					// select cells
					Self.table.select({ yNum, xNum, anchor });
					// change event origin cell
					el = Self.table.getCoordCell(yNum[0], xNum[0]);
				} else {
					// no shiftKey - single cell selection
					Self.dispatch({ type: "focus-cell", el });
				}
				// collect info about event
				let table = Self.table,
					[rowIndex, colIndex] = table.getCoord(el[0]),
					// define anchor cell
					anchor = {
						y: rowIndex,
						x: colIndex,
					},
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
					table,
					click,
					offset,
					anchor,
					rowIndex,
					colIndex,
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
					xNum = [Drag.colIndex];
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
				Self.table.select({ yNum, xNum, anchor: Drag.anchor });
				break;
			case "mouseup":
				// no shiftKey - single cell selection
				APP.sidebar.table.dispatch({ type: "update-cell-border-options" });
				// show footer
				APP.foot.dispatch({ type: "render-cell" });
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
				
				let table = Self.table._el,
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
					sidebar: APP.sidebar.table,
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
				// update sidebar
				Drag.sidebar.dispatch({ type: "update-table-box-position" });
				break;
			case "mouseup":
				if (Date.now() - Drag.clickTime < 250) {
					// clear selection from grid instance
					Self.table.unselect();
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
