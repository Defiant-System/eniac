
{
	init() {
		// fast references
		this.els = {};
	},
	dispatch(event) {
		let APP = numbers,
			Self = APP.sidebar,
			pEl,
			isOn,
			el;
		switch (event.type) {
			case "sidebar-toggle-view":
				isOn = sideBar.el.hasClass("hidden");
				sideBar.el.toggleClass("hidden", isOn);
				return isOn ? "active" : "";
			case "sidebar-select-tab":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				
				pEl = event.el.parent();
				pEl.find(".body.active").removeClass("active");
				pEl.find(".body").get(el.index()).addClass("active");
				break;
		}
	}
}
