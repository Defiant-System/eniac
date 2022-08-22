
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
			case "open-filesystem":
				APP.dispatch({ type: "open-file" });
				break;
			case "from-clipboard":
				// TODO
				break;
			case "select-sample":
				el = $(event.target);
				if (!el.hasClass("sample")) return;

				APP.spawn.dispatch({
					type: "load-samples",
					samples: [el.data("url")],
					spawn: Spawn,
				});
				break;
			case "select-recent-file":
				el = $(event.target);
				if (!el.hasClass("recent-file")) return;
				
				karaqu.shell(`fs -o '${el.data("file")}' null`)
					.then(exec => APP.dispatch(exec.result));
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