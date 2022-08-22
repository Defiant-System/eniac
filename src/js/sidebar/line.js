
// eniac.spawn.sidebar.line

{
	init(parent) {
		// fast reference
		this.parent = parent;

		// temp
		// setTimeout(() => {
		// 	parent.els.el.find(".sidebar-line .sidebar-head span:nth(1)").trigger("click");
		// }, 200);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.spawn.sidebar.line,
			Els = APP.spawn.sidebar.els,
			Line = event.shape || APP.spawn.tools.line,
			color,
			value,
			allEl,
			pEl,
			el;
		// console.log(event);
		switch (event.type) {
			case "populate-line-values":
				event.values = Self.dispatch({ ...event, type: "collect-line-values" });
				// tab: Style
				Self.dispatch({ ...event, type: "update-line-style" });
				Self.dispatch({ ...event, type: "update-line-stroke" });
				Self.dispatch({ ...event, type: "update-line-shadow" });
				Self.dispatch({ ...event, type: "update-line-reflection" });
				Self.dispatch({ ...event, type: "update-line-opacity" });
				// tab: Arrange
				Self.dispatch({ ...event, type: "update-line-arrange" });
				break;
			case "collect-line-values": {
				let stroke = {},
					shadow = {},
					reflection = {},
					opacity = {};

				// border values
				stroke.width = parseInt(Line.lineItem.css("stroke-width"), 10);
				stroke.color = Color.rgbToHex(Line.lineItem.css("stroke")).slice(0,-2);
				stroke.dash = Line.lineItem.css("stroke-dasharray").split(",").map(i => parseInt(i, 10) || 0);

				// shadow values
				shadow.filter = Line.line.css("filter");
				shadow._expand = shadow.filter !== "none";

				// reflection values
				reflection.reflect = Line.line.css("-webkit-box-reflect");
				reflection._expand = Line.line.hasClass("reflection");

				// opacity values
				opacity.value = +Line.lineItem.css("opacity");
				opacity._expand = opacity.value !== 1;

				let data = { stroke, shadow, reflection, opacity };
				Object.keys(data).map(key => {
					let el = Self.parent.els.el.find(`.group-row.line-${key}-options`);
					if (data[key]._expand) el.addClass("expanded");
					else el.removeClass("expanded");
				});
				
				return data; }
			// Tab: Style
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
				// fill-gradient angle ring
				Els.el.find(`.line-shadow-angle-color .angle-ring`).css({ transform: `rotate(${angle+90}deg)` });
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
			// tab: Arrange
			case "update-line-arrange":
				pEl = Els.el.find(`.flex-row[data-click="set-line-arrange"]`);
				// disable all options if single element
				allEl = APP.spawn.els.body.find(Guides.selector);
				pEl.find(".option-buttons_ span").toggleClass("disabled_", allEl.length !== 1);

				// disable "back" + "backward" option, if active element is already in the back
				value = +Line.line.css("z-index");
				pEl.find(".option-buttons_:nth(0) > span:nth(0)").toggleClass("disabled_", value !== 1);
				pEl.find(".option-buttons_:nth(1) > span:nth(0)").toggleClass("disabled_", value !== 1);
				// disable "front" + "forward" option, if active element is already in front
				pEl.find(".option-buttons_:nth(0) > span:nth(1)").toggleClass("disabled_", value !== allEl.length);
				pEl.find(".option-buttons_:nth(1) > span:nth(1)").toggleClass("disabled_", value !== allEl.length);
				break;
			/*
			 * set values based on UI interaction
			 */
			// tab: Style
			case "set-line-style":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				color = el.data("arg");
				// update shape element
				Line.lineItem.css({ stroke: color });
				// update "Stroke" group color
				Els.el.find(`.color-preset_[data-change="set-line-stroke-color"]`)
					.css({ "--preset-color": color });
				break;
			case "set-line-stroke-style":
				value = parseInt(Line.lineItem.css("stroke-width"), 10);
				el = Els.el.find(".line-outline").addClass("has-prefix-icon");
				switch (event.arg) {
					case "dashed": value = [value*2, value]; break;
					case "dotted": value = [value, value]; break;
					case "solid": value = [0]; break;
					case "none":
						Self.dispatch({ type: "set-line-stroke-color", value: "none" });
						Self.dispatch({ type: "set-line-stroke-width", value: 0 });
						Self.dispatch({ type: "update-line-stroke" });
						return el.removeClass("has-prefix-icon").val(event.arg);
				}
				Line.lineItem.css({ "stroke-dasharray": value.join(",") });
				break;
			case "set-line-stroke-color":
				Line.lineItem.css({ "stroke": event.value });
				break;
			case "set-line-stroke-width":
				value = {
					"stroke-width": +event.value +"px",
					"stroke-dasharray": Line.lineItem.css("stroke-dasharray"),
				};
				// conditions for dash-array
				if (value["stroke-dasharray"] !== "none") {
					let arr = value["stroke-dasharray"].split(",").map(i => parseInt(i, 10) || 0);
					value["stroke-dasharray"] = arr[0] === arr[1]
												? [+event.value, +event.value]
												: [+event.value*2, +event.value];
				}
				// apply new width
				Line.lineItem.css(value);
				 break;
			case "set-line-shadow": {
				let data = {
						blur: +Els.el.find(".line-shadow-blur input:nth(0)").val(),
						offset: +Els.el.find(".line-shadow-offset input:nth(0)").val(),
						opacity: +Els.el.find(".line-shadow-opacity input:nth(0)").val(),
					};
				// obey new value of event provides value
				if (event.el) {
					let cn = event.el.parents(".flex-row").prop("className"),
						name = cn.split(" ")[1].split("-")[2];
					data[name] = +event.value;
				}
				// collect / prepare values for sidebar
				let angle = +Els.el.find(`input[name="line-shadow-angle"]`).val(),
					rad = angle * Math.PI / 180,
					bX = Math.round(data.offset * Math.sin(rad)),
					bY = Math.round(data.offset * Math.cos(rad)),
					x = Math.round((data.opacity / 100) * 255),
					d = "0123456789abcdef".split(""),
					alpha = d[(x - x % 16) / 16] + d[x % 16],
					color = Els.el.find(`.line-shadow-angle-color .color-preset_`).css("--preset-color"),
					filter = `drop-shadow(${color + alpha} ${bY}px ${bX}px ${data.blur}px)`;
				// apply drop shadow
				Line.line.css({ filter });
				// make sure all fields shows same value
				Els.el.find(".line-shadow-blur input").val(data.blur);
				Els.el.find(".line-shadow-offset input").val(data.offset);
				Els.el.find(".line-shadow-opacity input").val(data.opacity);
				Els.el.find(".line-shadow-angle-color .angle-ring").css({ transform: `rotate(${angle+90}deg)` });
				} break;
			case "set-line-reflection":
				value = Els.el.find(".line-reflection input:nth(0)").val();
				let reflect = `below 3px -webkit-linear-gradient(bottom, rgba(255, 255, 255, ${value / 100}) 0%, transparent 50%, transparent 100%)`
				// apply reflection
				Line.line.css({ "-webkit-box-reflect": reflect });
				// make sure all fields shows same value
				Els.el.find(".line-reflection input").val(value);
				break;
			case "set-line-opacity":
				value = Els.el.find(".line-opacity input:nth(0)").val();
				// apply shape opacity
				Line.line.css({ "opacity": value / 100 });
				// make sure all fields shows same value
				Els.el.find(".line-opacity input").val(value);
				break;
			// tab: Arrange
			case "set-line-arrange":
				el = $(event.target);
				value = el.data("name").split("-")[1];
				APP.spawn.sidebar.zIndexArrange(Line.line, value);
				// update arrange buttons
				Self.dispatch({ ...event, type: "update-line-arrange" });
				break;
		}
	}
}
