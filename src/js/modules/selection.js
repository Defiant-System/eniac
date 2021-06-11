
// eniac.selection

{
	init() {
		// fast references
		let root = window.find(".selection");
		this.els = {
			root,
			doc: $(document),
			layout: window.find("layout"),
			selText: root.find("textarea"),
			handles: root.find(".handle"),
		};

		// bind event handlers
		this.els.layout.on("mousedown", ".sheet td", this.resize);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.selection,
			Content = APP.content,
			active = Content.activeEl,
			rect, top, left, width, height,
			xNum, yNum,
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
					Content.dispatch({ type: "focus-cell", target: next[0] });
				}
				break;
			case "move-right":
			case "move-left":
				next = active[ event.type === "move-right" ? "next" : "prev" ]("td");
				if (next.length) {
					Content.dispatch({ type: "focus-cell", target: next[0] });
				}
				break;
			case "select-column":
				let first = event.cols[0] ,
					last = event.cols[event.cols.length - 1];
				top = first.offsetTop - 2;
				left = first.offsetLeft - 2;
				width = first.offsetWidth + 5;
				height = last.offsetTop + last.offsetHeight + 5;

				Self.els.root.addClass("show").css({ top, left, width, height });
				Self.els.selText.val("");
				break;
			case "select-row":
			case "select-cell":
				rect = event.target.getBoundingClientRect();

				top = event.target.offsetTop - 2;
				left = event.target.offsetLeft - 2;
				height = event.target.offsetHeight + 5;
				width = rect.width + 5;
				
				Self.els.root.addClass("show").css({ top, left, width, height });

				if (event.el) {
					Self.els.selText.val(event.el.text()).focus();
				} else {
					Self.els.selText.val("");
				}
				break;
		}
	},
	resize(event) {
		let APP = eniac,
			Self = APP.selection,
			Drag = Self.drag,
			top, left, width, height,
			cell, row,
			cells, rows,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				el = Self.els.root;
				cell = $(event.target);
				top = cell.prop("offsetTop");
				left = cell.prop("offsetLeft");
				width = cell.prop("offsetWidth");
				height = cell.prop("offsetHeight");

				// create drag object
				Self.drag = {
					el,
					clickX: event.clientX,
					clickY: event.clientY,
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
				break;
			case "mousemove":
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	}
}
