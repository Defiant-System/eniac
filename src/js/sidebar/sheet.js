
// eniac.sidebar.sheet

{
	init(parent) {
		// fast references
		this.sheet = eniac.body.parent();

		// temp
		// this.sheet.css({ "background-color": "#eee" });
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar.sheet,
			Els = APP.sidebar.els,
			Sheet = Self.sheet,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "populate-sheet-values":
				value = Sheet.css("background-color");
				value = Color.rgbToHex(value).slice(0,-2);
				Els.el.find(`.color-preset_[data-change="set-sheet-bgcolor"]`)
					.css({ "--preset-color": value });
				break;
			case "set-sheet-name":
				console.log( event );
				break;
			case "set-sheet-bgcolor":
				Sheet.css({ "background-color": event.value });
				// update file
				APP.file.dispatch({ ...event, type: "update-sheet-background" });
				break;
		}
	}
}
