
// eniac.sidebar.text

{
	init(parent) {
		// fast reference
		this.parent = parent;

		// temp
		// setTimeout(() => {
		// 	parent.els.el.find(".sidebar-text .sidebar-head span:nth(2)").trigger("click");
		// }, 200);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar.text,
			Tools = APP.tools,
			Els = APP.sidebar.els,
			Text = event.text || Tools.text.text,
			color,
			width,
			value,
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
					.removeClass("solid-fill linear-fill radial-fill")
					.addClass(`${el.data("arg")}-fill`);
				// update selected shape
				if (Tools.text.gradient.type !== el.data("arg")) {
					Tools.text.gradient.switchType(el.data("arg"));
				}
				break;
			case "populate-text-values":
				event.values = Self.dispatch({ ...event, type: "collect-text-values" });

				Self.dispatch({ ...event, type: "update-text-style" });
				Self.dispatch({ ...event, type: "update-text-fill" });
				Self.dispatch({ ...event, type: "update-text-border" });
				Self.dispatch({ ...event, type: "update-text-shadow" });
				Self.dispatch({ ...event, type: "update-text-reflection" });
				Self.dispatch({ ...event, type: "update-text-opacity" });

				Self.dispatch({ ...event, type: "update-text-arrange" });
				break;
			case "collect-text-values": {
				let fill = {},
					border = {},
					shadow = {},
					reflection = {},
					opacity = {};
				
				// fill values
				fill.color = Text.css("background");
				color = Color.rgbToHex(Text.css("background-color"));
				if (color.slice(-2) === "00") color = "none";
				fill.type = fill.color.match(/linear-|radial-/);
				if (fill.type) fill.type = fill.type[0].slice(0,-1);
				else fill.type = "solid";
				// gradient rotation
				fill.deg = Text.css("background-image").match(/(\d+)deg/);
				fill.deg = fill.deg ? +fill.deg[1] : 45;
				fill._expand = color !== "none" || fill.type !== "solid";

				// border values
				border.color = Color.rgbToHex(Text.css("border-color"));
				border.style = Text.css("border-style");
				border.width = parseInt(Text.css("border-width"), 10);
				if (border.width === 0) border.color = "none";
				border._expand = border.width > 0;

				// shadow values
				shadow.filter = Text.css("filter");
				shadow._expand = shadow.filter !== "none";

				// reflection values
				reflection.reflect = Text.css("-webkit-box-reflect");
				reflection._expand = Text.hasClass("reflection");

				// opacity values
				opacity.value = +Text.css("opacity");
				opacity._expand = opacity.value !== 1;

				let data = { fill, border, shadow, reflection, opacity };
				Object.keys(data).map(key => {
					let el = Els.el.find(`.group-row.text-${key}-options`);
					if (data[key]._expand) el.addClass("expanded");
					else el.removeClass("expanded");
				});

				return data; }
			// tab: Style
			case "update-text-style":
				// reset (if any) previous active
				el = Els.el.find(".text-styles");
				el.find(".active").removeClass("active");
				// text style preset
				Text.prop("className").split(" ").map(name => {
					let item = el.find(`span[data-arg="${name}"]`);
					if (item.length) item.addClass("active");
				});
				break;
			case "update-text-fill":
				// click option button
				value = event.values.fill.type;

				el = Els.el.find(".text-fill-options .gradient-colors");
				width = +el.prop("offsetWidth") - 2;

				Els.el.find(`.text-fill-options .option-buttons_ span[data-arg="${value}"]`).trigger("click");

				switch (value) {
					case "linear":
					case "radial":
						// gradient
						let points = [],
							strip = [];
						Tools.text.gradient.stops.map(stop => {
							strip.push(`${stop.color} ${stop.offset}%`);
							points.push(`<span class="point" style="left: ${stop.offset * width / 100}px; --color: ${stop.color}; --offset: ${stop.offset};"></span>`);
						});
						el.html(points.join(""));
						el.css({ "--gradient": `linear-gradient(to right, ${strip.join(",")})` });

						value = event.values.fill.deg;
						Els.el.find("input#text-gradient-angle").val(value);
						// fill-gradient angle ring
						Els.el.find(`.text-fill-options .angle-ring`).css({ transform: `rotate(${value+90}deg)` });
						break;
					default:
						// fill solid
						Els.el.find(`.color-preset_[data-change="set-text-fill-color"]`)
							.css({ "--preset-color": event.values.fill.color });
				}
				break;
			case "update-text-border":
				// border style
				color = event.values.border.color;
				value = event.values.border.style;
				el = Els.el.find(".text-border").addClass("has-prefix-icon");
				switch (true) {
					case value = "dotted":
					case value = "dashed":
					case value = "solid":
						break;
					case color === "none":
						value = "none";
						el.removeClass("has-prefix-icon");
						break;
				}
				el.val(value);

				// border color
				value = color === "none" ? "transparent" : color.slice(0, -2);
				Els.el.find(`.color-preset_[data-change="set-text-border-color"]`)
							.css({ "--preset-color": value });
				
				// border width
				value = color === "none" ? 0 : event.values.border.width;
				Els.el.find("input#text-border").val(value);
				break;
			case "update-text-shadow": {
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
				Els.el.find(".text-shadow-blur input").val(blur);
				Els.el.find(".text-shadow-offset input").val(offset);
				Els.el.find(".text-shadow-opacity input").val(opacity);
				Els.el.find(`input[name="text-shadow-angle"]`).val(angle);
				// drop-shadow angle ring
				Els.el.find(`.text-shadow-angle-color .angle-ring`).css({ transform: `rotate(${angle+90}deg)` });
				// drop-shadow color
				hexColor = hexColor ? hexColor.slice(0, -2) : "transparent";
				Els.el.find(`.color-preset_[data-change="set-text-shadow"]`)
							.css({ "--preset-color": hexColor });
				} break;
			case "update-text-reflection":
				value = event.values.reflection.reflect.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(1|0\.\d+))?\)/);
				value = value ? Math.round(value[4] * 100) : 0;
				Els.el.find(".text-reflection input").val(value);
				break;
			case "update-text-opacity":
				value = event.values.opacity.value * 100;
				Els.el.find(".text-opacity input").val(value);
				break;
			// tab: Arrange
			case "update-text-arrange":
				pEl = Els.el.find(`.flex-row[data-click="set-text-arrange"]`);
				// disable all options if single element
				allEl = APP.body.find(Guides.selector);
				pEl.find(".option-buttons_ span").toggleClass("disabled_", allEl.length !== 1);

				// disable "back" + "backward" option, if active element is already in the back
				value = +Text.css("z-index");
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
			case "set-text-fill-color":
				Text.css({ background: event.value });
				break;
			case "set-text-border-style":
				width = parseInt(Text.css("border-width"), 10);
				el = Els.el.find(".text-border").addClass("has-prefix-icon");
				switch (event.arg) {
					case "dashed": value = [width*2, width]; break;
					case "dotted": value = [width, width]; break;
					case "solid": value = [0]; break;
					case "none":
						Self.dispatch({ type: "set-text-border-color", value: "none" });
						Self.dispatch({ type: "set-text-border-width", value: 0 });
						// border values
						let border = {
							color: Text.css("border-color"),
							dash: Text.css("border-style").split(",").map(i => parseInt(i, 10) || 0),
							width: parseInt(Text.css("border-width"), 10),
						};
						Self.dispatch({ type: "update-text-border", values: { border } });
						return el.removeClass("has-prefix-icon").val(event.arg);
				}
				Text.css({ "border-style": event.arg });
				break;
			case "set-text-border-color":
				Text.css({ "border-color": event.value });
				break;
			case "set-text-border-width":
				value = {
					"border-width": +event.value +"px",
					"border-style": Text.css("border-style"),
				};
				// apply new width
				Text.css(value);
				// re-focus on element
				Tools.text.dispatch({ type: "focus-text", el: Text });
				break;

			case "set-text-shadow": {
				let data = {
						blur: +Els.el.find(".text-shadow-blur input:nth(0)").val(),
						offset: +Els.el.find(".text-shadow-offset input:nth(0)").val(),
						opacity: +Els.el.find(".text-shadow-opacity input:nth(0)").val(),
					};
				// obey new value of event provides value
				if (event.el) {
					let cn = event.el.parents(".flex-row").prop("className"),
						name = cn.split(" ")[1].split("-")[2];
					data[name] = +event.value;
				}
				// collect / prepare values for sidebar
				let rad = (+Els.el.find(`input[name="text-shadow-angle"]`).val() * Math.PI) / 180,
					bX = Math.round(data.offset * Math.sin(rad)),
					bY = Math.round(data.offset * Math.cos(rad)),
					x = Math.round((data.opacity / 100) * 255),
					d = "0123456789abcdef".split(""),
					alpha = d[(x - x % 16) / 16] + d[x % 16],
					color = Els.el.find(`.text-shadow-angle-color .color-preset_`).css("--preset-color"),
					filter = `drop-shadow(${color + alpha} ${bY}px ${bX}px ${data.blur}px)`;
				// apply drop shadow
				Text.css({ filter });
				// make sure all fields shows same value
				Els.el.find(".text-shadow-blur input").val(data.blur);
				Els.el.find(".text-shadow-offset input").val(data.offset);
				Els.el.find(".text-shadow-opacity input").val(data.opacity);
				} break;
			case "set-text-reflection":
				value = Els.el.find(".text-reflection input:nth(0)").val();
				let reflect = `below 3px -webkit-linear-gradient(bottom, rgba(255, 255, 255, ${value / 100}) 0%, transparent 50%, transparent 100%)`
				// apply reflection
				Text.css({ "-webkit-box-reflect": reflect });
				// make sure all fields shows same value
				Els.el.find(".text-reflection input").val(value);
				break;
			case "set-text-opacity":
				value = Els.el.find(".text-opacity input:nth(0)").val();
				// apply text opacity
				Text.css({ "opacity": value / 100 });
				// make sure all fields shows same value
				Els.el.find(".text-opacity input").val(value);
				break;
			// tab: Arrange
			case "set-text-arrange":
				el = $(event.target);
				value = el.data("name").split("-")[1];
				APP.sidebar.zIndexArrange(Text, value);
				// update arrange buttons
				Self.dispatch({ ...event, type: "update-text-arrange" });
				break;
		}
	}
}
