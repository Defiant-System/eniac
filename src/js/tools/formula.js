
// eniac.spawn.tools.formula

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
			el: window.find(".formula-tools"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.spawn.tools.formula,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.keystroke":
				break;
			// custom events
			case "focus-formula":
				Self.els.el.removeClass("hidden");
				event.el;
				break;
			case "blur-formula":
				break;
		}
	}
}
