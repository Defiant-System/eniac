
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
		};
		// placeholder
		this.sheet = {};

		// bind event handlers
		this.els.layout.on("scroll", ".tbl-body > div:nth-child(2)", this.dispatch);
	},
	zipSheet(sheet) {
		let out = {
				rows: [],
				cells: [],
				getRowCells(vI) {
					let cells = [];
					return this.rows[vI];
				},
				getCell(vI, hI) {},
				rowIndex(tr) {},
				cellIndex(td) {},
			};

		sheet.find(".tbl-col-head > div:nth-child(1) tr").map((row, i) => {
			let rowCells = [];
			rowCells.push( ...$("td", row) );
			rowCells.push( ...sheet.find(`.tbl-col-head > div:nth-child(2) tr:nth-child(${i+1}) td`) );
			out.rows.push(rowCells);
		});

		out.cells.push(...sheet.find(".tbl-col-head td"));
		sheet.find(".tbl-body > div:nth-child(1) tr").map((row, i) => {
			out.cells.push( ...$("td", row) );
			out.cells.push( ...sheet.find(`.tbl-body > div:nth-child(2) tr:nth-child(${i+1}) td`) );
		});
		out.cells.push(...sheet.find(".tbl-col-foot td"));
		
		return out;
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools,
			Sheet = Self.sheet,
			top, left, width, height,
			zip, cols, rows,
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
				zip = Self.zipSheet(el);

				console.log( zip.getRowCells(1) );

				// rows = zip.rows;
				rows = el.find("tr");
				Self.sheet = {
					el,
					zip,
					rows,
					colNum: rows.get(0).find("td").length,
					rowNum: rows.length,
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
					str = `<table style="width: ${el.firstChild.offsetWidth}px;"><tr>${str.join("")}</tr></table>`;
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
	}
}
