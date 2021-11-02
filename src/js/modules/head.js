
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
		// setTimeout(() => this.dispatch({ type: "add-sheet", name: "Sheet1" }), 1000);
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
			// system menu events
			case "before-menu:sheet-tab":
				console.log( "make adjustments to menu", event.xMenu );
				break;
			// custom events
			case "add-sheet":
				name = event.name || "Sheet1";
				Self.els.reel.find(".active").removeClass("active");
				Self.els.reel.prepend(`<span class="active"><i>${name}</i><u data-click1="remove-sheet" data-menu="sheet-tab"></u></span>`);
				// TODO: add sheet to file & UI
				break;
			case "remove-sheet":
				el = event.origin.el.parents("span");
				el.cssSequence("remove-sheet", "animationend", el => {
					let nextEl = el.next("span");
					if (!nextEl.length) nextEl = el.prev("span");					
					nextEl.trigger("click");
					// remove sheet element
					el.remove();
					// TODO: remove sheet from file
				});
				break;
			case "select-sheet":
				el = $(event.target);
				if (el.prop("nodeName") !== "SPAN" || el.hasClass("active")) return;
				event.el.find(".active").removeClass("active");
				el.addClass("active");
				// TODO: remember focused item and re-focus, if any
				APP.body.trigger("mousedown");
				// render clicked sheet
				APP.file.dispatch({
					type: "render-sheet",
					name: el.find("i").html(),
				});
				break;
		}
	}
}
