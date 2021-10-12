
// eniac.sidebar.shape

{
	init(parent) {
		// fast reference
		this.parent = parent;
		
		// temp
		// setTimeout(() => {
		// 	let target = this.parent.els.el.find(".gradient-colors .point:nth(0)")[0];
		// 	eniac.popups.dispatch({ type: "popup-color-ring", target });
		// }, 500);

		// temp
		// setTimeout(() => {
		// 	parent.els.el.find(".sidebar-shape .sidebar-head span:nth(1)").trigger("click");
		// }, 200);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar.shape,
			Els = APP.sidebar.els,
			Shape = event.shape || APP.tools.shape,
			name,
			color,
			fill,
			value,
			width,
			allEl,
			pEl,
			el;
		switch (event.type) {
			case "select-fill-type":
				// update tabs
				el = $(event.target);
				el.parent().find(".active_").removeClass("active_");
				el.addClass("active_");
				// update tab body
				el.parents(".group-row")
					.removeClass("solid-fill linearGradient-fill radialGradient-fill")
					.addClass(`${el.data("arg")}-fill`);
				// update selected shape
				if (Shape.gradient.type !== el.data("arg")) {
					Shape.gradient.switchType(el.data("arg"));
				}
				break;
			case "populate-shape-values":
				event.values = Self.dispatch({ ...event, type: "collect-shape-values" });

				Self.dispatch({ ...event, type: "update-shape-style" });
				Self.dispatch({ ...event, type: "update-shape-fill" });
				Self.dispatch({ ...event, type: "update-shape-outline" });
				Self.dispatch({ ...event, type: "update-shape-shadow" });
				Self.dispatch({ ...event, type: "update-shape-reflection" });
				Self.dispatch({ ...event, type: "update-shape-opacity" });

				Self.dispatch({ ...event, type: "update-shape-arrange" });
				break;
			case "collect-shape-values": {
				let fill = {},
					border = {},
					shadow = {},
					reflection = {},
					opacity = {};
				
				// fill values
				fill.color = APP.tools.shape.fill || "";
				fill.type = APP.tools.shape.gradient.type;
				fill._expand = fill.type !== "solid" || fill.color.slice(-2) !== "00";

				// border values
				border.color = Shape.shapeItem.css("stroke");
				border.dash = Shape.shapeItem.css("stroke-dasharray").split(",").map(i => parseInt(i, 10) || 0);
				border.width = parseInt(Shape.shapeItem.css("stroke-width"), 10);
				border._expand = border.width > 1;

				// shadow values
				shadow.filter = Shape.shapeItem.css("filter");
				shadow._expand = shadow.filter !== "none";

				// reflection values
				reflection.reflect = Shape.shape.css("-webkit-box-reflect");
				reflection._expand = Shape.shape.hasClass("reflection");

				// opacity values
				opacity.value = +Shape.shape.css("opacity");
				opacity._expand = opacity.value !== 1;

				let data = { fill, border, shadow, reflection, opacity };
				Object.keys(data).map(key => {
					let el = Els.el.find(`.group-row.shape-${key}-options`);
					if (data[key]._expand) el.addClass("expanded");
					else el.removeClass("expanded");
				});

				return data; }
			// tab: Table
			case "update-shape-style":
				// reset (if any) previous active
				Els.el.find(".shape-styles .active").removeClass("active");
				// update sidebar value
				fill = Shape.shapeItem.cssProp("fill");
				if (!fill.startsWith("url(")) {
					value = Color.rgbToHex(fill).slice(0,-2);
					Els.el.find(`.shape-styles span[data-arg="${value}"]`).addClass("active");
				}
				break;
			case "update-shape-fill":
				el = Els.el.find(".shape-fill-options .gradient-colors");
				width = +el.prop("offsetWidth") - 2;
				
				// click option button
				value = event.values.fill.type;
				Els.el.find(`.shape-fill-options .option-buttons_ span[data-arg="${value}"]`).trigger("click");
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
						Els.el.find(`.color-preset_[data-change="set-shape-fill-color"]`)
							.css({ "--preset-color": event.values.fill.color });
				}
				break;
			case "update-shape-outline":
				// outline style
				color = event.values.border.color;
				value = event.values.border.dash;
				el = Els.el.find(".shape-outline").addClass("has-prefix-icon");
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
				value = color === "none" ? "transparent" : Color.rgbToHex(color).slice(0, -2);
				Els.el.find(`.color-preset_[data-change="set-shape-outline-color"]`)
							.css({ "--preset-color": value });
				
				// outline width
				value = color === "none" ? 0 : event.values.border.width;
				Els.el.find("input#shape-outline").val(value);
				break;
			case "update-shape-shadow": {
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
				Els.el.find(".shape-shadow-blur input").val(blur);
				Els.el.find(".shape-shadow-offset input").val(offset);
				Els.el.find(".shape-shadow-opacity input").val(opacity);
				Els.el.find(`input[name="shape-shadow-angle"]`).val(angle);
				// drop-shadow color
				hexColor = hexColor ? hexColor.slice(0, -2) : "transparent";
				Els.el.find(`.color-preset_[data-change="set-shape-shadow"]`)
							.css({ "--preset-color": hexColor });
				} break;
			case "update-shape-reflection":
				value = event.values.reflection.reflect.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(1|0\.\d+))?\)/);
				value = value ? Math.round(value[4] * 100) : 0;
				Els.el.find(".shape-reflection input").val(value);
				break;
			case "update-shape-opacity":
				value = event.values.opacity.value * 100;
				Els.el.find(".shape-opacity input").val(value);
				break;
			// tab: Arrange
			case "update-shape-arrange":
				pEl = Els.el.find(`.flex-row[data-click="set-shape-arrange"]`);
				// disable all options if single element
				allEl = APP.body.find(Guides.selector);
				pEl.find(".option-buttons_ span").toggleClass("disabled_", allEl.length !== 1);

				// disable "back" + "backward" option, if active element is already in the back
				value = +Shape.shape.css("z-index");
				pEl.find(".option-buttons_:nth(0) > span:nth(0)").toggleClass("disabled_", value !== 1);
				pEl.find(".option-buttons_:nth(1) > span:nth(0)").toggleClass("disabled_", value !== 1);
				// disable "front" + "forward" option, if active element is already in front
				pEl.find(".option-buttons_:nth(0) > span:nth(1)").toggleClass("disabled_", value !== allEl.length);
				pEl.find(".option-buttons_:nth(1) > span:nth(1)").toggleClass("disabled_", value !== allEl.length);
				break;
			/*
			 * set values based on UI interaction
			 */
			// tab: Shape
			case "set-shape-style":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				let fn = () => {
						// update shape element
						Shape.shapeItem.css({ fill: el.data("arg") });
						// update "Stroke" group color
						Els.el.find(`.color-preset_[data-change="set-shape-fill-color"]`)
							.css({ "--preset-color": el.data("arg") });
					};
				if (Els.el.find(`.shape-fill-options .active_`).attr("data-arg") !== "solid") {
					Els.el.find(`.shape-fill-options span[data-arg="solid"]`).trigger("click");
					setTimeout(fn, 10);
				} else {
					fn();
				}
				break;
			case "set-fill-gradient-color":
				// update gradient point
				event.point.css({ "--color": event.hex });
				// update gradient strip
				let maxWidth = +event.el.prop("offsetWidth") - 2,
					stops = [],
					strip = [];
				// loop points
				event.el.find(".point").map(el => {
					let offset = Math.round(el.offsetLeft / maxWidth * 1000) / 10,
						color = getComputedStyle(el).getPropertyValue("--color").trim();
					// prepare strip gradient
					strip.push(`${color} ${offset}%`);
					// prepare svg gradient
					stops.push({ offset, color });
				});
				// UI update sidebar gradient strip
				event.el.css({ "--gradient": `linear-gradient(to right, ${strip.join(",")})` });

				APP.tools.shape.gradient.update(stops);
				break;
			case "set-shape-fill-color":
				Shape.shapeItem.css({ fill: event.value });
				break;
			case "set-shape-outline-style":
				width = parseInt(Shape.shapeItem.css("stroke-width"), 10);
				el = Els.el.find(".shape-outline").addClass("has-prefix-icon");
				switch (event.arg) {
					case "dashed": value = [width*2, width]; break;
					case "dotted": value = [width, width]; break;
					case "solid": value = [0]; break;
					case "none":
						Self.dispatch({ type: "set-shape-outline-color", value: "none" });
						Self.dispatch({ type: "set-shape-outline-width", value: 0 });
						// border values
						let border = {
							color: Shape.shapeItem.css("stroke"),
							dash: Shape.shapeItem.css("stroke-dasharray").split(",").map(i => parseInt(i, 10) || 0),
							width: parseInt(Shape.shapeItem.css("stroke-width"), 10),
						};
						Self.dispatch({ type: "update-shape-outline", values: { border } });
						return el.removeClass("has-prefix-icon").val(event.arg);
				}
				Shape.shapeItem.css({ "stroke-dasharray": value.join(",") });
				break;
			case "set-shape-outline-color":
				Shape.shapeItem.css({ "stroke": event.value });
				break;
			case "set-shape-outline-width":
				value = {
					"stroke-width": +event.value +"px",
					"stroke-dasharray": Shape.shapeItem.css("stroke-dasharray"),
				};
				// conditions for dash-array
				if (value["stroke-dasharray"].split(",").length > 1) {
					let arr = value["stroke-dasharray"].split(",").map(i => parseInt(i, 10) || 0);
					value["stroke-dasharray"] = arr[0] === arr[1]
												? [+event.value, +event.value]
												: [+event.value*2, +event.value];
				}
				// apply new width
				Shape.shapeItem.css(value);
				break;
			case "set-shape-shadow": {
				let data = {
						blur: +Els.el.find(".shape-shadow-blur input:nth(0)").val(),
						offset: +Els.el.find(".shape-shadow-offset input:nth(0)").val(),
						opacity: +Els.el.find(".shape-shadow-opacity input:nth(0)").val(),
					};
				// obey new value of event provides value
				if (event.el) {
					let cn = event.el.parents(".flex-row").prop("className"),
						name = cn.split(" ")[1].split("-")[2];
					data[name] = +event.value;
				}
				// collect / prepare values for sidebar
				let rad = (+Els.el.find(`input[name="shape-shadow-angle"]`).val() * Math.PI) / 180,
					bX = Math.round(data.offset * Math.sin(rad)),
					bY = Math.round(data.offset * Math.cos(rad)),
					x = Math.round((data.opacity / 100) * 255),
					d = "0123456789abcdef".split(""),
					alpha = d[(x - x % 16) / 16] + d[x % 16],
					color = Els.el.find(`.shape-shadow-angle-color .color-preset_`).css("--preset-color"),
					filter = `drop-shadow(${color + alpha} ${bY}px ${bX}px ${data.blur}px)`;
				// apply drop shadow
				Shape.shapeItem.css({ filter });
				// make sure all fields shows same value
				Els.el.find(".shape-shadow-blur input").val(data.blur);
				Els.el.find(".shape-shadow-offset input").val(data.offset);
				Els.el.find(".shape-shadow-opacity input").val(data.opacity);
				} break;
			case "set-shape-reflection":
				value = Els.el.find(".shape-reflection input:nth(0)").val();
				let reflect = `below 3px -webkit-linear-gradient(bottom, rgba(255, 255, 255, ${value / 100}) 0%, transparent 50%, transparent 100%)`
				// apply reflection
				Shape.shape.css({ "-webkit-box-reflect": reflect });
				// make sure all fields shows same value
				Els.el.find(".shape-reflection input").val(value);
				break;
			case "set-shape-opacity":
				value = Els.el.find(".shape-opacity input:nth(0)").val();
				// apply shape opacity
				Shape.shape.css({ "opacity": value / 100 });
				// make sure all fields shows same value
				Els.el.find(".shape-opacity input").val(value);
				break;
			// tab: Arrange
			case "set-shape-arrange":
				el = $(event.target);
				value = el.data("name").split("-")[1];
				APP.sidebar.zIndexArrange(Shape.shape, value);
				// update arrange buttons
				Self.dispatch({ ...event, type: "update-shape-arrange" });
				break;
		}
	}
}
