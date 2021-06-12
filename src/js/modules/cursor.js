
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
			anchor = Self.anchor,
			top, left, width, height,
			xNum, yNum,
			table,
			next,
			el;
		switch (event.type) {
			// custom events
			case "move-up":
			case "move-down":
				xNum = active.index();
				yNum = active.parent().index() + (event.type === "move-up" ? -1 : 1);
				next = Parser.getCellByCoord(xNum, yNum);
				if (next.length) {
					Self.dispatch({ type: "focus-cell", anchor: next[0] });
				}
				break;
			case "move-right":
			case "move-left":
				next = active[ event.type === "move-right" ? "next" : "prev" ]("td");
				if (next.length) {
					Self.dispatch({ type: "focus-cell", anchor: next[0] });
				}
				break;
			case "focus-table":
				if (event.table.isSame(Parser.table)) return;
				// set table for parser
				Parser.setTable(event.table);
				// show tools for table
				Self.els.tools.removeClass("hidden");
				break;
			case "blur-table":
				break;
			case "focus-cell":
				// anchor cell
				el = $(event.anchor);
				table = el.parents("table.sheet");
				// focus clicked table
				Self.dispatch({ type: "focus-table", table });
				// sync tools table
				APP.tools.dispatch({ type: "sync-sheet-table", table });
				
				// make column + row active
				xNum = el.index();
				yNum = el.parent().index();
				APP.tools.dispatch({ type: "select-coords", yNum, xNum });
				// UI select element
				Self.dispatch({ ...event, el, type: "select-cell" });
				break;
			case "blur-cell":
				break;
			case "select-column":
				let first = event.cols[0] ,
					last = event.cols[event.cols.length - 1];
				top = first.offsetTop - 2;
				left = first.offsetLeft - 2;
				width = first.offsetWidth + 5;
				height = last.offsetTop + last.offsetHeight + 5;

				Self.els.root.addClass("show").css({ top, left, width, height });
				// Self.els.selText.val("");
				break;
			case "select-row":
			case "select-cell":
				top = event.anchor.offsetTop - 2;
				left = event.anchor.offsetLeft - 2;
				height = event.anchor.offsetHeight + 5;
				width = event.anchor.getBoundingClientRect().width + 5;
				
				Self.els.root
					.removeClass("no-edit")
					.addClass("show")
					.css({ top, left, width, height });
				
				// if (event.blur) {
				// 	return Self.els.root.addClass("no-edit");
				// }

				// if (event.el) {
				// 	Self.els.selText.val(event.el.text()).focus();
				// } else {
				// 	Self.els.selText.val("");
				// }
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
				// auto blur active cell
				// Self.dispatch({ type: "blur-cell" });
				
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
				// focus on cell
				// Self.dispatch({ type: "focus-cell", anchor: cell[0] });
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
				}
				break;
			case "mouseup":
				if (!Drag.selection) {
					// auto blur active cell
					Self.dispatch({ type: "focus-cell", anchor: Drag.target[0] });
				}
				// uncover layout
				Self.els.layout.removeClass("cover");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	}
};
