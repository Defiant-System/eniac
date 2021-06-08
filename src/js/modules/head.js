
// eniac.head

{
	init() {
		// fast references
		this.els = {
			root: window.find("content > .head"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.head,
			el;
		switch (event.type) {
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
