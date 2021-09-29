
// eniac.tools.image

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
			Self = APP.tools.image,
			Image = Self.image,
			el;
		switch (event.type) {
			// system events
			case "window.keystroke":
				console.log(event);
				break;
			// csutom events
			case "focus-image":
				// resize tools
				let top = parseInt(event.el.css("top"), 10),
					left = parseInt(event.el.css("left"), 10),
					width = parseInt(event.el.css("width"), 10),
					height = parseInt(event.el.css("height"), 10);
				Self.els.root
					.css({ top, left, width, height })
					.removeClass("hidden");

				// remember text element
				Self.image = event.el;
				break;
		}
	},
	move(event) {
		let APP = eniac,
			Self = APP.tools.image,
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
				Self.els.layout.addClass("cover hideMouse1 hideTools");

				let image = Self.image,
					x = +el.prop("offsetLeft"),
					y = +el.prop("offsetTop"),
					w = +el.prop("offsetWidth"),
					h = +el.prop("offsetHeight"),
					offset = { x, y },
					click = {
						x: event.clientX - x,
						y: event.clientY - y,
					},
					guides = new Guides({
						selector: ".xl-table, .xl-shape, .xl-image, .xl-text",
						context: "content .body",
						offset: {
							el: image[0],
							t: y,
							l: x,
							w,
							h,
						}
					});

				// create drag object
				Self.drag = {
					el: $([image[0], Self.els.root[0]]),
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
						restrict: event.shiftKey,
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
				Self.els.layout.removeClass("cover hideMouse1 hideTools");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.move);
				break;
		}
	},
	resize(event) {
		let APP = eniac,
			Self = APP.tools.image,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// cover layout
				Self.els.layout.addClass("cover hideMouse");

				let image = Self.image,
					type = event.target.className.split(" ")[1],
					w = +image.prop("offsetWidth"),
					h = +image.prop("offsetHeight"),
					click = {
						x: event.clientX,
						y: event.clientY,
					},
					offset = {
						x: +image.prop("offsetLeft"),
						y: +image.prop("offsetTop"),
						w,
						h,
						r: ["nw", "se"].includes(type)
							? Math.atan2(h, -w) * 180 / Math.PI
							: Math.atan2(h, w) * 180 / Math.PI,
						ratio: w / h,
					},
					min = {
						w: 50,
						h: Math.round(50 / offset.ratio),
					},
					guides = new Guides({
						selector: ".xl-table, .xl-shape, .xl-image, .xl-text",
						context: "content .body",
						offset: { el: image[0], ...offset, type }
					});

				// create drag object
				Self.drag = {
					el: $([image[0], Self.els.root[0]]),
					min,
					type,
					click,
					offset,
					guides,
					_round: Math.round,
					_max: Math.max,
				};

				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
				break;
			case "mousemove":
				let dim = {
						...Drag.offset,
						min: Drag.min,
						width: Drag.offset.w,
						height: Drag.offset.h,
						diagonal: Drag.type.length === 2,
						uniform: true,
					};
				// movement: east
				if (Drag.type.includes("e")) {
					dim.left = event.clientX - Drag.click.x + Drag.offset.x;
					dim.width = Drag.offset.w + Drag.click.x - event.clientX;
				}
				// movement: west
				if (Drag.type.includes("w")) {
					dim.width = event.clientX - Drag.click.x + Drag.offset.w;
				}
				// movement: north
				if (Drag.type.includes("n")) {
					dim.top = event.clientY - Drag.click.y + Drag.offset.y;
					dim.height = Drag.offset.h + Drag.click.y - event.clientY;
				}
				// movement: south
				if (Drag.type.includes("s")) {
					dim.height = event.clientY - Drag.click.y + Drag.offset.h;
				}

				// "filter" position with guide lines
				Drag.guides.snapDim(dim);

				// apply new dimensions to element
				if (dim.width < Drag.min.w) dim.width = Drag.min.w;
				if (dim.height < Drag.min.h) dim.height = Drag.min.h;
				Drag.el.css({
						top: dim.top,
						left: dim.left,
						width: dim.width,
						height: dim.height,
					});
				break;
			case "mouseup":
				// re-focuses shape tools
				Self.dispatch({ type: "focus-image", el: Self.image });
				// hide guides
				Drag.guides.reset();
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	}
}