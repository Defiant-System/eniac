
// eniac.sidebar

{
	init() {
		// fast references
		this.els = {
			layout: window.find("layout"),
			el: window.find("sidebar"),
		};
		// temp
		// window.find(`.toolbar-tool_[data-click="toggle-sidebar"]`).trigger("click");
	},
	glHash: {
		"h-gridlines": "hide-hg-lines",
		"v-gridlines": "hide-vg-lines",
		"hg-header":   "hide-hgh-lines",
		"vg-body":     "hide-vgb-lines",
		"vg-footer":   "hide-vgf-lines",
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar,
			table,
			value,
			name,
			isOn,
			pEl,
			el;
		switch (event.type) {
			case "toggle-sidebar":
				isOn = Self.els.layout.hasClass("show-sidebar");
				Self.els.layout.toggleClass("show-sidebar", isOn);
				return !isOn;
			case "show-sheet":
			case "show-table":
			case "show-chart":
			case "show-empty":
				Self.els.el.removeClass("show-sheet show-table show-chart show-empty");
				Self.els.el.addClass(event.type);
				break;
			case "select-tab":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				
				pEl = event.el.parent();
				pEl.find(".sidebar-body.active").removeClass("active");
				pEl.find(".sidebar-body").get(el.index()).addClass("active");
				break;
			case "populate-values":
				Self.dispatch({ ...event, type: "update-table-row-col" });
				Self.dispatch({ ...event, type: "update-gridlines" });
				break;
			case "update-table-row-col":
				table = event.table || Parser.table;
				Self.els.el.find(`input[name="table-rows-num"]`).val(event.table.find("tr").length);
				Self.els.el.find(`input[name="table-cols-num"]`).val(event.table.find("tr:first td").length);
				break;
			case "update-gridlines":
				table = event.table || Parser.table;

				for (let key in Self.glHash) {
					let hash = Self.glHash[key],
						method = table.hasClass(hash) ? "removeClass" : "addClass";
					Self.els.el.find(`span[data-name="${key}"]`)[method]("active_");
				}
				break;
			case "set-gridlines":
				el = $(event.target);
				value = el.hasClass("active_");
				table = Parser.table;
				// toggle button and table UI
				el[ value ? "removeClass" : "addClass" ]("active_");
				table[ value ? "addClass" : "removeClass" ]( Self.glHash[el.data("name")] );
				break;
			case "set-table-outline-color":
			case "set-alternating-row-color":
			case "cell-fill-color":
			case "cell-border-color":
			case "set-text-color":
				console.log(event);
				break;
			case "set-sheet-bgcolor":
				Self.els.layout.find(".body").css({ "background-color": event.value });
				break;
			case "popup-color-palette":
				// forward event
				APP.popups.dispatch(event);
				break;
		}
	}
}
