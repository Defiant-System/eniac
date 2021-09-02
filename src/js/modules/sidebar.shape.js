
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
			fill,
			value,
			width,
			el;
		switch (event.type) {
			case "select-fill-type":
				el = $(event.target);
				el.parent().find(".active_").removeClass("active_");
				el.addClass("active_");

				el.parents(".group-row")
					.removeClass("solid-options linearGradient-options radialGradient-options")
					.addClass(`${el.data("arg")}-options`);
				break;
			case "populate-shape-values":
				Self.dispatch({ ...event, type: "update-shape-style" });
				Self.dispatch({ ...event, type: "update-shape-fill" });
				Self.dispatch({ ...event, type: "update-shape-outline-width" });
				break;
			case "update-shape-style":
				// reset (if any) previous active
				Els.el.find(".shape-styles .active").removeClass("active");
				// update sidebar value
				fill = Shape.shapeItem.cssProp("fill");
				if (!fill.startsWith("url(")) {
					value = Color.rgbToHex(fill);
					Els.el.find(`.shape-styles span[data-arg="${value}"]`).addClass("active");
				}
				break;
			case "update-shape-fill":
				el = Els.el.find(".gradient-colors");
				width = +el.prop("offsetWidth") - 2;
				
				// click option button
				value = APP.tools.shape.gradient.type || "solid";
				Self.parent.els.el.find(`.option-buttons_ span[data-arg="${value}"]`).trigger("click");
				switch (value) {
					case "linearGradient":
					case "radialGradient":
						// gradient
						let points = [],
							strip = [];
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
					default:
						// fill solid
						Self.parent.els.el.find(`.color-preset_[data-change="set-shape-fill-color"]`)
							.css({ "--preset-color": APP.tools.shape.fill });
				}
				break;
			case "update-shape-outline-width":
				value = parseInt(Shape.shapeItem.css("stroke-width"), 10);
				Els.el.find("input#shape-outline").val(value);
				break;
			case "set-shape-style":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				// update shape element
				Shape.shapeItem.css({ fill: el.data("arg") });
				break;
			case "set-fill-gradient-color":
				console.log(event);
				break;
			case "set-shape-fill-color":
				APP.tools.shape.shapeItem.css({ fill: event.value });
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
				};

				// bind event
				Parent.els.doc.on("mousemove mouseup", Self.gradientPoints);
				break;
			case "mousemove":
				let top = event.clientY - Drag.click.y,
					left = Drag._max(Drag._min(event.clientX - Drag.click.x, Drag.max.x), 0),
					offsetX = Drag._round((left / Drag.max.x) * 1000) / 10,
					strip;
				Drag.el.css({ left });
				Drag.el[top > Drag.max.y || top < -11 ? "addClass" : "removeClass"]("hidden");
				
				// add dragged point data
				Drag.stops[Drag.index].offset = offsetX;
				strip = Drag.stops.map(stop => `${stop.color} ${stop.offset}%`);
				Drag.pEl.css({ "--gradient": `linear-gradient(to right, ${strip.join(",")})` });

				// svg gradient stop update
				Drag.stops[Drag.index].xNode.attr({ offset: offsetX +"%" });
				break;
			case "mouseup":
				if (Date.now() - Drag.clickTime < 250) {
					// time check for "click"
					setTimeout(() =>
						APP.popups.dispatch({ type: "popup-color-ring", target: event.target }));
				}
				// reset dragged element
				Drag.el.removeClass("dragging");
				// unbind event
				Parent.els.doc.off("mousemove mouseup", Self.gradientPoints);
				break;
		}
	}
}
