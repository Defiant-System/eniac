
// eniac.popups

{
	init() {
		// fast references
		this.els = {
			root: window.find(".popups"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.popups,
			value,
			el;
		switch (event.type) {
			case "select-color":
				el = $(event.target);
				value = el.attr("style").match(/#.[\w\d]+/);
				console.log( value );
				break;
		}
	}
}
