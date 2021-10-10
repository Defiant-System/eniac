
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
	line: @import "./line.js",
	sheet: @import "./sheet.js",
	shape: @import "./shape.js",
	table: @import "./table.js",
	image: @import "./image.js",
	text: @import "./text.js",
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar,
			name,
			value,
			pEl,
			el;
		switch (event.type) {
			case "toggle-sidebar":
				value = Self.els.layout.hasClass("show-sidebar");
				Self.els.layout.toggleClass("show-sidebar", value);
				return !value;
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
	},
	zIndexArrange(el, type) {
		let siblings = eniac.body.find(Guides.selector).filter(item => item !== el[0]),
			value = +el.css("z-index");
		switch (type) {
			case "back":
				siblings.map(item => {
					let cEl = $(item),
						zIndex = +cEl.css("z-index");
					if (zIndex < value) cEl.css({ "z-index": zIndex+1 });
				});
				value = 1;
				break;
			case "front":
				siblings.map(item => {
					let cEl = $(item),
						zIndex = +cEl.css("z-index");
					if (zIndex > value) cEl.css({ "z-index": zIndex-1 });
				});
				value = siblings.length+1;
				break;
			case "backward":
				siblings.map(item => {
					let cEl = $(item),
						zIndex = +cEl.css("z-index");
					if (zIndex < value && zIndex >= value-1) cEl.css({ "z-index": zIndex+1 });
				});
				value -= 1;
				break;
			case "forward":
				siblings.map(item => {
					let cEl = $(item),
						zIndex = +cEl.css("z-index");
					if (zIndex > value && zIndex <= value+1) cEl.css({ "z-index": zIndex-1 });
				});
				value += 1;
				break;
		}
		// apply change
		el.css({ "z-index": value });
	}
}
