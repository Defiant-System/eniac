
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
		// setTimeout(() => this.els.reel.find("> span:nth(2)").trigger("click"), 100);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.head,
			max, delta, left,
			name, cn, str,
			index,
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
			case "new-sheet":
				index = Self.els.reel.find(".active").index();
				name = APP.file.dispatch({ type: "create-new-sheet", index });
				Self.dispatch({ type: "add-sheet", name, makeActive: true });
				// empty work space
				APP.els.body.find(Guides.selector).remove();
				break;
			case "add-sheet":
				el = Self.els.reel.find(".active").removeClass("active");
				cn = event.makeActive ? `class="active"` : "";
				str = `<span ${cn}><i>${event.name}</i><u data-menu="sheet-tab"></u></span>`;
				if (el.length) el.after(str);
				else Self.els.reel.prepend(str);
				// TODO: add sheet to file & UI
				break;
			case "remove-sheet":
				el = event.origin ? event.origin.el.parents("span") : Self.els.reel.find(".active");
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
				name = el.find("i").html();
				// render clicked sheet
				APP.file.dispatch({ type: "render-sheet", name });

				// TODO: remember focused item and re-focus, if any

				// reset (active) tools and focus on "sheet"
				return APP.els.body.trigger("mousedown").trigger("mouseup");
		}
	}
}
