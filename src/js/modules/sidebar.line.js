
// eniac.sidebar.line

{
	init(parent) {
		// fast reference
		this.parent = parent;
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar.line,
			Line = Self.line,
			el;
		// console.log(event);
		switch (event.type) {
			case "populate-line-values":
				event.values = Self.dispatch({ ...event, type: "collect-line-values" });

				Self.dispatch({ ...event, type: "update-line-style" });
				break;
			case "collect-line-values": {
				let stroke = {},
					shadow = {},
					reflection = {},
					opacity = {};

				// border values
				stroke._expand = true;

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
		}
	}
}
