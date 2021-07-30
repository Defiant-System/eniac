
// eniac.foot

{
	init() {
		// fast references
		this.els = {
			root: window.find("content > .foot"),
			layout: window.find("layout"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.foot,
			data,
			sel,
			str,
			el;
		switch (event.type) {
			case "hide":
				Self.els.layout.removeClass("show-footer");
				break;
		}
	}
}
