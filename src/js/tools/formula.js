
// eniac.tools.formula

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
			layout: window.find("layout"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools.formula,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.keystroke":
				break;
			// custom events
			case "focus-formula":
				break;
			case "blur-formula":
				break;
		}
	}
}
