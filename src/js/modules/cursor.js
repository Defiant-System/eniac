
const Cursor = {
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
			Self = Cursor,
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
					el = Self.els.selText.val(event.el.text());
					if (!event.blur) el.focus();
				} else {
					Self.els.selText.val("");
				}
				break;
		}
	},
	resize(event) {
		let APP = eniac,
			Self = Cursor,
			Drag = Self.drag,
			top, left, width, height,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				el = Self.els.root;
				
				let cell = $(event.target),
					row = cell.parent(),
					table = row.parents("table:first"),
					cells = table.find("tr:nth(2) td").map(td => {
						return {
							left: td.offsetLeft,
							right: td.offsetLeft + td.getBoundingClientRect().width,
						};
					}),
					rows = table.find("tr").map(tr => {
						return {
							top: tr.offsetTop,
							bottom: tr.offsetTop + tr.offsetHeight
						};
					});

				// focus on cell
				APP.content.dispatch({ type: "focus-cell", target: cell[0], blur: true });

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
				top = Drag.offset.top;
				left = Drag.offset.left;
				height = event.clientY - Drag.clickY + Drag.offset.height;
				width = event.clientX - Drag.clickX + Drag.offset.width;

				Drag.grid.filterY = Drag.grid.y.filter(b => b.bottom < height + Drag.offset.top);
				Drag.grid.filterX = Drag.grid.x.filter(b => b.right < width + Drag.offset.left);
				height = Math.max(...Drag.grid.filterY.map(b => b.bottom - Drag.offset.top));
				width = Math.max(...Drag.grid.filterX.map(b => b.right - Drag.offset.left));

				if (height < Drag.offset.height) height = Drag.offset.height;
				if (width < Drag.offset.width) width = Drag.offset.width;

				// resize selection box
				Drag.el.css({
					top: top - 2,
					left: left - 2,
					height: height + 5,
					width: width + 5
				});
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	}
};
