
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
				Self.dispatch({ type: "update-sheet-name" });
				Self.dispatch({ type: "update-sheet-background" });
				Self.dispatch({ type: "update-sheet-buttons" });
				break;
			case "update-sheet-name":
				el = Els.el.find(`input[data-change="set-sheet-name"]`);
				value = APP.file.activeSheet;
				el.val(value);
				break;
			case "update-sheet-background":
				value = APP.file.dispatch({ type: "get-sheet-background" }) || "#ffffff";
				// update sheet background
				Sheet.css({ "background-color": value });
				// update sidebar color-preset
				Els.el.find(`.color-preset_[data-change="set-sheet-bgcolor"]`)
					.css({ "--preset-color": value });
				break;
			case "update-sheet-buttons":
				if (APP.head.els.reel.find("> span:not(.remove-sheet)").length > 1) {
					Els.el.find(`button[data-click="delete-sheet"]`).removeAttr("disabled");
				} else {
					Els.el.find(`button[data-click="delete-sheet"]`).attr({ disabled: true });
				}
				break;
			case "set-sheet-name":
				name = APP.file.activeSheet;
				el = APP.head.els.reel.find(`span i:contains("${name}")`);
				el.html(event.value);
				// update file
				APP.file.dispatch({ ...event, type: "update-sheet-name" });
				break;
			case "set-sheet-bgcolor":
				// update UI
				Sheet.css({ "background-color": event.value });
				// update file
				APP.file.dispatch({ ...event, type: "update-sheet-background" });
				break;
			case "duplicate-sheet":
				// update UI
				name = APP.file.activeSheet +"-1";
				APP.head.dispatch({ type: "add-sheet", name, makeActive: true });
				// update file
				APP.file.dispatch({ type: "duplicate-active-sheet", name });
				break;
			case "delete-sheet":
				// update UI
				APP.head.dispatch({ type: "remove-sheet" });
				// update file
				APP.file.dispatch({ type: "delete-active-sheet" });
				break;
		}
	}
}
