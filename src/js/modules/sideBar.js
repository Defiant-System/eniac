
// eniac.sidebar

{
	init() {
		// fast references
		this.els = {
			layout: window.find("layout"),
			el: window.find("sidebar"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar,
			pEl,
			el;
		switch (event.type) {
			case "toggle-sidebar":
				break;
		}
	}
}
