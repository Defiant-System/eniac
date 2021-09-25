
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
				Self.els.layout.addClass("cover hideMouse hideTools");

				let image = Self.image,
					offset = {
						x: el.prop("offsetLeft"),
						y: el.prop("offsetTop"),
					},
					click = {
						x: event.clientX - offset.x,
						y: event.clientY - offset.y,
					},
					guides = new Guides({
						selector: ".sheet, .xl-shape, .xl-image, .xl-text",
						context: "content .body",
						offset: {
							el: image[0],
							w: el.prop("offsetWidth"),
							h: el.prop("offsetHeight"),
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
						diagonal: type.length === 2,
					},
					min = {
						w: 50,
						h: Math.round(50 / offset.ratio),
					},
					calcMore = function(dim) {
						dim._more.map(i => {
							switch (i) {
								case "t":  dim.top = this._round(dim.y + ((dim.h - dim.height) >> 1)); break;
								case "t2": dim.top = this._round(dim.y + dim.h - dim.height); break;
								case "l":  dim.left = this._round(dim.x + ((dim.w - dim.width) >> 1)); break;
								case "l2": dim.left = this._round(dim.x + dim.w - dim.width); break;
								case "h":  dim.height = this._max(this._round(dim.width / dim.ratio), this.min.h); break;
								case "w":  dim.width = this._max(this._round(dim.height * dim.ratio), this.min.w); break;
							}
						});
					},
					guides = new Guides({
						selector: ".sheet, .xl-shape, .xl-image, .xl-text",
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
					calcMore,
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
						uniform: true,
					};
				// movement: east
				if (Drag.type.includes("e")) {
					dim.left = event.clientX - Drag.click.x + Drag.offset.x;
					dim.width = Drag.offset.w + Drag.click.x - event.clientX;
					// dim._more = ["h", "t"];
				}
				// movement: west
				if (Drag.type.includes("w")) {
					dim.width = event.clientX - Drag.click.x + Drag.offset.w;
					// dim._more = ["h", "t"];
				}
				// movement: north
				if (Drag.type.includes("n")) {
					dim.top = event.clientY - Drag.click.y + Drag.offset.y;
					dim.height = Drag.offset.h + Drag.click.y - event.clientY;
					// dim._more = ["w", "l"];
					// ratio resize
					// if (Drag.offset.diagonal) dim._more = ["h", "t2"];
					// if (dim.uniform) dim._more = ["h", "t2"];
				}
				// movement: south
				if (Drag.type.includes("s")) {
					dim.height = event.clientY - Drag.click.y + Drag.offset.h;
					// dim._more = ["w", "l"];
					// ratio resize
					// if (Drag.type === "sw") dim._more = ["w"];
					// else if (Drag.type === "se") dim._more = ["w", "l2"];
				}
				// calculate ratio resize
				// Drag.calcMore(dim);

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
