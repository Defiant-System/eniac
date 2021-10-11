
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
			Els = APP.sidebar.els,
			Text = event.text || APP.tools.text.text,
			value,
			allEl,
			pEl,
			el;
		switch (event.type) {
			case "populate-text-values":
				event.values = Self.dispatch({ ...event, type: "collect-text-values" });

				Self.dispatch({ ...event, type: "update-text-style" });
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

				// border values

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
				// apply shape opacity
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
