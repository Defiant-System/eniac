
{
	init() {
		// fast references
		let root = window.find(".table-tools");
		this.els = {
			root,
			doc: $(document),
			move: root.find(".tool.move"),
			resizes: root.find(".tool.resize, .tool.v-resize, .tool.h-resize"),
		};

		// bind event handlers
		this.els.move.on("mousedown", this.move);
		this.els.resizes.on("mousedown", this.resize);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools,
			el;
		switch (event.type) {
			// system events
			case "window.keystroke":
				// special handling of special keys
				switch (event.char) {
					case "esc":
						Self.dispatch({ type: "blur-table" });
						break;
					case "tab":
					case "return":
						APP.selection.dispatch({ type: "move-right" });
						break;
					case "up":
					case "down":
					case "right":
					case "left":
						APP.selection.dispatch({ type: "move-"+ event.char });
						break;
				}
				break;
			// custom events
			case "select-columns":
				console.log(event.type, event.target);
				break;
			case "select-rows":
				console.log(event.type, event.target);
				break;
		}
	},
	resize(event) {
		let APP = eniac,
			Self = APP.tools,
			Drag = Self.drag,
			top, left,
			table,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
				break;
			case "mousemove":
				break;
			case "mouseup":
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	},
	move(event) {
		let APP = eniac,
			Self = APP.tools,
			Drag = Self.drag,
			top, left,
			table,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				
				el = window.find(".sheet, .table-tools");
				table = window.find(".sheet");
				// create drag object
				Self.drag = {
					el,
					clickX: event.clientX,
					clickY: event.clientY,
					offset: {
						x: table.prop("offsetLeft"),
						y: table.prop("offsetTop"),
					}
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.move);
				break;
			case "mousemove":
				top = event.clientY - Drag.clickY + Drag.offset.y;
				left = event.clientX - Drag.clickX + Drag.offset.x;

				Drag.el.css({
					top: top +"px",
					left: left +"px",
				});
				break;
			case "mouseup":
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.move);
				break;
		}
	}
}
