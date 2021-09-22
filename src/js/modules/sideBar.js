
// eniac.sidebar

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
			layout: window.find("layout"),
			el: window.find("sidebar"),
		};
		
		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));
	},
	line: @import "sidebar.line.js",
	sheet: @import "sidebar.sheet.js",
	shape: @import "sidebar.shape.js",
	table: @import "sidebar.table.js",
	image: @import "sidebar.image.js",
	text: @import "sidebar.text.js",
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
			case "show-image":
			case "show-text":
			case "show-line":
			case "show-chart":
			case "show-empty":
				name = ["sheet", "title", "caption", "table", "shape", "image", "text", "line", "chart", "empty"];
				Self.els.el.removeClass(name.map(e => `show-${e}`).join(" "));
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
			case "popup-color-ring":
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
