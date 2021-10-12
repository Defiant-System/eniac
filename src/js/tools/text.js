
// eniac.tools.text

{
	init() {
		// fast references
		this.els = {
			root: window.find(".shape-tools"),
			doc: $(document),
			layout: window.find("layout"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools.text,
			Text = Self.text,
			el;
		switch (event.type) {
			// custom events
			case "focus-text":
				// resize tools
				let top = parseInt(event.el.css("top"), 10),
					left = parseInt(event.el.css("left"), 10),
					width = parseInt(event.el.css("width"), 10),
					height = parseInt(event.el.css("height"), 10);
				Self.els.root
					.css({ top, left, width, height })
					.removeClass("hidden");

				el = event.el;

				let gradient = {},
					bg = el.css("background"),
					type = bg.match(/(linear|radial)-gradient\(([^()]*|\([^()]*\))*\)/g);

				if (type) {
					gradient = {
						el,
						str: type[0],
						type: type[0].slice(0,6),
						get stops() {
							let stops = this.str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(1|0\.\d+))?\) \d+./g);
							return stops.map(stop => ({
								color: Color.rgbToHex(stop.split(")")[0] +")"),
								offset: parseInt(stop.split(")")[1].trim(), 10),
							}));
						},
						add(stop, index) {

						},
						update(stops) {

						}
					};

					console.log( type[0] );
				}

				// remember text element
				Self.text = el;
				Self.gradient = gradient;
				break;
		}
	},
	move(event) {
		let APP = eniac,
			Self = APP.tools.text,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// if mousedown on handle
				let el = $(event.target);
				if (el.hasClass("handle")) {
					return Self.resize(event);
				}
				
				// cover layout
				Self.els.layout.addClass("cover hideMouse hideTools");

				let text = Self.text.el,
					offset = {
						x: el.prop("offsetLeft"),
						y: el.prop("offsetTop"),
					},
					click = {
						x: event.clientX - offset.x,
						y: event.clientY - offset.y,
					},
					guides = new Guides({
						offset: {
							el: text,
							w: el.prop("offsetWidth"),
							h: el.prop("offsetHeight"),
						}
					});

				// create drag object
				Self.drag = {
					el: $([text, Self.els.root[0]]),
					guides,
					click,
				};

				// bind event
				Self.els.doc.on("mousemove mouseup", Self.move);
				break;
			case "mousemove":
				let pos = {
						top: event.clientY - Drag.click.y,
						left: event.clientX - Drag.click.x,
					};
				// "filter" position with guide lines
				Drag.guides.snapPos(pos);
				// move dragged object
				Drag.el.css(pos);
				break;
			case "mouseup":
				// hide guides
				Drag.guides.reset();
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse hideTools");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.move);
				break;
		}
	},
	resize(event) {
		let APP = eniac,
			Self = APP.tools.text,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// cover layout
				Self.els.layout.addClass("cover");

				let text = Self.text.el,
					type = event.target.className.split(" ")[1],
					min = { w: 50 },
					click = {
						x: event.clientX,
					},
					offset = {
						x: +text.prop("offsetLeft"),
						w: +text.prop("offsetWidth"),
					};

				// create drag object
				Self.drag = {
					el: $([text, Self.els.root[0]]),
					min,
					type,
					click,
					offset,
				};

				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
				break;
			case "mousemove":
				let dim = { width: Drag.offset.w };
				// movement: east
				if (Drag.type.includes("e")) {
					dim.left = event.clientX - Drag.click.x + Drag.offset.x;
					dim.width = Drag.offset.w + Drag.click.x - event.clientX;
				}
				// movement: west
				if (Drag.type.includes("w")) {
					dim.width = event.clientX - Drag.click.x + Drag.offset.w;
				}

				// apply new dimensions to element
				if (dim.width < Drag.min.w) dim.width = Drag.min.w;
				Drag.el.css(dim);
				break;
			case "mouseup":
				// re-focuses shape tools
				Self.dispatch({ type: "focus-text", el: Self.text.el });
				// uncover layout
				Self.els.layout.removeClass("cover");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	}
}
