
// eniac.tools.sheet

{
	init() {
		// fast references
		this.els = {
			layout: window.find("layout"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools.sheet,
			el;
		switch (event.type) {
			// system events
			case "window.keystroke":
				console.log(event);
				break;
			// custom events
			case "focus-sheet":
				break;
		}
	}
}
