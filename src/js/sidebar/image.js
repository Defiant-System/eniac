
// eniac.sidebar.image

{
	init(parent) {
		// fast reference
		this.parent = parent;

		// temp
		// setTimeout(() => {
		// 	parent.els.el.find(".sidebar-image .sidebar-head span:nth(1)").trigger("click");
		// }, 200);

		// setTimeout(() => {
		// 	parent.els.el.find(`button[data-click="image-toggle-mask"]`).trigger("click");
		// }, 400);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar.image,
			Tools = APP.tools,
			Els = APP.sidebar.els,
			Image = event.image || Tools.image.image,
			color,
			width,
			value,
			allEl,
			pEl,
			el;
		switch (event.type) {
			case "populate-image-values":
				event.values = Self.dispatch({ ...event, type: "collect-image-values" });

				Self.dispatch({ ...event, type: "update-image-styles" });
				Self.dispatch({ ...event, type: "update-image-outline" });
				Self.dispatch({ ...event, type: "update-image-reflection" });
				Self.dispatch({ ...event, type: "update-image-opacity" });
				Self.dispatch({ ...event, type: "update-filter-adjustments" });
				Self.dispatch({ ...event, type: "update-image-arrange" });
				break;
			case "collect-image-values": {
				let styles = {},
					outline = {},
					shadow = {},
					reflection = {},
					opacity = {},
					filter = {};

				// styles
				styles.bg = Image.css("background-image");

				// border values
				outline.color = Color.rgbToHex(Image.css("border-color"));
				outline.style = Image.css("border-style");
				outline.width = parseInt(Image.css("border-width"), 10);
				if (outline.width === 0) outline.color = "none";
				outline._expand = outline.width > 0;

				// shadow values

				// reflection values
				reflection.reflect = Image.css("-webkit-box-reflect");
				reflection._expand = Image.hasClass("reflection");

				// opacity values
				opacity.value = +Image.css("opacity");
				opacity._expand = opacity.value !== 1;

				// filter values
				filter.brightness = Math.round((+(Image.css("--brightness") || 1) - 0.5) * 200 - 100);
				filter.saturate = Math.round((+(Image.css("--saturate") || 1) - 1) * 100);

				let data = { styles, outline, shadow, reflection, opacity, filter };
				Object.keys(data).map(key => {
					let el = Els.el.find(`.group-row.image-${key}-options`);
					if (data[key]._expand) el.addClass("expanded");
					else el.removeClass("expanded");
				});

				return data; }
			// tab: Style
			case "update-image-styles":
				value = event.values.styles.bg;
				Els.el.find(".image-styles").css({ "background-image": value });
				break;
			case "update-image-outline":
				// outline style
				color = event.values.outline.color;
				value = event.values.outline.style || "none";
				el = Els.el.find(".image-outline").addClass("has-prefix-icon");
				if (color === "none") {
					value = "none";
					el.removeClass("has-prefix-icon");
				}
				el.val(value);

				// outline color
				value = color === "none" ? "transparent" : ( color.length > 7 ? color.slice(0, -2) : color);
				Els.el.find(`.color-preset_[data-change="set-image-outline-color"]`)
							.css({ "--preset-color": value });
				
				// outline width
				value = color === "none" ? 0 : event.values.outline.width;
				Els.el.find("input#image-outline").val(value);
				break;
			case "update-image-reflection":
				value = event.values.reflection.reflect.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(1|0\.\d+))?\)/);
				value = value ? Math.round(value[4] * 100) : 0;
				Els.el.find(".image-reflection input").val(value);
				break;
			case "update-image-opacity":
				value = event.values.opacity.value * 100;
				Els.el.find(".image-opacity input").val(value);
				break;
			// tab: Image
			case "update-filter-adjustments":
				value = event.values.filter.brightness;
				Els.el.find(".image-brightness input").val(value);
				value = event.values.filter.saturate;
				Els.el.find(".image-saturate input").val(value);
				break;
			// tab: Arrange
			case "update-image-arrange":
				pEl = Els.el.find(`.flex-row[data-click="set-image-arrange"]`);
				// disable all options if single element
				allEl = APP.body.find(Guides.selector);
				pEl.find(".option-buttons_ span").toggleClass("disabled_", allEl.length !== 1);

				// disable "back" + "backward" option, if active element is already in the back
				value = +Image.css("z-index");
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
			case "set-image-outline-style":
				width = parseInt(Image.css("border-width"), 10);
				el = Els.el.find(".image-outline").addClass("has-prefix-icon");
				let outline = {};
				switch (event.arg) {
					case "dashed":
					case "dotted":
					case "solid":
						if (width === 0) {
							outline.style = event.arg;
							outline.color = "#222222";
							outline.width = 1;
							Self.dispatch({ type: "set-image-outline-color", value: outline.color });
							Self.dispatch({ type: "set-image-outline-width", value: outline.width });
							Self.dispatch({ type: "update-image-outline", values: { outline } });
						}
						break;
					case "none":
						Self.dispatch({ type: "set-image-outline-color", value: "transparent" });
						Self.dispatch({ type: "set-image-outline-width", value: 0 });
						// border values
						outline.color = Image.css("border-color");
						outline.dash = Image.css("border-style").split(",").map(i => parseInt(i, 10) || 0);
						outline.width = parseInt(Image.css("border-width"), 10);
						Self.dispatch({ type: "update-image-outline", values: { outline } });
						return el.removeClass("has-prefix-icon").val(event.arg);
				}
				Image.css({ "border-style": event.arg });
				break;
			case "set-image-outline-color":
				Image.css({ "border-color": event.value });
				break;
			case "set-image-outline-width":
				value = {
					"border-width": +event.value +"px",
					"border-style": Image.css("border-style"),
				};
				// apply new width
				Image.css(value);
				// re-focus on element
				Tools.image.dispatch({ type: "focus-image", el: Image });
				break;
			case "set-image-reflection":
				value = Els.el.find(".image-reflection input:nth(0)").val();
				let reflect = `below 3px -webkit-linear-gradient(bottom, rgba(255, 255, 255, ${value / 100}) 0%, transparent 50%, transparent 100%)`
				// apply reflection
				Image.css({ "-webkit-box-reflect": reflect });
				// make sure all fields shows same value
				Els.el.find(".image-reflection input").val(value);
				break;
			case "set-image-opacity":
				value = Els.el.find(".image-opacity input:nth(0)").val();
				// apply shape opacity
				Image.css({ "opacity": value / 100 });
				// make sure all fields shows same value
				Els.el.find(".image-opacity input").val(value);
				break;
			// tab: Image
			case "image-toggle-mask":
				value = Image.hasClass("masking");
				Image.toggleClass("masking", value);
				// switch mask mode - image tools
				let vars = {
						"--mY": Image.css("--mY") || `0px`,
						"--mX": Image.css("--mX") || `0px`,
						"--mW": Image.css("--mW") || `${Image.width()}px`,
						"--mH": Image.css("--mH") || `${Image.height()}px`,
					};
				// console.log(vars);
				APP.tools.image.dispatch({ type: "set-image-mask-mode", value, vars });
				break;
			case "set-image-brightness":
				// make sure all fields shows same value
				Els.el.find(".image-brightness input").val(event.value);
				// apply brightness on image
				Image.css({ "--brightness": (event.value * .005) + 1 });
				break;
			case "set-image-saturate":
				// make sure all fields shows same value
				Els.el.find(".image-saturate input").val(event.value);
				// apply saturation on image
				Image.css({ "--saturate": (event.value * .01) + 1 });
				break;
			case "image-instant-alpha":
			case "image-replace-image":
				console.log(event);
				break;
			case "reset-image-filters":
				Els.el.find(".image-brightness input").val(0);
				Els.el.find(".image-saturate input").val(0);
				Image.css({
					"--brightness": 1,
					"--saturate": 1,
				});
				break;
			// tab: Arrange
			case "set-image-arrange":
				el = $(event.target);
				value = el.data("name").split("-")[1];
				APP.sidebar.zIndexArrange(Image, value);
				// update arrange buttons
				Self.dispatch({ ...event, type: "update-image-arrange" });
				break;
		}
	}
}
