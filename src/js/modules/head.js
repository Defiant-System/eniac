
// eniac.spawn.head

{
	init() {
		
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.spawn.head,
			Spawn = event.spawn,
			max, delta, left,
			name, cn, str,
			index,
			file,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "wheel":
				delta = event.deltaY === 0 ? event.deltaX : event.deltaY;
				max = Self.els.root.prop("offsetWidth") - Self.els.reel.prop("offsetWidth");
				left = Math.min(Math.max(Self.els.reel.prop("offsetLeft") - delta, max), 0);
				Self.els.reel.css({ left });
				break;
			// system events
			case "spawn.blur":
				// unbind event handlers
				if (Self.els.root) Self.els.root.off("wheel", Self.dispatch);
				// reset fast references
				Self.els = {};
				break;
			case "spawn.focus":
				// fast references
				Self.els = {
					root: Spawn.find("content > .head > div"),
					head: Spawn.find("content > .head"),
					reel: Spawn.find("content > .head .sheet-reel"),
				};
				// bind event handlers
				Self.els.root.on("wheel", Self.dispatch);
				break;
			// system menu events
			case "before-menu:sheet-tab":
				console.log( "make adjustments to menu", event.xMenu );
				break;

			// custom events
			case "new-sheet":
				index = Self.els.reel.find(".active").index();
				file = Spawn.data.tabs._active.file;
				name = file.dispatch({ type: "create-new-sheet", index });
				Self.dispatch({ type: "add-sheet", name, makeActive: true });
				// empty work space
				APP.spawn.els.body.find(Guides.selector).remove();
				break;
			case "add-sheet":
				el = Self.els.reel.find(".active").removeClass("active");
				cn = event.makeActive ? `class="active"` : "";
				str = `<span ${cn}><i>${event.name}</i><u data-menu="sheet-tab"></u></span>`;
				if (el.length) el.after(str);
				else Self.els.reel.prepend(str);
				// TODO: add sheet to file & UI

				// enable animation later
				setTimeout(() => Self.els.head.removeClass("empty"), 150);
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
			case "make-active":
				Self.els.reel.find(".active").removeClass("active");
				Self.els.reel.find("> span").map(elem => {
					let el = $(elem);
					if (el.find("> i").text() === event.name) el.addClass("active");
				});
				break;
			case "select-sheet":
				el = $(event.target);
				if (el.prop("nodeName") !== "SPAN" || el.hasClass("active")) return;
				event.el.find(".active").removeClass("active");
				el.addClass("active");
				name = el.find("i").html();
				file = Spawn.data.tabs._active.file;
				// render clicked sheet
				file.dispatch({ type: "render-sheet", spawn: Spawn, name });
				// remember focused item and re-focus, if any
				file.dispatch({ type: "select-sheet", spawn: Spawn, name });

				// reset (active) tools and focus on "sheet"
				return APP.spawn.els.body.trigger("mousedown").trigger("mouseup");
			case "clear-all-sheet":
				// prevent animation
				Self.els.head.addClass("empty");
				// reset tabs
				Self.els.reel.find("> span").remove();
				break;
		}
	}
}
