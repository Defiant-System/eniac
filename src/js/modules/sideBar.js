
// eniac.sidebar

{
	init() {
		// fast references
		this.els = {
			layout: window.find("layout"),
			el: window.find("sidebar"),
			popups: window.find(".popups"),
			popPalette: window.find(".popups .popup-palette"),
		};
		// temp
		// window.find(`.toolbar-tool_[data-click="toggle-sidebar"]`).trigger("click");
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar,
			dim, pos, top, left,
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
			case "popup-color-palette":
				dim = Self.els.popPalette[0].getBoundingClientRect();
				pos = Self.getPosition(event.target, Self.els.layout[0]);
				top = pos.top + event.target.offsetHeight + 16;
				left = pos.left - (dim.width / 2) + ((event.target.offsetWidth - 22) / 2) - 2;

				Self.els.popPalette.css({ top, left }).addClass("pop");
				Self.els.layout.addClass("cover");
				break;
			case "hide-popups":
				Self.els.layout.removeClass("cover");
				Self.els.popups.find("> div")
					.cssSequence("pop-hide", "animationend", el => el.removeClass("pop pop-hide"));
				break;
		}
	},
	getPosition(el, rEl) {
		let pEl = el,
			pos = { top: 0, left: 0 };
		while (pEl !== rEl) {
			pos.top += (pEl.offsetTop - pEl.parentNode.scrollTop);
			pos.left += (pEl.offsetLeft - pEl.parentNode.scrollLeft);
			pEl = pEl.offsetParent;
		}
		return pos;
	}
}
