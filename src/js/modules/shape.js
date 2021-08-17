
// eniac.shape

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
		window.find("content > div.body").on("mousedown", ".shape", event => {
			this.dispatch({ type: "focus-shape", el: $(event.target) });
			this.move(event);
		});
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.shape,
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
				break;
		}
	},
	resize(event) {
		let APP = eniac,
			Self = APP.shape,
			Drag = Self.drag,
			shape,
			el;
		switch (event.type) {
			case "mousedown":
				shape = Self.shape;
				el = $([shape[0], Self.els.root[0]]);
				// create drag object
				Self.drag = {
					el,
					clickX: event.clientX,
					clickY: event.clientY,
					offset: {
						w: shape.prop("offsetWidth"),
						h: shape.prop("offsetHeight"),
					}
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
				break;
			case "mousemove":
				let height = event.clientY - Drag.clickY + Drag.offset.h,
					width = event.clientX - Drag.clickX + Drag.offset.w;
				Drag.el.css({ width, height });
				break;
			case "mouseup":
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	},
	move(event) {
		let APP = eniac,
			Self = APP.shape,
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
	}
}
