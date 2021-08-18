
// eniac.sidebar

{
	init() {
		// fast references
		this.els = {
			layout: window.find("layout"),
			el: window.find("sidebar"),
		};
	},
	sheet: @import "sidebar.sheet.js",
	shape: @import "sidebar.shape.js",
	table: @import "sidebar.table.js",
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar,
			name,
			pEl,
			el;
		switch (event.type) {
			case "toggle-sidebar":
				isOn = Self.els.layout.hasClass("show-sidebar");
				Self.els.layout.toggleClass("show-sidebar", isOn);
				return !isOn;
			case "show-sheet":
			case "show-title":
			case "show-caption":
			case "show-table":
			case "show-shape":
			case "show-chart":
			case "show-empty":
				Self.els.el.removeClass("show-sheet show-title show-caption show-table show-shape show-chart show-empty");
				Self.els.el.addClass(event.type);
				// trigger populate event
				name = event.type.split("-")[1];
				Self[name].dispatch({ ...event, type: `populate-${name}-values` });
				break;
			case "select-tab":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				
				pEl = event.el.parent();
				pEl.find(".sidebar-body.active").removeClass("active");
				pEl.find(".sidebar-body").get(el.index()).addClass("active");
				break;
			// forward popup events
			case "popup-color-palette":
				APP.popups.dispatch(event);
				break;
			default:
				el = event.el || (event.origin && event.origin.el) || $(event.target);
				pEl = el.parents("[data-section]");
				name = pEl.data("section");
				if (Self[name]) {
					return Self[name].dispatch(event);
				}
		}
	}
}
