
// eniac.head

{
	init() {
		// fast references
		this.els = {
			root: window.find("content > .head > div"),
			reel: window.find("content > .head .sheet-reel"),
		};

		// bind event handlers
		this.els.root.on("wheel", this.dispatch);

		// temp
		setTimeout(() => {
			this.dispatch({ type: "add-sheet", name: "Sheet1", active: true });
		}, 1000);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.head,
			max, delta, left,
			name, cn,
			el;
		switch (event.type) {
			// native events
			case "wheel":
				delta = event.deltaY === 0 ? event.deltaX : event.deltaY;
				max = Self.els.root.prop("offsetWidth") - Self.els.reel.prop("offsetWidth");
				left = Math.min(Math.max(Self.els.reel.prop("offsetLeft") - delta, max), 0);
				Self.els.reel.css({ left });
				break;
			// custom events
			case "add-sheet":
				name = event.name || "Sheet 1";
				cn = event.active ? ` class="active"` : "";
				Self.els.reel.find(".active").removeClass("active");
				Self.els.reel.prepend(`<span${cn}><i>${name}</i><u data-menu="sheet-tab"></u></span>`);
				break;
			case "remove-sheet":
				break;
			case "select-sheet":
				el = $(event.target);
				if (el.prop("nodeName") !== "SPAN" || el.hasClass("active")) return;
				event.el.find(".active").removeClass("active");
				el.addClass("active");
				// render clicked sheet
				Render.sheet(el.find("i").html());
				break;
		}
	}
}
