
// eniac.tools.shape

{
	init() {
		// fast references
		let root = window.find(".shape-tools");
		this.els = {
			root,
			doc: $(document),
		};

		// bind event handlers
		this.els.root.on("mousedown", this.move);
		window.find("content > div.body").on("mousedown", event => {
			let el = $(event.target),
				body = el.parents("div.body");
			if (el.hasClass("handle")) {
				this.gradientMove(event);
			} else if (el.hasClass("shape")) {
				// blur table, if any
				Cursor.dispatch({ type: "blur-table", el: body });
				// focus shape
				this.dispatch({ type: "focus-shape", el });
				this.move(event);
			} else {
				this.dispatch({ type: "blur-shape", el: body });
			}
		});
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools.shape,
			Shape = Self.shape,
			top, left, width, height,
			el;
		switch (event.type) {
			// native events
			case "blur-shape":
				if (event.el.hasClass("body")) {
					Self.els.root.addClass("hidden");
					// forget shape
					Self.shape = false;
				}
				break;
			case "focus-shape":
				top = event.el.prop("offsetTop");
				left = event.el.prop("offsetLeft");
				width = event.el.prop("offsetWidth");
				height = event.el.prop("offsetHeight");
				Self.els.root
					.css({ top, left, width, height })
					.removeClass("hidden");
				// remember shape
				Self.shape = event.el;
				// update sidebar
				APP.sidebar.dispatch({ ...event, type: "show-shape" });
				break;
		}
	},
	resize(event) {
		let APP = eniac,
			Self = APP.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				let shape = Self.shape,
					el = $([shape[0], Self.els.root[0]]),
					type = event.target.className.split(" ")[1];
				// create drag object
				Self.drag = {
					el,
					type,
					clickX: event.clientX,
					clickY: event.clientY,
					offset: {
						x: shape.prop("offsetLeft"),
						y: shape.prop("offsetTop"),
						w: shape.prop("offsetWidth"),
						h: shape.prop("offsetHeight"),
					}
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
				break;
			case "mousemove":
				let data = {};
				if (Drag.type.includes("n")) {
					data.top = event.clientY - Drag.clickY + Drag.offset.y;
					data.height = Drag.offset.h + Drag.clickY - event.clientY;
				}
				if (Drag.type.includes("e")) {
					data.left = event.clientX - Drag.clickX + Drag.offset.x;
					data.width = Drag.offset.w + Drag.clickX - event.clientX;
				}
				if (Drag.type.includes("s")) {
					data.height = event.clientY - Drag.clickY + Drag.offset.h;
				}
				if (Drag.type.includes("w")) {
					data.width = event.clientX - Drag.clickX + Drag.offset.w;
				}
				Drag.el.css(data);
				break;
			case "mouseup":
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	},
	move(event) {
		let APP = eniac,
			Self = APP.tools.shape,
			Drag = Self.drag,
			shape,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// if mousedown on handle
				if ($(event.target).hasClass("handle")) {
					return Self.resize(event);
				}
				
				shape = Self.shape;
				el = $([shape[0], Self.els.root[0]]);
				// create drag object
				Self.drag = {
					el,
					clickX: event.clientX,
					clickY: event.clientY,
					offset: {
						x: shape.prop("offsetLeft"),
						y: shape.prop("offsetTop"),
					}
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.move);
				break;
			case "mousemove":
				let top = event.clientY - Drag.clickY + Drag.offset.y,
					left = event.clientX - Drag.clickX + Drag.offset.x;
				Drag.el.css({ top, left });
				break;
			case "mouseup":
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.move);
				break;
		}
	},
	gradientMove(event) {
		let APP = eniac,
			Self = APP.tools.shape,
			Drag = Self.drag,
			shape,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				console.log(event);
				break;
			case "mousemove":
				break;
			case "mouseup":
				break;
		}
	}
}
