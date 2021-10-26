
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

		// setTimeout(() => {
		// 	window.find(".toolbar-tool_:nth(2)").trigger("click");
		// 	// window.find(".text-fill-options .point:nth(0)").trigger("mousedown").trigger("mouseup");
		// }, 700);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.popups,
			dim, pos, top, left,
			name,
			value,
			func,
			str,
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
				pEl = Self.els.palette;
				dim = pEl[0].getBoundingClientRect();
				pos = Self.getPosition(event.target, Self.els.layout[0]);
				top = pos.top + event.target.offsetHeight + 16;
				left = pos.left - (dim.width / 2) + ((event.target.offsetWidth - 22) / 2) - 2;

				// remember for later
				el = $(event.target).addClass("active_");
				value = el.css("--preset-color");
				Self.origin = { el, value };

				// prepare popup contents
				pEl.find(".active").removeClass("active");
				el = pEl.find(`span[style="background: ${value};"]`);
				if (el.length) el.addClass("active");

				pEl.css({ top, left }).addClass("pop");
				Self.els.layout.addClass("cover");
				break;
			case "popup-color-ring":
				pEl = Self.els.colorRing.parent();
				dim = pEl[0].getBoundingClientRect();
				pos = Self.getPosition(event.target, Self.els.layout[0]);
				top = pos.top + event.target.offsetHeight + 13;
				left = pos.left - (dim.width / 2) + (event.target.offsetWidth / 2) - 12;
				
				// prepare popup contents
				el = $(event.target);
				value = el.cssProp("--color");
				Self.origin = { el, value };
				let [hue, sat, lgh, alpha] = Color.hexToHsl(value.trim());

				// ring rotation
				pEl.find(".color-ring span").css({ transform: `rotate(${hue}deg)` });
				// box
				let hsv = Color.hexToHsv(value.trim()),
					w = +Self.els.colorRing.find(".color-box").prop("offsetWidth") - 1;
				pEl.find(".color-box span").css({
					left: w * hsv[1],
					top: w * (1-hsv[2]),
				});
				// alpha
				pEl.find(".color-alpha span").css({ top: `${alpha * 159}px` });
				// root element css variables
				let hex = Color.hslToHex(hue, sat, lgh, alpha);
				Self.els.colorRing.css({
					"--hue-color": Color.hslToHex(hue, 1, .5),
					"--color": hex,
					"--color-opaque": hex.slice(0, -2),
				});
				// position popup
				pEl.css({ top, left }).addClass("pop");
				Self.els.layout.addClass("cover");
				break;
			case "popup-view-options":
				// reference to target popup
				el = Self.els[event.arg +"Options"];
				dim = el[0].getBoundingClientRect();
				pos = Self.getOffset(event.target, Self.els.layout[0]);
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
			case "insert-table":
				name = event.target.getAttribute("data-arg");
				str = window.render({ template: "xl-table", match: `//Table[@id="template-2"]` });
				str = str.replace(/gray-table-1/, name);
				el = APP.body.append(str);
				// auto focus on first grid cell
				el.find("td:nth(0)").trigger("mousedown").trigger("mouseup");
				// close popup
				Self.dispatch({ type: "close-popup" });
				break;
			case "select-menu":
			case "insert-text-box":
			case "insert-chart":
			case "insert-shape":
			case "insert-image":
				console.log(event);
				break;
		}
	},
	getOffset(el, pEl) {
		let rect1 = el.getBoundingClientRect(),
			rect2 = pEl.getBoundingClientRect(),
			top = Math.floor(rect1.top - rect2.top) + pEl.offsetTop - 2,
			left = Math.floor(rect1.left - rect2.left) + pEl.offsetLeft - 2,
			width = rect1.width + 5,
			height = rect1.height + 5;
		return { top, left, width, height };
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
				Self.els.layout.addClass("hideMouse");

				let origin = Self.origin.el,
					stopIndex = origin.index(),
					oParent = origin.parent(),
					stops = oParent.find(".point").map(p => {
						let el = $(p);
						return { offset: +el.css("--offset"), color: el.css("--color") };
					}),
					section = oParent.parents("[data-section]").data("section"),
					[hue, sat, lgh, alpha] = Color.hexToHsl(Self.origin.value.trim()),
					root = Self.els.colorRing,
					box = root.find(".color-box"),
					target = event.target,
					pEl = target.getAttribute("data-el") ? $(target) : $(target).parents("div[data-el]"),
					type = pEl.data("el"),
					el = pEl.find("span"),
					rect = pEl[0].getBoundingClientRect(),
					dragEvent = {
						handler: APP.sidebar[section].dispatch,
						name: oParent.data("change"),
						gradient: APP.tools[APP.tools.active].gradient,
					};

				// create drag object
				Self.drag = {
					el,
					oParent,
					root,
					box,
					type,
					origin,
					stops,
					stopIndex,
					hue, sat, lgh, alpha,
					event: dragEvent,
					_PI: Math.PI,
					_abs: Math.abs,
					_min: Math.min,
					_max: Math.max,
					_sqrt: Math.sqrt,
					_atan2: Math.atan2,
				};
				// depending on clicked item
				switch (type) {
					case "ring":
						Self.drag.center = {
							x: rect.x + 83,
							y: rect.y + 83,
						};
						break;
					case "box":
						Self.drag.clickX = rect.x;
						Self.drag.clickY = rect.y;
						Self.drag.max = {
							w: +pEl.prop("offsetWidth") - 1,
							h: +pEl.prop("offsetHeight") - 1,
						};
						break;
					case "range":
						Self.drag.clickY = event.clientY - event.offsetY + 3;
						Self.drag.maxY = +pEl.prop("offsetHeight") - +el.prop("offsetHeight");
						el.css({ top: event.offsetY - 3 });
						break;
				}
				// trigger mousemove event for "first" calculation
				Self.doColorRing({
					type: "mousemove",
					drag: Self.drag,
					clientY: event.clientY,
					clientX: event.clientX,
				});
				// bind event after transition has ended
				Self.els.doc.on("mousemove mouseup", Self.doColorRing);
				break;
			case "mousemove":
				let top, left, hex;
				switch (Drag.type) {
					case "ring":
						Drag.hue = Drag._atan2(event.clientY - Drag.center.y, event.clientX - Drag.center.x) * (180 / Drag._PI);
						if (Drag.hue < 0) Drag.hue += 360;
						Drag.el.css({ transform: `rotate(${Drag.hue}deg)` });
						// update color of SL-box
						hex = Color.hslToHex(Drag.hue, 1, .5);
						Drag.root.css({ "--hue-color": hex });
						break;
					case "box":
						top = Drag._max(Drag._min(event.clientY - Drag.clickY, Drag.max.h), 0);
						left = Drag._max(Drag._min(event.clientX - Drag.clickX, Drag.max.w), 0);
						Drag.el.css({ top, left });
						// calculate color from pos
						let hsvValue = 1 - (((top + .01) / Drag.max.h * 100) / 100),
							hsvSaturation = (left / Drag.max.w * 100) / 100;
						Drag.lgh = (hsvValue / 2) * (2 - hsvSaturation);
						Drag.sat = (hsvValue * hsvSaturation) / (1 - Drag._abs(2 * Drag.lgh - 1));
						break;
					case "range":
						top = Drag._max(Drag._min(event.clientY - Drag.clickY, Drag.maxY), 0);
						Drag.alpha = top / Drag.maxY;
						Drag.el.css({ top });
						break;
				}
				hex = Color.hslToHex(Drag.hue, Drag.sat, Drag.lgh, Drag.alpha);
				Drag.root.css({ "--color": hex, "--color-opaque": hex.slice(0,-2) });

				// rgba = [...rgb, Drag.alpha];
				Drag.origin.css({ "--color": hex });
				Self.origin.value = hex;

				// update selected xl-element
				Drag.stops[Drag.stopIndex].color = hex;
				Drag.event.gradient.update(Drag.stops);

				// update sidebar strip
				let strip = Drag.stops.map(s => `${s.color} ${s.offset}%`);
				Drag.oParent.css({ "--gradient": `linear-gradient(to right, ${strip.join(",")})` });

				// route event
				// Drag.event.handler({
				// 	type: Drag.event.name,
				// 	el: Drag.oParent,
				// 	point: Drag.origin,
				// 	stops: Drag.stops,
				// 	hex
				// });
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.doColorRing);
				break;
		}
	}
}
