
{
	init() {
		// fast references
		this.el = window.find(".selection");
	},
	dispatch(event) {
		let APP = numbers,
			Self = APP.selection,
			Content = APP.content,
			active = Content.activeEl,
			xNum, yNum,
			next,
			el;
		switch (event.type) {
			// custom events
			case "move-up":
				xNum = active.index();
				yNum = active.parent().index() - 1;
				next = Parser.getCellByCoord(xNum, yNum);
				if (next.length) {
					Content.dispatch({ type: "focus-cell", target: next[0] });
				}
				break;
			case "move-down":
				xNum = active.index();
				yNum = active.parent().index() + 1;
				next = Parser.getCellByCoord(xNum, yNum);
				if (next.length) {
					Content.dispatch({ type: "focus-cell", target: next[0] });
				}
				break;
			case "move-right":
				next = active.next("td");
				if (next.length) {
					Content.dispatch({ type: "focus-cell", target: next[0] });
				}
				break;
			case "move-left":
				next = active.prev("td");
				if (next.length) {
					Content.dispatch({ type: "focus-cell", target: next[0] });
				}
				break;
		}
	}
}
