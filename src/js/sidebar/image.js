
// eniac.sidebar.image

{
	init(parent) {
		// fast reference
		this.parent = parent;

		// temp
		setTimeout(() => {
			parent.els.el.find(".sidebar-image .sidebar-head span:nth(1)").trigger("click");
		}, 200);
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
				Self.dispatch({ ...event, type: "update-image-arrange" });
				break;
			// tab: Image
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
