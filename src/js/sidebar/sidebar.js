
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

		// bind event handlers
		this.els.el.on("mousedown", ".gradient-colors", this.gradientPoints);
		this.els.el.on("mousedown", ".angle-ring", this.angleRing);
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
			case "toggle-group-body":
				el = event.el.parent();
				value = el.hasClass("expanded");
				el.toggleClass("expanded", value);
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
	gradientPoints(event) {
		let APP = eniac,
			Self = APP.sidebar,
			Parent = Self.parent,
			Drag = Self.drag,
			stops;
		switch (event.type) {
			case "mousedown": {
				// prevent default behaviour
				event.preventDefault();

				// dragged element
				let el = $(event.target),
					pEl = el.parent(),
					index = el.index(),
					siblings = pEl.find("span"),
					gradient = APP.tools[APP.tools.active].gradient,
					discardable = gradient.stops.length > 2;

				// create drag object
				Self.drag = {
					el,
					pEl,
					siblings,
					gradient,
					discardable,
					clickTime: Date.now(),
					click: {
						y: event.clientY - +el.prop("offsetTop"),
						x: event.clientX - +el.prop("offsetLeft"),
					},
					max: {
						x: +pEl.prop("offsetWidth") - 2,
						y: +pEl.prop("offsetHeight") + parseInt(pEl.css("marginBottom"), 10) - 11,
					},
					_max: Math.max,
					_min: Math.min,
					_round: Math.round,
					getStops() {
						return this.siblings
								.filter(el => !el.classList.contains("hidden"))
								.map(el => {
									let offset = Math.round(el.offsetLeft / this.max.x * 1000) / 10,
										color = getComputedStyle(el).getPropertyValue("--color").trim();
									return { offset, color };
								})
								.sort((a, b) => a.offset - b.offset);
					}
				};

				if (el.hasClass("gradient-colors")) {
					// add new gradient point
					let stops = [...gradient.stops],
						offset = Math.round(event.offsetX / Self.drag.max.x * 1000) / 10;
					stops.map((stop, i) => { if (stop.offset < offset) index = i; });
					
					let stop1 = stops[index],
						stop2 = stops[index+1],
						perc = ((offset - stop1.offset) / (stop2.offset - stop1.offset)),
						color = Color.mixColors(stop2.color, stop1.color, perc),
						str = `<span class="point" style="left: ${event.offsetX}px; --color: ${color}; --offset: ${offset};"></span>`,
						target = el.insertAt(str, index)[0],
						clientX = event.clientX,
						clientY = event.clientY,
						preventDefault = () => {};
					// add new stop to array
					gradient.add({ offset, color }, index + 1);
					// trigger "fake" mousedown event on new point
					Self.gradientPoints({ type: "mousedown", target, clientX, clientY, preventDefault });
					return;
				}
				// point is being dragged
				el.addClass("dragging");

				// bind event
				Self.els.doc.on("mousemove mouseup", Self.gradientPoints);
				} break;
			case "mousemove":
				let top = event.clientY - Drag.click.y,
					left = Drag._max(Drag._min(event.clientX - Drag.click.x, Drag.max.x), 0),
					offsetX = Drag._round(left / Drag.max.x * 1000) / 10,
					discard = top > Drag.max.y || top < -11,
					strip;
				Drag.el.css({ left });
				// discardable gradient stop
				if (Drag.discardable) {
					Drag.el[discard ? "addClass" : "removeClass"]("hidden");
				}
				// compose stops array and update SVG
				stops = Drag.getStops();
				Drag.gradient.update(stops);

				// create sidebar gradient strip
				strip = stops.filter(s => !s.discard)
							.map(stop => `${stop.color} ${stop.offset}%`);
				Drag.pEl.css({ "--gradient": `linear-gradient(to right, ${strip.join(",")})` });
				break;
			case "mouseup":
				if (Date.now() - Drag.clickTime < 250) {
					// time check for "click"
					setTimeout(() =>
						APP.popups.dispatch({ type: "popup-color-ring", target: event.target }));
				}

				// reset dragged element
				Drag.el.removeClass("dragging");
				// check if point is to be removed
				if (Drag.el.hasClass("hidden")) {
					// delete element
					Drag.el.remove();
					// compose stops array and update SVG
					stops = Drag.getStops();
					Drag.gradient.update(stops);
				}
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.gradientPoints);
				break;
		}
	},
	angleRing(event) {
		let APP = eniac,
			Self = APP.sidebar,
			Parent = Self.parent,
			Drag = Self.drag,
			stops;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover hideMouse show-angle-ring");

				let el = $(event.target),
					iEl = el.nextAll("input:first"),
					[a, b] = el.css("transform").split("(")[1].split(")")[0].split(","),
					deg = Math.round(Math.atan2(b, a) * (180 / Math.PI));
				// translate deg to 0-360 range
				if (deg < 0) deg += 360;
				
				Self.drag = {
					el,
					iEl,
					click: { y: event.clientY - deg },
				};

				// bind event
				Self.els.doc.on("mousemove mouseup", Self.angleRing);
				break;
			case "mousemove":
				let d = event.clientY - Drag.click.y;
				Drag.el.css({ transform: `rotate(${d}deg)` });
				// input element
				Drag.iEl.val((d + 3510) % 360).trigger("change");
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse show-angle-ring");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.angleRing);
				break;
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
