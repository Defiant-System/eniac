
const Cursor = {
	init() {
		// fast references
		let root = window.find(".selection");
		this.els = {
			root,
			doc: $(document),
			layout: window.find("layout"),
			tools: window.find(".table-tools"),
			selText: root.find("textarea"),
			handles: root.find(".handle"),
		};

		// bind event handlers
		this.els.handles.on("mousedown", this.resize);
		this.els.layout.on("mousedown", ".sheet td", this.resize);
	},
	active: {
		get cell() {
			return Cursor.anchor || null;
		},
		get row() {
			let active = Cursor.anchor;
			return active ? active.parent() : null;
		},
		get table() {
			return Parser.table || null;
		},
	},
	dispatch(event) {
		let APP = eniac,
			Self = Cursor,
			top, left, width, height,
			xNum, yNum,
			anchor,
			table,
			next,
			v = "",
			el;
		switch (event.type) {
			// system events
			case "window.keystroke":
				// handling of special keys
				switch (event.char) {
					case "esc":
						Self.dispatch({ type: "blur-table" });
						break;
					case "tab":
					case "return":
						Self.dispatch({ type: "move-right" });
						break;
					case "del":
					case "backspace":
						// empty selected cells
						Parser.table.find("td.selected").html(v).attr({ v });
						break;
					case "up":
					case "down":
					case "right":
					case "left":
						Self.dispatch({ type: "move-"+ event.char, shift: event.shiftKey });
						break;
				}
				break;
			// custom events
			case "move-up":
			case "move-down":
				if (!Self.anchor) return;
				// course of action for event
				if (event.shift) {
					let anchorStart = Self.anchor,
						firstTd = Parser.table.find(`td.selected:first`),
						lastTd = Parser.table.find(`td.selected:last`),
						moveTd = firstTd.parent().index() === anchorStart.parent().index() ? lastTd : firstTd;
					xNum = (firstTd.index() === anchorStart.index() ? lastTd : firstTd).index();
					yNum = moveTd.parent().index() + (event.type === "move-up" ? -1 : 1);
					let anchorEnd = Parser.getCellByCoord(xNum, yNum);
					if (anchorEnd.length) {
						// resize selector box
						Self.dispatch({ type: "select-rectangle", anchorStart, anchorEnd });
					}
				} else {
					xNum = Self.anchor.index();
					yNum = Self.anchor.parent().index() + (event.type === "move-up" ? -1 : 1);
					next = Parser.getCellByCoord(xNum, yNum);
					if (next.length) {
						Self.dispatch({ type: "focus-cell", anchor: next[0] });
					}
				}
				break;
			case "move-right":
			case "move-left":
				if (!Self.anchor) return;
				// course of action for event
				if (event.shift) {
					let anchorStart = Self.anchor,
						firstTd = Parser.table.find(`td.selected:first`),
						lastTd = Parser.table.find(`td.selected:last`),
						moveTd = firstTd.index() === anchorStart.index() ? lastTd : firstTd;
					xNum = moveTd.index() + (event.type === "move-left" ? -1 : 1);
					yNum = (firstTd.parent().index() === anchorStart.parent().index() ? lastTd : firstTd).parent().index();
					let anchorEnd = Parser.getCellByCoord(xNum, yNum);
					if (anchorEnd.length) {
						// resize selector box
						Self.dispatch({ type: "select-rectangle", anchorStart, anchorEnd });
					}
				} else {
					next = Self.anchor[ event.type === "move-right" ? "next" : "prev" ]("td");
					if (next.length) {
						Self.dispatch({ type: "focus-cell", anchor: next[0] });
					}
				}
				break;
			case "selection-box": {
				let cells = Parser.table.find("td.selected"),
					anchorStart = cells[0],
					anchorEnd = cells[cells.length-1],
					top = anchorStart.offsetTop - 2,
					left = anchorStart.offsetLeft - 2,
					width = anchorEnd.offsetLeft + anchorEnd.getBoundingClientRect().width - left + 3,
					height = anchorEnd.offsetTop + anchorEnd.offsetHeight - top + 3;
					// ui resize selection box
					Self.els.root.css({ top, left, width, height, });
				} break;
			case "select-rectangle":
				let startYindex = event.anchorStart.parent().index(),
					startXindex = event.anchorStart.index(),
					endYindex = event.anchorEnd.parent().index(),
					endXindex = event.anchorEnd.index(),
					lowY = Math.min(startYindex, endYindex),
					lowX = Math.min(startXindex, endXindex),
					highY = Math.max(startYindex, endYindex),
					highX = Math.max(startXindex, endXindex);
				yNum = [...Array(highY - lowY + 1)].map((e,i) => lowY + i);
				xNum = [...Array(highX - lowX + 1)].map((e,i) => lowX + i);
				APP.tools.dispatch({ type: "select-coords", resize: true, yNum, xNum });
				// UI indicate anchor cell
				event.anchorStart.addClass("anchor");

				// calculate selection boundries
				let boxes = Parser.table.find(`td.selected`).map(td => ({
						top: td.offsetTop,
						left: td.offsetLeft,
						right: td.offsetLeft + td.getBoundingClientRect().width,
						bottom: td.offsetTop + td.offsetHeight,
					}));
				top = Math.min(...boxes.map(b => b.top)) - 2;
				left = Math.min(...boxes.map(b => b.left)) - 2;
				width = Math.max(...boxes.map(b => b.right)) - left + 3;
				height = Math.max(...boxes.map(b => b.bottom)) - top + 3;
				// ui resize selection box
				Self.els.root.css({ top, left, width, height, });
				// cell to footer row
				APP.foot.dispatch({ type: "render-cells" });
				break;
			case "focus-cell":
				// anchor cell
				anchor = $(event.anchor);
				table = anchor.parents("table.sheet");

				if (event.shift) {
					// resize selector box
					return Self.dispatch({
						type: "select-rectangle",
						anchorStart: Self.anchor,
						anchorEnd: anchor,
					});
				}
				// focus clicked table
				Self.dispatch({ type: "focus-table", table });
				// sync tools table
				APP.tools.dispatch({ type: "sync-sheet-table", table });
				// cell to footer row
				APP.foot.dispatch({ type: "render-cell", anchor });
				// make column + row active
				xNum = anchor.index();
				yNum = anchor.parent().index();
				APP.tools.dispatch({ type: "select-coords", yNum, xNum });
				// UI select element
				Self.dispatch({ ...event, anchor, type: "select-cell" });
				break;
			case "blur-cell":
				// reset reference to cell
				Self.anchor = false;
				break;
			case "focus-table":
				if (event.table.isSame(Parser.table)) return;
				// set table for parser
				Parser.setTable(event.table);
				// show tools for table
				Self.els.tools.removeClass("hidden");
				break;
			case "blur-table":
				// auto blur active cell
				Self.dispatch({ type: "blur-cell" });
				// reset parser
				Parser.reset();
				// hide tools
				Self.els.tools.addClass("hidden");
				// hide footer
				APP.foot.dispatch({ type: "hide" });
				break;
			case "select-column":
				let first = event.cols[0] ,
					last = event.cols[event.cols.length - 1];
				top = first.offsetTop - 2;
				left = first.offsetLeft - 2;
				width = first.offsetWidth + 5;
				height = last.offsetTop + last.offsetHeight + 5;

				Self.els.root.addClass("show").css({ top, left, width, height });
				// UI indicate anchor cell
				Parser.table.find(".anchor").removeClass("anchor");
				Self.anchor = Parser.table.find("td.selected").get(0).addClass("anchor");
				break;
			case "select-row":
			case "select-cell":
				anchor = event.anchor.length ? event.anchor[0] : event.anchor;
				top = anchor.offsetTop - 2;
				left = anchor.offsetLeft - 2;
				height = anchor.offsetHeight + 5;
				width = anchor.getBoundingClientRect().width + 5;
				
				Self.els.root
					.addClass("show")
					.css({ top, left, width, height });
				
				// UI show anchor cell
				Parser.table.find(".anchor").removeClass("anchor");
				Self.anchor = Parser.table.find("td.selected").get(0).addClass("anchor");
				break;
		}
	},
	resize(event) {
		let APP = eniac,
			Self = Cursor,
			Drag = Self.drag,
			el;
		switch (event.type) {
			case "mousedown": {
				// prevent default behaviour
				event.preventDefault();
				// cursor UI element
				el = Self.els.root;

				let cell = $(event.target);
				if (cell.hasClass("handle")) {
					cell = Cursor.active.cell;
				}
				// pre-mousemove info
				let top = cell.prop("offsetTop"),
					left = cell.prop("offsetLeft"),
					width = cell[0].getBoundingClientRect().width,
					height = cell.prop("offsetHeight"),
					row = cell.parent(),
					table = row.parents("table:first"),
					cells = table.find("tr:nth(2) td").map((td, index) => {
						return {
							index,
							left: td.offsetLeft,
							right: td.offsetLeft + td.getBoundingClientRect().width - left,
						};
					}),
					rows = table.find("tr").map((tr, index) => {
						return {
							index,
							top: tr.offsetTop,
							bottom: tr.offsetTop + tr.offsetHeight - top,
						};
					});

				// set table for parser
				Self.dispatch({ type: "focus-cell", anchor: cell });

				// create drag object
				Self.drag = {
					el,
					clickX: event.clientX,
					clickY: event.clientY,
					target: cell,
					cellIndex: cell.index(),
					rowIndex: row.index(),
					offset: { top, left, width, height },
					grid: {
						x: [width, ...cells],
						y: [height, ...rows],
					},
				};
				// cover layout
				Self.els.layout.addClass("cover");
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
				break; }
			case "mousemove":
				let top = Drag.offset.top,
					left = Drag.offset.left,
					height = event.clientY - Drag.clickY + Drag.offset.height,
					width = event.clientX - Drag.clickX + Drag.offset.width,
					yNum,
					xNum;

				if (height < 0) {
					top = event.clientY - Drag.clickY + Drag.offset.top;
					Drag.grid.filterY = Drag.grid.y.filter(b => b.top > top);
					top = Math.min(...Drag.grid.filterY.map(b => b.top));
					height = Drag.offset.top + Drag.offset.height - top;
					// get columns to be highlighted
					yNum = [Drag.rowIndex, ...Drag.grid.filterY.map(b => b.index).filter(i => i < Drag.rowIndex)];
				} else {
					Drag.grid.filterY = Drag.grid.y.filter(b => b.bottom < height);
					height = Math.max(...Drag.grid.filterY.map(b => b.bottom));
					// get columns to be highlighted
					yNum = [Drag.rowIndex, ...Drag.grid.filterY.map(b => b.index).filter(i => i > Drag.rowIndex)];
				}

				if (width < 0) {
					left = event.clientX - Drag.clickX + Drag.offset.left;
					Drag.grid.filterX = Drag.grid.x.filter(b => b.left > left);
					left = Math.min(...Drag.grid.filterX.map(b => b.left));
					width = Drag.offset.left + Drag.offset.width - left;
					// get rows to be highlighted
					xNum = [Drag.cellIndex, ...Drag.grid.filterX.map(b => b.index).filter(i => i < Drag.cellIndex)];
				} else {
					Drag.grid.filterX = Drag.grid.x.filter(b => b.right < width);
					width = Math.max(...Drag.grid.filterX.map(b => b.right));
					// get rows to be highlighted
					xNum = [Drag.cellIndex, ...Drag.grid.filterX.map(b => b.index).filter(i => i > Drag.cellIndex)];
				}

				if (height < Drag.offset.height) height = Drag.offset.height;
				if (width < Drag.offset.width) width = Drag.offset.width;

				// resize selection box
				Drag.el.css({
					top: top - 2,
					left: left - 2,
					height: height + 5,
					width: width + 5
				});

				let selection = yNum.join() + xNum.join();
				if (Drag.selection !== selection) {
					// prevents unnecessary DOM manipulation
					Drag.selection = selection;
					// make tool columns + rows active
					APP.tools.dispatch({ type: "select-coords", yNum, xNum });
					// cell to footer row
					APP.foot.dispatch({ type: "render-cells" });
					// UI indicate anchor cell
					Self.anchor = Parser.table.find("td.selected").get(0).addClass("anchor");
				}
				break;
			case "mouseup":
				if (!Drag.selection) {
					// auto blur active cell
					Self.dispatch({
						type: "focus-cell",
						anchor: Drag.target[0],
						shift: event.shiftKey,
					});
				}
				// uncover layout
				Self.els.layout.removeClass("cover");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	}
};
