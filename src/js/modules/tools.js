
{
	init() {
		// fast references
		let root = window.find(".table-tools");
		this.els = {
			root,
			doc: $(document),
			move: root.find(".tool.move"),
			resize: root.find(".tool.resize"),
			vResize: root.find(".tool.v-resize"),
			hResize: root.find(".tool.h-resize"),
		};

		// bind event handlers
		this.els.move.on("mousedown", this.move);
	},
	dispatch(event) {
		let APP = numbers,
			Self = APP.tools,
			el;
		switch (event.type) {
			// custom events
			case "move-table":
				break;
		}
	},
	move(event) {
		let APP = numbers,
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

				Self.drag = {
					el,
					clickX: event.clientX,
					clickY: event.clientY,
					offset: {
						x: table.prop("offsetLeft"),
						y: table.prop("offsetTop"),
					}
				};

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
				Self.els.doc.off("mousemove mouseup", Self.move);
				break;
		}
	}
}
