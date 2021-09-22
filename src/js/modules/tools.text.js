
// eniac.tools.text

{
	init() {
		// fast references
		this.els = {
			root: window.find(".text-tools"),
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
			case "focus-text":
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
				// cover layout
				Self.els.layout.addClass("cover hideMouse hideTools");

				// if mousedown on handle
				let el = $(event.target),
					offset = {
						x: el.prop("offsetLeft"),
						y: el.prop("offsetTop"),
					},
					click = {
						x: event.clientX - offset.x,
						y: event.clientY - offset.y,
					};

				// create drag object
				Self.drag = {
					el,
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
				// move dragged object
				Drag.el.css(pos);
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse hideTools");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.move);
				break;
		}
	}
}
