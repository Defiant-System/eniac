
// eniac.tools

{
	init() {
		// fast references
		let root = window.find(".table-tools");
		this.els = {
			root,
			doc: $(document),
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
			rect,
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
						Self.dispatch({ type: "blur-table" });
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
				rect = event.table[0].getBoundingClientRect();
				Self.els.root.css({ width: rect.width, height: rect.height });

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
			case "select-coord":
				Self.els.cols.find(".active").removeClass("active");
				Self.els.cols.find("td").get(event.xNum).addClass("active");
				Self.els.rows.find(".active").removeClass("active");
				Self.els.rows.find("tr").get(event.yNum).addClass("active");
				break;
			case "select-columns":
				el = $(event.target);
				// UI change on sheet table
				Parser.table.find(".selected").removeClass("selected");
				cols = Parser.table.find(`td:nth-child(${el.index()+1})`).addClass("selected");

				// selection element
				APP.selection.dispatch({ type: "select-column", cols });
				// make all rows "active"
				Self.els.rows.find("tr").addClass("active");
				// make column active
				Self.els.cols.find(".active").removeClass("active");
				el.addClass("active");
				break;
			case "select-rows":
				el = $(event.target);
				rows = Parser.table.find("tr").get(el.parent().index());
				// UI change on sheet table
				rows.parent().find("td.selected").removeClass("selected");
				rows.find("td").addClass("selected");

				// selection element
				APP.selection.dispatch({ type: "select-row", target: rows[0] });
				// make all columns "active"
				Self.els.cols.find("td").addClass("active");
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
			top, left,
			table,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
				break;
			case "mousemove":
				break;
			case "mouseup":
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

				Drag.el.css({
					top: top +"px",
					left: left +"px",
				});
				break;
			case "mouseup":
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.move);
				break;
		}
	}
}
