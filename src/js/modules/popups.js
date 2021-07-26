
// eniac.popups

{
	init() {
		// fast references
		this.els = {
			layout: window.find("layout"),
			root: window.find(".popups"),
			palette: window.find(".popups .popup-palette"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.popups,
			dim, pos, top, left,
			name,
			value,
			pEl,
			el;
		switch (event.type) {
			case "select-color":
				el = $(event.target);
				value = el.attr("style").match(/#.[\w\d]+/)[0];
				
				Self.els.palette.find(".active").removeClass("active");
				el.addClass("active");

				if (Self.origin) {
					Self.origin.el
						.removeClass("active_")
						.css({ "--preset-color": value });
					// proxy event
					pEl = Self.origin.el.parents("[data-area]");
					name = pEl.data("area");
					if (pEl.length && APP[name].dispatch) {
						let type = Self.origin.el.data("change");
						APP[name].dispatch({ type, value, });
					}
				}
				/* falls through */
			case "close-popup":
				Self.els.layout.removeClass("cover");
				Self.els.root.find("> div.pop")
					.cssSequence("pop-hide", "animationend", el => el.removeClass("pop pop-hide"));

				Self.origin = null;
				break;
			case "popup-color-palette":
				dim = Self.els.palette[0].getBoundingClientRect();
				pos = Self.getPosition(event.target, Self.els.layout[0]);
				top = pos.top + event.target.offsetHeight + 16;
				left = pos.left - (dim.width / 2) + ((event.target.offsetWidth - 22) / 2) - 2;

				// remember for later
				el = $(event.target).addClass("active_");
				value = el.css("--preset-color");
				Self.origin = { el, value };

				Self.els.palette.find(".active").removeClass("active");
				el = Self.els.palette.find(`span[style="background: ${value};"]`);
				if (el.length) el.addClass("active");

				Self.els.palette.css({ top, left }).addClass("pop");
				Self.els.layout.addClass("cover");
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