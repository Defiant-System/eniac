
// eniac.sidebar.shape

{
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
				
				let points = [], strip = [];
				Shape.gradient.stops.map(stop => {
					strip.push(`${stop.color} ${stop.offset}%`);
					points.push(`<span class="point" style="left: ${stop.offset * width / 100}px; --color: ${stop.color};"></span>`);
				});

				el.html(points.join(""));
				el.css({ "--gradient": `linear-gradient(to right, ${strip.join(",")})` });
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
	}
}
