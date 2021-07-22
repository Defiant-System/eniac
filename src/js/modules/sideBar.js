
// eniac.sidebar

{
	init() {
		// fast references
		this.els = {
			layout: window.find("layout"),
			el: window.find("sidebar"),
		};
		// temp
		// window.find(`.toolbar-tool_[data-click="toggle-sidebar"]`).trigger("click");
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar,
			isOn,
			pEl,
			el;
		switch (event.type) {
			case "toggle-sidebar":
				isOn = Self.els.layout.hasClass("show-sidebar");
				Self.els.layout.toggleClass("show-sidebar", isOn);
				return !isOn;
			case "show-sheet":
			case "show-table":
			case "show-chart":
			case "show-empty":
				Self.els.el.removeClass("show-sheet show-table show-chart show-empty");
				Self.els.el.addClass(event.type);
				break;
			case "select-tab":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				
				pEl = event.el.parent();
				pEl.find(".sidebar-body.active").removeClass("active");
				pEl.find(".sidebar-body").get(el.index()).addClass("active");
				break;
			case "set-table-outline-color":
			case "set-alternating-row-color":
			case "cell-fill-color":
			case "cell-border-color":
			case "set-text-color":
				console.log(event);
				break;
			case "set-sheet-bgcolor":
				Self.els.layout.find(".body").css({ "background-color": event.value });
				break;
			case "popup-color-palette":
				// forward event
				APP.popups.dispatch(event);
				break;
		}
	}
}
