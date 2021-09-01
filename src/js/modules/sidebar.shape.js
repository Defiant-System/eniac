
// eniac.sidebar.shape

{
	init(parent) {
		// fast reference
		this.parent = parent;
		// bind event handlers
		parent.els.el.on("mousedown", ".gradient-colors .point", this.gradientPoints);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar.shape,
			Els = APP.sidebar.els,
			Shape = event.shape || APP.tools.shape,
			name,
			value,
			width,
			el;
		switch (event.type) {
			case "populate-shape-values":
				Self.dispatch({ ...event, type: "update-shape-style" });
				Self.dispatch({ ...event, type: "update-shape-fill" });
				Self.dispatch({ ...event, type: "update-shape-outline-width" });
				break;
			case "update-shape-style":
				// reset (if any) previous active
				Els.el.find(".shape-styles .active").removeClass("active");
				// update sidebar value
				// value = Color.rgbToHex(Shape.find("path").cssProp("fill"));
				// Els.el.find(`.shape-styles span[data-arg="${value}"]`).addClass("active");
				break;
			case "update-shape-fill":
				el = Els.el.find(".gradient-colors");
				width = +el.prop("offsetWidth") - 2;
				
				// gradient
				let points = [], strip = [];
				Shape.gradient.stops.map(stop => {
					strip.push(`${stop.color} ${stop.offset}%`);
					points.push(`<span class="point" style="left: ${stop.offset * width / 100}px; --color: ${stop.color}; --offset: ${stop.offset};"></span>`);
				});
				el.html(points.join(""));
				el.css({ "--gradient": `linear-gradient(to right, ${strip.join(",")})` });

				// gradient angle value
				el = APP.tools.shape.els.gradientTool;
				let [a, b] = el.css("transform").split("(")[1].split(")")[0].split(",");
				value = Math.atan2(b, a) * 180 / Math.PI;
				Els.el.find("input#shape-gradient-angle").val(value);
				break;
			case "update-shape-outline-width":
				value = parseInt(Shape.shapeItem.css("stroke-width"), 10);
				Els.el.find("input#shape-outline").val(value);
				break;
			case "set-shape-style":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				// update shape element
				Shape.shape.find("path").css({ fill: el.data("arg") });
				break;
			case "set-fill-gradient-color":
				console.log(event);
				break;
			case "set-shape-outline-width":
				Shape.shapeItem.css({ "stroke-width": +event.value +"px" });
				break;
		}
	},
	gradientPoints(event) {
		let APP = eniac,
			Self = APP.sidebar.shape,
			Parent = Self.parent,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// dragged element
				let el = $(event.target).addClass("dragging"),
					pEl = el.parent(),
					index = el.index(),
					stops = [...APP.tools.shape.gradient.stops];

				// create drag object
				Self.drag = {
					el,
					pEl,
					stops,
					index,
					clickX: event.clientX - event.offsetX,
					offsetX: +el.prop("offsetLeft"),
					maxX: +el.parent().prop("offsetWidth") - 2,
				};

				// Popup.dispatch({ type: "popup-color-ring" })

				// bind event
				Parent.els.doc.on("mousemove mouseup", Self.gradientPoints);
				break;
			case "mousemove":
				let left = Math.max(Math.min(event.clientX - Drag.clickX + Drag.offsetX, Drag.maxX), 0),
					offset = Math.round((left / Drag.maxX) * 1000) / 10,
					strip;
				Drag.el.css({ left });
				
				// add dragged point data
				Drag.stops[Drag.index].offset = offset;
				strip = Drag.stops.map(stop => `${stop.color} ${stop.offset}%`);
				Drag.pEl.css({ "--gradient": `linear-gradient(to right, ${strip.join(",")})` });

				// svg gradient stop update
				Drag.stops[Drag.index].xNode.attr({ offset: offset +"%" });
				break;
			case "mouseup":
				// reset dragged element
				Drag.el.removeClass("dragging");
				// unbind event
				Parent.els.doc.off("mousemove mouseup", Self.gradientPoints);
				break;
		}
	}
}
