
// eniac.spawn.tools.formula

{
	init() {
		// fast references
		this.els = {};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.spawn.tools.formula,
			Spawn = event.spawn,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.keystroke":
				break;
			case "spawn.blur":
				Self.els = {};
				break;
			case "spawn.focus":
				// fast references
				Self.els = {
					doc: $(document),
					el: Spawn.find(".formula-tools"),
				};
				break;
			// custom events
			case "focus-formula":
				Self.els.el.removeClass("hidden");
				break;
			case "blur-formula":
				break;
		}
	}
}
