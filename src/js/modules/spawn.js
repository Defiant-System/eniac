
// eniac.spawn

{
	init() {

	},
	dispose(event) {
		// let Spawn = event.spawn;
		// let cmd = { type: "open.file", files: [] };
		// for (let key in Spawn.data.tabs._stack) {
		// 	let tab = Spawn.data.tabs._stack[key];
		// 	cmd.files.push(tab.file.path);
		// }
		// return cmd;
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.spawn,
			Spawn = event.spawn,
			tabs,
			file,
			table,
			data,
			name,
			value,
			pEl,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.open":
				Spawn.data.tabs = new Tabs(Self, Spawn);

				// init all sub-objects
				// Object.keys(this)
				// 	.filter(i => typeof this[i].init === "function")
				// 	.map(i => this[i].init(Spawn));

				// temp
				// setTimeout(() => Self.dispatch({ type: "new-tab", spawn: Spawn }), 300);
				break;
			case "spawn.init":
				Self.dispatch({ ...event, type: "new-tab" });
				break;
			case "spawn.blur":
			case "spawn.focus":
				// forward event to all sub-objects
				Object.keys(this)
					.filter(i => typeof this[i].dispatch === "function")
					.map(i => this[i].dispatch(event));
				break;
			case "open.file":
				(event.files || [event]).map(async fHandle => {
					let fItem = await fHandle.open({ responseType: "arrayBuffer" }),
						data = new Uint8Array(fItem.arrayBuffer),
						file = new File(fItem, data);
					// auto add first base "tab"
					Self.dispatch({ ...event, file, type: "new-tab" });
				});
				break;

			// tab related events
			case "new-tab":
				file = event.file || new karaqu.File({ kind: "xlsx", data: "" });
				Spawn.data.tabs.add(file);
				break;
			case "tab-clicked":
				Spawn.data.tabs.focus(event.el.data("id"));
				break;
			case "tab-close":
				Spawn.data.tabs.remove(event.el.data("id"));
				break;
		}
	},
	head: @import "./head.js",
}
