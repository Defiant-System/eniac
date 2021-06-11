
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
		this.els.handles.on("mousedown", this.resize);
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
			yNum, xNum,
			cell, cells,
			row, rows,
			isTop,
			el;
		switch (event.type) {
			case "mousedown":
				// cover layout
				Self.els.layout.addClass("cover");

				el = Self.els.root;
				row = APP.content.active.row;
				cell = APP.content.active.cell;
				top = cell.prop("offsetTop");
				left = cell.prop("offsetLeft");
				width = cell.prop("offsetWidth");
				height = cell.prop("offsetHeight");
				isTop = event.target.classList.contains("top-left");

				if (isTop) {
					cells = cell.prevAll("td").map(td => td.offsetLeft + td.getBoundingClientRect().width - left);
					rows = row.prevAll("tr").map(tr => tr.offsetTop + tr.offsetHeight - top);
				} else {
					cells = cell.nextAll("td").map(td => td.offsetLeft + td.getBoundingClientRect().width - left);
					rows = row.nextAll("tr").map(tr => tr.offsetTop + tr.offsetHeight - top);
				}

				// create drag object
				Self.drag = {
					el,
					isTop,
					clickX: event.clientX,
					clickY: event.clientY,
					offset: { top, left, width, height },
					snap: {
						x: [width, ...cells],
						y: [height, ...rows],
					},
					coords: {
						x: cell.index(),
						y: row.index(),
					},
				};
				// console.log(Self.drag.coords);

				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
				break;
			case "mousemove":
				if (Drag.isTop) {
					top = event.clientY - Drag.clickY + Drag.offset.top;
					left = event.clientX - Drag.clickX + Drag.offset.left;
					height = Drag.offset.height + Drag.clickY - event.clientY + 3;
					width = Drag.offset.width + Drag.clickX - event.clientX + 3;

					// resize selection box
					Drag.el.css({ top, left, height, width });
				} else {
					height = event.clientY - Drag.clickY + Drag.offset.height;
					width = event.clientX - Drag.clickX + Drag.offset.width;
					Drag.snap.filterY = Drag.snap.y.filter(h => h < height);
					Drag.snap.filterX = Drag.snap.x.filter(w => w < width);
					height = Math.max(...Drag.snap.filterY) + 5;
					width = Math.max(...Drag.snap.filterX) + 5;

					// resize selection box
					Drag.el.css({ height, width });
					// make tool columns + rows active
					yNum = Drag.snap.filterY.map((e,i) => Drag.coords.y + i).unshift(Drag.coords.y);
					xNum = Drag.snap.filterX.map((e,i) => Drag.coords.x + i).unshift(Drag.coords.x);
					APP.tools.dispatch({ type: "select-coords", yNum, xNum });
				}
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
