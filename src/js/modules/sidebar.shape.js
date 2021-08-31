
// eniac.sidebar.shape

{
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar.shape,
			Els = APP.sidebar.els,
			Shape = event.shape || APP.tools.shape.shape,
			ShapeItem = event.shapeItem || APP.tools.shape.shapeItem,
			name,
			value,
			el;
		switch (event.type) {
			case "populate-shape-values":
				Self.dispatch({ ...event, type: "update-shape-style" });
				Self.dispatch({ ...event, type: "update-shape-outline-width" });
				break;
			case "update-shape-style":
				// reset (if any) previous active
				Els.el.find(".shape-styles .active").removeClass("active");
				// update sidebar value
				// value = Color.rgbToHex(Shape.find("path").cssProp("fill"));
				// Els.el.find(`.shape-styles span[data-arg="${value}"]`).addClass("active");
				break;
			case "update-shape-outline-width":
				value = parseInt(ShapeItem.css("stroke-width"), 10);
				Els.el.find("input#shape-outline").val(value);
				break;
			case "set-shape-style":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				// update shape element
				Shape.find("path").css({ fill: el.data("arg") });
				break;
			case "set-fill-gradient-color":
				console.log(event);
				break;
			case "set-shape-outline-width":
				ShapeItem.css({ "stroke-width": +event.value +"px" });
				break;
		}
	}
}
