
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
			color,
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

				// shadow values
				shadow.filter = Shape.shapeItem.css("filter");
				shadow._expand = shadow.filter !== "none";

				// reflection values
				reflection.reflect = Shape.shape.css("-webkit-box-reflect");
				reflection._expand = Shape.shape.hasClass("reflection");

				// opacity values
				opacity.value = +Shape.shapeItem.css("opacity");
				opacity._expand = opacity.value !== 1;

				let data = { stroke, shadow, reflection, opacity };
				Object.keys(data).map(key => {
					let el = Self.parent.els.el.find(`.group-row.line-${key}-options`);
					if (data[key]._expand) el.addClass("expanded");
					else el.removeClass("expanded");
				});
				
				return data; }
			// Updaters
			case "update-line-style":
				// reset (if any) previous active
				Els.el.find(".line-styles .active").removeClass("active");
				// update sidebar value
				color = event.values.stroke.color;
				Els.el.find(`.line-styles span[data-arg="${color}"]`).addClass("active");
				break;
			case "update-line-stroke":
				// outline style
				color = event.values.stroke.color;
				value = event.values.stroke.dash;
				el = Els.el.find(".line-stroke").addClass("has-prefix-icon");
				switch (true) {
					case value[0] === value[1]:
						value = "dotted";
						break;
					case value[0] === value[1] * 2:
						value = "dashed";
						break;
					case color === "none":
						value = "none";
						el.removeClass("has-prefix-icon");
						break;
					default:
						value = "solid";
				}
				el.val(value);

				// outline color
				value = color === "none" ? "transparent" : color;
				Els.el.find(`.color-preset_[data-change="set-line-stroke-color"]`)
							.css({ "--preset-color": value });
				
				// outline width
				value = color === "none" ? 0 : event.values.stroke.width;
				Els.el.find("input#line-stroke").val(value);
				break;
			case "update-line-shadow": {
				let filter = event.values.shadow.filter,
					rgbColor = filter.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(1|0\.\d+))?\)/),
					hexColor = rgbColor ? Color.rgbToHex(rgbColor[0]) : false,
					opacity = rgbColor ? Math.round(parseInt(hexColor.slice(-2), 16) / 255 * 100) : 100,
					shadow = filter.match(/(\d+)px\s*(\d+)px\s*(\d+)px/),
					bX = shadow ? +shadow[1] : 0,
					bY = shadow ? +shadow[2] : 0,
					blur = shadow ? +shadow[3] : 0,
					angle = Math.round(Math.atan2(bY, bX) * (180 / Math.PI)),
					offset = Math.round(Math.sqrt(bY*bY + bX*bX));
				// drop-shadow values
				Els.el.find(".line-shadow-blur input").val(blur);
				Els.el.find(".line-shadow-offset input").val(offset);
				Els.el.find(".line-shadow-opacity input").val(opacity);
				Els.el.find(`input[name="line-shadow-angle"]`).val(angle);
				// drop-shadow color
				hexColor = hexColor ? hexColor.slice(0, -2) : "transparent";
				Els.el.find(`.color-preset_[data-change="set-line-shadow"]`)
							.css({ "--preset-color": hexColor });
				} break;
			case "update-line-reflection":
				value = event.values.reflection.reflect.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(1|0\.\d+))?\)/);
				value = value ? Math.round(value[4] * 100) : 0;
				Els.el.find(".line-reflection input").val(value);
				break;
			case "update-line-opacity":
				value = event.values.opacity.value * 100;
				Els.el.find(".line-opacity input").val(value);
				break;
			// Setters
			case "set-line-style":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				color = el.data("arg");
				// update shape element
				Shape.shapeItem.css({ stroke: color });
				// update "Stroke" group color
				Els.el.find(`.color-preset_[data-change="set-line-stroke-color"]`)
					.css({ "--preset-color": color });
				break;
			case "set-line-stroke-style": break;
			case "set-line-stroke-color": break;
			case "set-line-stroke-width": break;
			case "set-line-shadow": break;
			case "set-line-reflection": break;
			case "set-line-opacity": break;
		}
	}
}
