
// eniac.sidebar.line

{
	init(parent) {
		// fast reference
		this.parent = parent;
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar.line,
			Els = APP.sidebar.els,
			Shape = event.shape || APP.tools.shape,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "populate-line-values":
				event.values = Self.dispatch({ ...event, type: "collect-line-values" });

				Self.dispatch({ ...event, type: "update-line-style" });
				Self.dispatch({ ...event, type: "update-line-stroke" });
				Self.dispatch({ ...event, type: "update-line-shadow" });
				Self.dispatch({ ...event, type: "update-line-reflection" });
				Self.dispatch({ ...event, type: "update-line-opacity" });
				break;
			case "collect-line-values": {
				let stroke = {},
					shadow = {},
					reflection = {},
					opacity = {};

				// border values
				stroke.width = parseInt(Shape.shapeItem.css("stroke-width"), 10);
				stroke.color = Color.rgbToHex(Shape.shapeItem.css("stroke")).slice(0,-2);
				stroke.dash = Shape.shapeItem.css("stroke-dasharray").split(",").map(i => parseInt(i, 10) || 0);
				stroke._expand = true;
				console.log(stroke);

				// shadow values
				shadow._expand = true;

				// reflection values
				reflection._expand = true;

				// opacity values
				opacity._expand = true;

				let data = { stroke, shadow, reflection, opacity };
				Object.keys(data).map(key => {
					let el = Self.parent.els.el.find(`.group-row.line-${key}-options`);
					if (data[key]._expand) el.addClass("expanded");
					else el.removeClass("expanded");
				});
				
				return data; }
			case "update-line-style":
				break;
			case "update-line-stroke": break;
			case "update-line-shadow": break;
			case "update-line-reflection": break;
			case "update-line-opacity": break;
		}
	}
}
