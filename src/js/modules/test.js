
let Test = {
	init(APP, spawn) {

		return;
		setTimeout(() => spawn.find(`.toolbar-tool_[data-arg="grid"]`).trigger("click"), 500);

		setTimeout(() => spawn.find(`.btn[data-click="new-file"]`).trigger("click"), 500);
		
		// temp
		// setTimeout(() => Self.dispatch({ type: "tab.new", spawn: Spawn }), 300);
		setTimeout(() => eniac.spawn.dispatch({ type: "toggle-sidebar", value: true, spawn }), 500);
		// setTimeout(() => Spawn.find(".xl-shape:nth(0)").trigger("mousedown").trigger("mouseup"), 150);
		
		// setTimeout(() => Spawn.find(".block-buttons .btn:nth(0)").trigger("click"), 300);
		// setTimeout(() => Spawn.find(".recent-file:nth(0)").trigger("click"), 300);
		// setTimeout(() => Spawn.find(".sample:nth(1)").trigger("click"), 300);

		// SHAPES
		setTimeout(() => {
			// spawn.el.find(`.toolbar-tool_:nth(3)`).trigger("click");

			spawn.find(`.tbl-body > div:nth(1) td:nth(5)`).trigger("mousedown").trigger("mouseup");

			// spawn.find(`.file-sheet span > svg:nth(0)`).trigger("mousedown").trigger("mouseup");
			// eniac.spawn.sidebar.shape.parent.els.el.find(".sidebar-shape .sidebar-head span:nth(1)").trigger("click");

			// spawn.find(".sidebar-table .sidebar-head span:nth(2)").trigger("click");

			// spawn.find("sidebar .form-checkbox_:nth(0) input").trigger("click");

			// setTimeout(() => $(".def-desktop_").trigger("mousedown").trigger("mouseup"), 500);
			// setTimeout(() => {
			// 	let el = spawn.el.find(`.sidebar-table .color-preset_:nth(0)`);
			// 	el.data({ click: "popup-color-ring" });
			// 	el.trigger("click");
			// }, 100);

		}, 800);

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
