
// eniac.sidebar.functions

{
	init(parent) {
		// fast references
		this.parent = parent;
		this.els = {
			matchList: window.find(".sidebar-functions .search-matches"),
		}

		// console.log( 111, window.bluePrint.selectSingleNode("//Functions"));
		// render sidebar contents
		window.render({
			template: "functions-list",
			target: this.els.matchList,
		});
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar.functions,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "populate-functions-values":
				// tab: Functions
				break;
			case "update-functions-name":
				break;
		}
	}
}
