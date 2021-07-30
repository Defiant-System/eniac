
// eniac.tools

{
	init() {
		// fast references
		let root = window.find(".table-tools");
		this.els = {
			root,
			doc: $(document),
			layout: window.find("layout"),
		};

		// bind event handlers
		this.els.layout.on("scroll", ".tbl-body > div:nth-child(2)", this.dispatch);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools,
			tblRoot,
			top, left,
			el;
		switch (event.type) {
			// native events
			case "scroll":
				el = $(event.target);
				tblRoot = el.parents(".tbl-root:first");
				
				top = -event.target.scrollTop;
				left = -event.target.scrollLeft;

				tblRoot.find(".tbl-col-head > div:nth(1) table").css({ left });
				tblRoot.find(".tbl-col-foot > div:nth(1) table").css({ left });
				tblRoot.find(".tbl-body div:nth-child(1) table").css({ top });
				break;
			// custom events
			case "sync-tools-ui":
				break;
		}
	}
}
