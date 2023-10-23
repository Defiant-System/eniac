
let Test = {
	init(APP, spawn) {
		// return;

		// temp
		// setTimeout(() => Self.dispatch({ type: "tab.new", spawn: Spawn }), 300);
		setTimeout(() => eniac.spawn.dispatch({ type: "toggle-sidebar", value: true, spawn }), 350);
		// setTimeout(() => Spawn.find(".xl-shape:nth(0)").trigger("mousedown").trigger("mouseup"), 150);
		
		// setTimeout(() => Spawn.find(".block-buttons .btn:nth(0)").trigger("click"), 300);
		// setTimeout(() => Spawn.find(".recent-file:nth(0)").trigger("click"), 300);
		// setTimeout(() => Spawn.find(".sample:nth(1)").trigger("click"), 300);

		// SHAPES
		setTimeout(() => {
			// $(".def-desktop_").trigger("mousedown").trigger("mouseup");
			
			// spawn.el.find(`.toolbar-tool_:nth(3)`).trigger("click");
			// spawn.el.find(`.sidebar-sheet .color-preset_:nth(0)`).trigger("click");

			spawn.find(`.tbl-body > div:nth(1) td:nth(5)`).trigger("mousedown").trigger("mouseup");

			// spawn.find(`.file-sheet span > svg:nth(0)`).trigger("mousedown").trigger("mouseup");
			// eniac.spawn.sidebar.shape.parent.els.el.find(".sidebar-shape .sidebar-head span:nth(1)").trigger("click");

			// spawn.find(".sidebar-table .sidebar-head span:nth(2)").trigger("click");

			// spawn.find("sidebar .form-checkbox_:nth(0) input").trigger("click");

			// setTimeout(() => $(".def-desktop_").trigger("mousedown").trigger("mouseup"), 500);

		}, 700);

		// setTimeout(() => {
		// 	let target = eniac.spawn.sidebar.shape.parent.els.el.find(".gradient-colors .point:nth(0)")[0];
		// 	eniac.popups.dispatch({ type: "popup-color-ring", target });
		// }, 500);


		// let APP = eniac.spawn,
		// 	Body = APP.els.body;
		// // trigger first mousedown
		// setTimeout(() => Body.trigger("mousedown").trigger("mouseup"), 10);

		// auto show sidebar
		// if (!APP.els.tools.sidebar.hasClass("tool-active_")) {
		// 	APP.els.tools.sidebar.trigger("click");
		// }

		// temp
		// setTimeout(() => Body.find(".tbl-body > div:nth(1) td:nth(14)").trigger("mousedown").trigger("mouseup"), 300);
	}
};
