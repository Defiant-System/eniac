
// eniac.head

{
	init() {
		// fast references
		this.els = {
			root: window.find("content > .head > div"),
			reel: window.find("content > .head .sheet-reel"),
		};

		// bind event handlers
		this.els.root.on("wheel", this.dispatch);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.head,
			max, delta, left,
			el;
		switch (event.type) {
			// native events
			case "wheel":
				delta = event.deltaY === 0 ? event.deltaX : event.deltaY;
				max = Self.els.root.prop("offsetWidth") - Self.els.reel.prop("offsetWidth");
				left = Math.min(Math.max(Self.els.reel.prop("offsetLeft") - delta, max), 0);
				Self.els.reel.css({ left });
				break;
			// custom events
			case "select-sheet":
				el = $(event.target);
				event.el.find(".active").removeClass("active");
				el.addClass("active");
				// render clicked sheet
				Render.sheet(el.html());
				break;
		}
	}
}
