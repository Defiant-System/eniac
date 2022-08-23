
// eniac.spawn.sidebar.sheet

{
	init(parent) {
		// fast reference
		this.parent = parent;
		// this.sheet = eniac.els.body.parent();

		// temp
		// this.sheet.css({ "background-color": "#eee" });
		// setTimeout(() => {
		// 	eniac.sidebar.els.el.find(`.color-preset_[data-change="set-sheet-bgcolor"]`).trigger("click");
		// }, 150);
	},
	dispatch(event) {
		let APP = eniac,
			Spawn = event.spawn,
			Self = APP.spawn.sidebar.sheet,
			Els = APP.spawn.sidebar.els,
			Sheet = Spawn.data.tabs._active ? Spawn.data.tabs._active.bodyEl : null,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.blur":
			case "spawn.focus":
				break;
			// custom events
			case "populate-sheet-values":
				// tab: Sheet
				Self.dispatch({ ...event, type: "update-sheet-name" });
				Self.dispatch({ ...event, type: "update-sheet-background" });
				Self.dispatch({ ...event, type: "update-sheet-buttons" });
				break;
			case "update-sheet-name":
				el = Els.el.find(`input[data-change="set-sheet-name"]`);
				value = Spawn.data.tabs._active.file.activeSheet;
				el.val(value);
				break;
			case "update-sheet-background":
				value = Spawn.data.tabs._active.file.dispatch({ type: "get-sheet-background" }) || "#ffffff";
				// update sheet background
				Sheet.css({ "background-color": value });
				// update sidebar color-preset
				Els.el.find(`.color-preset_[data-change="set-sheet-bgcolor"]`)
					.css({ "--preset-color": value });
				break;
			case "update-sheet-buttons":
				if (APP.spawn.head.els.reel.find("> span:not(.remove-sheet)").length > 1) {
					Els.el.find(`button[data-click="delete-sheet"]`).removeAttr("disabled");
				} else {
					Els.el.find(`button[data-click="delete-sheet"]`).attr({ disabled: true });
				}
				break;
			case "set-sheet-name":
				name = Spawn.data.tabs._active.file.activeSheet;
				el = APP.spawn.head.els.reel.find(`span i:contains("${name}")`);
				el.html(event.value);
				// update file
				Spawn.data.tabs._active.file.dispatch({ ...event, type: "update-sheet-name" });
				break;
			case "set-sheet-bgcolor":
				// update UI
				Sheet.css({ "background-color": event.value });
				// update file
				Spawn.data.tabs._active.file.dispatch({ ...event, type: "update-sheet-background" });
				break;
			case "duplicate-sheet":
				// update UI
				name = Spawn.data.tabs._active.file.activeSheet +"-1";
				APP.spawn.head.dispatch({ type: "add-sheet", name, makeActive: true });
				// update file
				Spawn.data.tabs._active.file.dispatch({ type: "duplicate-active-sheet", name });
				break;
			case "delete-sheet":
				// update UI
				APP.spawn.head.dispatch({ type: "remove-sheet" });
				// update file
				Spawn.data.tabs._active.file.dispatch({ type: "delete-active-sheet" });
				break;
		}
	}
}
