
// eniac.sidebar.image

{
	init(parent) {
		// fast reference
		this.parent = parent;

		// temp
		setTimeout(() => {
			parent.els.el.find(".sidebar-image .sidebar-head span:nth(1)").trigger("click");
		}, 200);

		// setTimeout(() => {
		// 	parent.els.el.find(`button[data-click="image-toggle-mask"]`).trigger("click");
		// }, 400);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar.image,
			Els = APP.sidebar.els,
			Image = event.image || APP.tools.image.image,
			value,
			allEl,
			pEl,
			el;
		switch (event.type) {
			case "populate-image-values":
				event.values = Self.dispatch({ ...event, type: "collect-image-values" });

				Self.dispatch({ ...event, type: "update-filter-adjustments" });
				Self.dispatch({ ...event, type: "update-image-arrange" });
				break;
			case "collect-image-values": {
				let border = {},
					shadow = {},
					reflection = {},
					opacity = {},
					filter = {};

				// border values

				// shadow values

				// reflection values

				// opacity values

				// filter values
				filter.brightness = Math.round((+Image.css("--brightness") - 1.5) * 100);
				filter.saturate = Math.round((+Image.css("--saturate") - 1) * 100);

				let data = { border, shadow, reflection, opacity, filter };
				Object.keys(data).map(key => {
					let el = Els.el.find(`.group-row.text-${key}-options`);
					if (data[key]._expand) el.addClass("expanded");
					else el.removeClass("expanded");
				});

				return data; }
			// tab: Style
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
