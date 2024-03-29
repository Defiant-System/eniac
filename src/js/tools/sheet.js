
// eniac.spawn.tools.sheet

{
	init() {
		// fast references
		this.els = {};
	},
	get layout() {
		let body = this.els.layout.find("content > .body"),
			scrollTop = 0,
			scrollLeft = 0,
			width = body.width(),
			height = body.height();
		return { scrollTop, scrollLeft, width, height };
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.spawn.tools.sheet,
			Spawn = event.spawn,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.keystroke":
				break;
			case "spawn.blur":
				// reset fast references
				Self.els = {};
				break;
			case "spawn.focus":
				// fast references
				Self.els = {
					layout: Spawn.find("layout"),
					lasso: Spawn.find(".sheet-lasso"),
				};
				break;
			// custom events
			case "focus-sheet":
				break;
			case "blur-sheet":
				break;
		}
	},
	lasso(event) {
		let APP = eniac,
			Self = APP.spawn.tools.sheet,
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
				APP.spawn.els.body.find(Guides.selector).map(item => {
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
					APP.spawn.sidebar.dispatch({ type: "show-sheet" });
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
