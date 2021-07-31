
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

		// bind event handlers
		this.els.layout.on("scroll", ".tbl-body > div:nth-child(2)", this.dispatch);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools,
			top, left, width, height,
			sheet, rows, cols,
			str,
			el;
		switch (event.type) {
			// native events
			case "scroll":
				el = $(event.target);
				sheet = el.parents(".tbl-root:first");
				
				top = -event.target.scrollTop;
				left = -event.target.scrollLeft;

				sheet.find(".tbl-col-head > div:nth(1) table").css({ left });
				sheet.find(".tbl-col-foot > div:nth(1) table").css({ left });
				sheet.find(".tbl-body div:nth-child(1) table").css({ top });
				break;
			// custom events
			case "sync-tools-dim":
				sheet = event.sheet || Parser.sheet;
				top = sheet.prop("offsetTop");
				left = sheet.prop("offsetLeft");
				width = sheet.prop("offsetWidth");
				height = sheet.prop("offsetHeight");
				Self.els.root.css({ top, left, width, height });

				el = sheet.find(".table-title");
				top = (el.prop("offsetHeight") + parseInt(el.css("margin-bottom"), 10));
				top = isNaN(top) ? 0 : top;
				Self.els.rows.css({ "--rows-top": top +"px" });
				break;
			case "sync-sheet-table":
				Self.sheet = event.sheet || Parser.sheet;

				Self.dispatch({ ...event, type: "sync-tools-dim" });

				break;
		}
	}
}
