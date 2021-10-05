
// eniac.tools.sheet

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
			layout: window.find("layout"),
			lasso: window.find(".sheet-lasso"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools.sheet,
			el;
		switch (event.type) {
			// system events
			case "window.keystroke":
				console.log(event);
				break;
			// custom events
			case "focus-sheet":
				break;
		}
	},
	lasso(event) {
		let APP = eniac,
			Self = APP.tools.sheet,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover");

				let el = Self.els.lasso.removeClass("hidden"),
					offset = {
						y: event.offsetY,
						x: event.offsetX,
					},
					click = {
						y: event.clientY,
						x: event.clientX,
					},
					selectable = [];

				// collect info about elements
				Self.els.layout.find(".xl-table, .xl-shape, .xl-image, .xl-text").map(item => {
					let el = $(item),
						top = parseInt(el.css("top"), 10),
						left = parseInt(el.css("left"), 10),
						right = left + parseInt(el.css("width"), 10),
						bottom = top + parseInt(el.css("height"), 10);
					selectable.push({ el, top, left, right, bottom });
				});

				// create drag object
				Self.drag = {
					el,
					click,
					offset,
					selectable,
					clickTime: Date.now(),
				};

				// bind events
				Self.els.doc.on("mousemove mouseup", Self.lasso);
				break;
			case "mousemove":
				let top = Drag.offset.y,
					left = Drag.offset.x,
					width = event.clientX - Drag.click.x,
					height = event.clientY - Drag.click.y;

				if (height < 0) { top += height; height *= -1; }
				if (width < 0)  { left += width; width *= -1; }
				Drag.el.css({ top, left, width, height });

				// less calculation during comparison
				let bottom = top + height,
					right = left + width;
				// loop cell info
				Drag.selectable.map(r => {
					let isSelected = ((bottom < r.top || top > r.bottom) || (right < r.left || left > r.right));
					r.el.toggleClass("selected", isSelected);
				});
				break;
			case "mouseup":
				if (Date.now() - Drag.clickTime < 250) {
					// reset "selectable" elements
					Drag.selectable.map(r => r.el.removeClass("selected"));
					// update sidebar
					APP.sidebar.dispatch({ type: "show-sheet" });
					// blur XL element, if any
					APP.tools.dispatch({ type: "blur-focused" });
				}
				// reset lasso element
				Drag.el
					.css({ top: 0, left: 0, width: 0, height: 0 })
					.addClass("hidden");
				// uncover layout
				Self.els.layout.removeClass("cover");
				// unbind events
				Self.els.doc.off("mousemove mouseup", Self.lasso);
				break;
		}
	}
}
