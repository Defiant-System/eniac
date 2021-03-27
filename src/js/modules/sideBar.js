
{
	init() {
		// fast references
		this.els = {
			root: window.find("[data-area='sidebar'"),
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
				isOn = Self.els.root.hasClass("hidden");
				Self.els.root.toggleClass("hidden", isOn);
				return isOn;
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
