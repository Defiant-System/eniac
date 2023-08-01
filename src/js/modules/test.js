
let Test = {
	init(APP, spawn) {

		// temp
		// setTimeout(() => Self.dispatch({ type: "tab.new", spawn: Spawn }), 300);
		setTimeout(() => eniac.spawn.dispatch({ type: "toggle-sidebar", value: true, spawn }), 300);
		// setTimeout(() => Spawn.find(".xl-shape:nth(0)").trigger("mousedown").trigger("mouseup"), 150);
		
		// setTimeout(() => Spawn.find(".block-buttons .btn:nth(0)").trigger("click"), 300);
		// setTimeout(() => Spawn.find(".recent-file:nth(0)").trigger("click"), 300);
		// setTimeout(() => Spawn.find(".sample:nth(1)").trigger("click"), 300);

		// SHAPES
		setTimeout(() => {
			spawn.find(`.file-sheet span > svg:nth(0)`).trigger("mousedown").trigger("mouseup");
		// 	eniac.spawn.sidebar.shape.parent.els.el.find(".sidebar-shape .sidebar-head span:nth(1)").trigger("click");
		}, 300);

		// setTimeout(() => {
		// 	let target = eniac.spawn.sidebar.shape.parent.els.el.find(".gradient-colors .point:nth(0)")[0];
		// 	eniac.popups.dispatch({ type: "popup-color-ring", target });
		// }, 500);
	}
};
