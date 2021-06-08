
// eniac.selection

{
	init() {
		// fast references
		this.el = window.find(".selection");
		this.selText = this.el.find("textarea");
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.selection,
			Content = APP.content,
			active = Content.activeEl,
			top, left, width, height,
			xNum, yNum,
			next,
			el;
		switch (event.type) {
			// custom events
			case "move-up":
			case "move-down":
				xNum = active.index();
				yNum = active.parent().index() + (event.type === "move-up" ? -1 : 1);
				next = Parser.getCellByCoord(xNum, yNum);
				if (next.length) {
					Content.dispatch({ type: "focus-cell", target: next[0] });
				}
				break;
			case "move-right":
			case "move-left":
				next = active[ event.type === "move-right" ? "next" : "prev" ]("td");
				if (next.length) {
					Content.dispatch({ type: "focus-cell", target: next[0] });
				}
				break;
			case "select-column":
				let first = event.cols[0] ,
					last = event.cols[event.cols.length - 1];
				top = first.offsetTop - 2;
				left = first.offsetLeft - 2;
				width = first.offsetWidth + 5;
				height = last.offsetTop + last.offsetHeight + 5;

				Self.el.addClass("show").css({ top, left, width, height });
				Self.selText.val("");
				break;
			case "select-row":
			case "select-cell":
				top = event.target.offsetTop - 2;
				left = event.target.offsetLeft - 2;
				width = event.target.offsetWidth + 5;
				height = event.target.offsetHeight + 5;
				Self.el.addClass("show").css({ top, left, width, height });

				if (event.el) {
					Self.selText.val(event.el.text()).focus();
				} else {
					Self.selText.val("");
				}
				break;
		}
	}
}
