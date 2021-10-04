
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
		let Self = eniac.tools.sheet,
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
					};

				// create drag object
				Self.drag = {
					el,
					click,
					offset,
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
				break;
			case "mouseup":
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
