
// eniac.spawn.blankView

{
	init1() {
		
	},
	dispatch(event) {
		let APP = eniac,
			Spawn = event.spawn,
			Self = APP.spawn.blankView,
			file,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "init-blank-view":
				// blank view
				el = Spawn.find(".blank-view");
				if (!el.find(".div").length) {
					// get settings, if any
					let xList = $.xmlFromString(`<Recents/>`);
					let xSamples = window.bluePrint.selectSingleNode(`//Samples`);

					Self.xRecent = window.settings.getItem("recents") || xList.documentElement;
					// add recent files in to data-section
					xSamples.parentNode.append(Self.xRecent);

					// render blank view
					window.render({
						template: "blank-view",
						match: `//Data`,
						target: el,
					});
				}
				break;
			case "open-filesystem":
				// open fs dialog
				APP.spawn.dispatch(event);
				break;
			case "from-clipboard":
				// TODO
				break;
			case "select-sample":
				el = $(event.target);
				if (!el.hasClass("sample")) return;
				// close "current tab"
				APP.spawn.dispatch({ type: "close-tab", spawn: Spawn, delayed: true });
				// load sample
				APP.spawn.dispatch({
					type: "load-samples",
					samples: [el.data("url")],
					spawn: Spawn,
				});
				break;
			case "select-recent-file":
				el = $(event.target);
				if (!el.hasClass("recent-file")) return;

				// close "current tab"
				APP.spawn.dispatch({ type: "close-tab", spawn: Spawn, delayed: true });
				// get FS handle from karaqu
				karaqu.shell(`fs -o '${el.data("file")}' null`)
					.then(exec =>
						APP.spawn.dispatch({
							type: "open.file",
							files: [exec.result],
							spawn: Spawn,
						}));
				break;
			case "add-recent-file":
				if (!event.file.path) return;
				let str = `<i name="${event.file.base}" filepath="${event.file.path}"/>`,
					xFile = $.nodeFromString(str),
					xExist = Self.xRecent.selectSingleNode(`//Recents/*[@filepath="${event.file.path}"]`);
				// remove entry if already exist
				if (xExist) xExist.parentNode.removeChild(xExist);
				// insert new entry at first position
				Self.xRecent.insertBefore(xFile, Self.xRecent.firstChild);
				break;
		}
	}
}