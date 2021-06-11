
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
			resizes: root.find(".tool.resize, .tool.v-resize, .tool.h-resize"),
			cols: root.find(".table-cols"),
			rows: root.find(".table-rows"),
		};

		// bind event handlers
		this.els.move.on("mousedown", this.move);
		this.els.resizes.on("mousedown", this.resize);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools,
			rows,
			cols,
			str,
			el;
		switch (event.type) {
			// system events
			case "window.keystroke":
				// special handling of special keys
				switch (event.char) {
					case "esc":
						APP.content.dispatch({ type: "blur-table" });
						break;
					case "tab":
					case "return":
						APP.selection.dispatch({ type: "move-right" });
						break;
					case "up":
					case "down":
					case "right":
					case "left":
						APP.selection.dispatch({ type: "move-"+ event.char });
						break;
				}
				break;
			// custom events
			case "sync-sheet-table":
				Self.els.root.css({
					width: event.table[0].offsetWidth,
					height: event.table[0].offsetHeight,
				});

				// tools columns
				cols = event.table.find("tr:nth(0) td");
				str = cols.map(col => {
						let rect = col.getBoundingClientRect();
						return `<col width="${Math.round(rect.width)}"/>`;
					}).join("");
				str += `<tr>`+ cols.map(col => `<td><s></s></td>`).join("") +`</tr>`;
				Self.els.cols.html(str);

				// tools rows
				str = event.table.find("tr").map(row => `<tr><td><s></s></td></tr>`).join("");
				Self.els.rows.html(str);
				break;
			case "select-coords":
				Parser.table.find(".selected").removeClass("selected");

				cols = event.xNum.length ? event.xNum : [event.xNum];
				rows = event.yNum.length ? event.yNum : [event.yNum];
				console.log( cols, rows );

				Self.els.cols.find(".active").removeClass("active");
				cols.map(i => Self.els.cols.find("td").get(i).addClass("active"));
				Self.els.rows.find(".active").removeClass("active");
				rows.map(i => Self.els.rows.find("tr").get(i).addClass("active"));
				break;
			case "select-columns":
				// auto blur active cell
				APP.content.dispatch({ type: "blur-cell" });

				el = $(event.target);
				// UI change on sheet table
				Parser.table.find(".selected").removeClass("selected");
				cols = Parser.table.find(`td:nth-child(${el.index()+1})`).addClass("selected");

				// selection element
				APP.selection.dispatch({ type: "select-column", cols });
				// make all rows "active"
				Self.els.rows.find("tr.active").removeClass("active");
				// make column active
				Self.els.cols.find(".active").removeClass("active");
				el.addClass("active");
				break;
			case "select-rows":
				// auto blur active cell
				APP.content.dispatch({ type: "blur-cell" });

				el = $(event.target);
				rows = Parser.table.find("tr").get(el.parent().index());
				// UI change on sheet table
				rows.parent().find("td.selected").removeClass("selected");
				rows.find("td").addClass("selected");

				// selection element
				APP.selection.dispatch({ type: "select-row", target: rows[0] });
				// make all columns "active"
				Self.els.cols.find("td.active").removeClass("active");
				// make row active
				Self.els.rows.find(".active").removeClass("active");
				el.parent().addClass("active");
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
				APP.content.dispatch({ type: "blur-cell" });

				el = Self.els.root;
				table = Parser.table;
				width = table.prop("offsetWidth");
				height = table.prop("offsetHeight");

				let tbody = table.find("tbody"),
					row = tbody.find("tr:last").clone(true);
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
					clickX: event.clientX,
					clickY: event.clientY,
					offset: { width, height },
					min: { y: height, x: width },
					add: { y: 0, x: 0 },
					snap: { x: 90, y: 25 },
					syncRows: (Drag, add) => {
						if (add.y > Drag.add.y) {
							// add rows
							Drag.tbody[0].appendChild(Drag.row[0].cloneNode(true));
						} else {
							// delete rows
							Drag.tbody[0].removeChild(Drag.tbody[0].lastChild);
						}
						Drag.add.y = add.y;
					},
					syncCols: (Drag, add) => {
						if (add.x > Drag.add.x) {
							// add cells
							Drag.tbody.find("tr").map(row =>
								row.appendChild(Drag.cell[0].cloneNode()));
						} else {
							// delete cells
							Drag.tbody.find("tr").map(row =>
								row.removeChild(row.lastChild));
						}
						Drag.add.x = add.x;
					},
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
				break;
			case "mousemove":
				height = Math.max(event.clientY - Drag.clickY + Drag.offset.height, Drag.min.y);
				width = Math.max(event.clientX - Drag.clickX + Drag.offset.width, Drag.min.x);

				// calculate how much to add to table
				add = {
					y: Math.floor((height - Drag.min.y) / Drag.snap.y),
					x: Math.floor((width - Drag.min.x) / Drag.snap.x),
				}
				// this prevents unnecessary DOM manipulation
				if (add.y !== Drag.add.y) Drag.syncRows(Drag, add);
				// this prevents unnecessary DOM manipulation
				if (add.x !== Drag.add.x) Drag.syncCols(Drag, add);
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
