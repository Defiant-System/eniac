
// eniac.sidebar.text

{
	init(parent) {
		// fast reference
		this.parent = parent;

		// temp
		setTimeout(() => {
			parent.els.el.find(".sidebar-text .sidebar-head span:nth(2)").trigger("click");
		}, 200);
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
				Self.dispatch({ ...event, type: "update-text-arrange" });
				break;
			// tab: Text
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
