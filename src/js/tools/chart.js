
// eniac.spawn.tools.chart

{
	init() {
		// fast references
		this.els = {};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.spawn.tools.chart,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.blur":
				Self.els = {};
				break;
			case "spawn.focus":
				// fast references
				Self.els = {
					doc: $(document),
				};
				break;
			// custom events
			case "focus-chart":
				break;
			case "blur-chart":
				break;
		}
	}
}
