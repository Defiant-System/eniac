
// eniac.tools

{
	init() {
		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools,
			el;
		switch (event.type) {
			case "hide":
				break;
		}
	},
	sheet: @import "sheet.js",
	table: @import "table.js",
	shape: @import "shape.js",
	image: @import "image.js",
	text: @import "text.js",
}
