
// eniac.sidebar

{
	init() {
		// fast references
		this.els = {
			layout: window.find("layout"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar,
			pEl,
			isOn,
			el;
		switch (event.type) {
			case "toggle-sidebar":
				isOn = Self.els.layout.hasClass("show-sidebar");
				Self.els.layout.toggleClass("show-sidebar", isOn);
				return !isOn;
			case "select-tab":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				
				pEl = event.el.parent();
				pEl.find(".sidebar-body.active").removeClass("active");
				pEl.find(".sidebar-body").get(el.index()).addClass("active");
				break;
		}
	}
}
