
// eniac.tools.chart

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools.chart,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "focus-chart":
				break;
			case "blur-chart":
				break;
		}
	}
}
