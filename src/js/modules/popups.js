
// eniac.popups

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
			layout: window.find("layout"),
			root: window.find(".popups"),
			gridOptions: window.find(".popups .popup-insert-grid-options"),
			chartOptions: window.find(".popups .popup-insert-chart-options"),
			shapeOptions: window.find(".popups .popup-insert-shape-options"),
			imageOptions: window.find(".popups .popup-insert-image-options"),
			colorRing: window.find(".popups .popup-colour-ring .ring-wrapper"),
			palette: window.find(".popups .popup-palette"),
		};

		// bind event handlers
		this.els.colorRing.on("mousedown", this.doColorRing);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.popups,
			dim, pos, top, left,
			name,
			value,
			func,
			pEl,
			el;
		// console.log(event);
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
						let type = Self.origin.el.data("change"),
							origin = Self.origin;
						APP[name].dispatch({ type, value, origin });
					}
				}
				/* falls through */
			case "close-popup":
				Self.els.layout.removeClass("cover");
				Self.els.root.find("> div.pop")
					.cssSequence("pop-hide", "animationend", el => el.removeClass("pop pop-hide"));

				Self.origin = null;
				break;
			case "do-grid-navigation":
				el = $(event.target);
				if (el.hasClass("active")) return;
				// navigation dots UI change
				el.parent().find(".active").removeClass("active");
				el.addClass("active");
				// trigger change in reel
				event.el.prevAll(".options-reel").data({ step: el.index() + 1 });
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
			case "popup-view-options":
				// reference to target popup
				el = Self.els[event.arg +"Options"];
				dim = el[0].getBoundingClientRect();
				pos = Cursor.getOffset(event.target, Self.els.layout[0]);
				top = pos.top + event.target.offsetHeight + 16;
				left = pos.left - (dim.width / 2) + (event.target.offsetWidth / 2) - 3;
				// show popup
				el.css({ top, left }).addClass("pop");
				Self.els.layout.addClass("cover");
				// handler listens for next click event - to close popup
				func = event => {
					// if click inside popup element
					if ($(event.target).parents(".popups").length) return;
					Self.dispatch({ type: "close-popup" });
					// unbind event handler
					Self.els.doc.unbind("mouseup", func);
				};
				// bind event handler
				Self.els.doc.bind("mouseup", func);
				break;
			case "insert-text-box":
				console.log(event);
				break;
			case "select-grid":
			case "select-chart":
			case "select-shape":
			case "select-image":
				console.log(event);
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
	},
	doColorRing(event) {
		let APP = eniac,
			Self = APP.popups,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				// Self.els.layout.addClass("cover hideMouse");

				let rEl = Self.els.colorRing,
					target = event.target,
					pEl = target.getAttribute("data-el") ? $(target) : $(target).parents("div[data-el]"),
					type = pEl.data("el"),
					el = pEl.find("span"),
					rect = pEl[0].getBoundingClientRect();

				// create drag object
				Self.drag = {
					el,
					rEl,
					type,
					clickX: event.clientX,
					clickY: event.clientY,
				};

				if (type === "ring") {
					let theta = Math.atan2(event.offsetY - 83, event.offsetX - 83);
					theta *= 180 / Math.PI;
					if (theta < 0) theta += 360;

					Self.drag.rEl.css({ "--rotation": `${theta}deg` });
					// console.log(theta);
					return;
				} else {
					Self.drag.clickX -= event.clientX - rect.x,
					Self.drag.clickY -= event.clientY - rect.y,
					Self.drag.max = {
						w: +pEl.prop("offsetWidth") - 1,
						h: +pEl.prop("offsetHeight") - 1,
					};
				}

				// bind event
				Self.els.doc.on("mousemove mouseup", Self.doColorRing);
				break;
			case "mousemove":
				if (Drag.type === "ring") {
					let rotation = 32;
					Drag.rEl.css({ "--rotation": `${rotation}deg` });
				} else {
					let top = Math.max(Math.min(event.clientY - Drag.clickY, Drag.max.h), 0),
						left = Math.max(Math.min(event.clientX - Drag.clickX, Drag.max.w), 0);
					Drag.rEl.css({ "--top": `${top}px`, "--left": `${left}px` });
				}
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.doColorRing);
				break;
		}
	}
}
