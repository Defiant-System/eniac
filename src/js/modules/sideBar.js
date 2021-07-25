
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
				Self.dispatch({ ...event, type: "update-alt-row-bg" });
				break;
			case "update-table-row-col":
				table = event.table || Parser.table;
				Self.els.el.find(`input[name="table-rows-num"]`).val(table.find("tr").length);
				Self.els.el.find(`input[name="table-cols-num"]`).val(table.find("tr:first td").length);
				break;
			case "update-alt-row-bg":
				table = event.table || Parser.table;
				pEl = table.parent();
				// checkbox
				value = pEl.hasClass("alternate-row-bg");
				Self.els.el.find(`input#alternate-row-color`).prop({ checked: value });
				// color preset
				Self.els.el
					.find(`.color-preset_[data-change="set-alternating-row-color"]`)
					.css({ "--preset-color": table.css("--alt-row-bg") || "transparent" });
				break;
			case "update-gridlines":
				table = event.table || Parser.table;
				pEl = table.parent();
				// iterate hash record
				for (let key in Self.glHash) {
					let hash = Self.glHash[key],
						method = pEl.hasClass(hash) ? "removeClass" : "addClass";
					Self.els.el.find(`span[data-name="${key}"]`)[method]("active_");
				}
				break;
			case "toggle-table-title":
				if (event.el.is(":checked")) {
					// add title element
					Parser.tblWrapper.prepend(`<div class="table-title">Title</div>`);
				} else {
					// remove title element
					Parser.tblWrapper.find(".table-title").remove();
				}
				// sync cursor
				Cursor.dispatch({ type: "selection-box" });
				// sync tools table
				APP.tools.dispatch({ type: "sync-sheet-table" });
				break;
			case "toggle-table-caption":
				if (event.el.is(":checked")) {
					// add caption element
					Parser.tblWrapper.append(`<div class="table-caption">Caption</div>`);
				} else {
					// remove caption element
					Parser.tblWrapper.find(".table-caption").remove();
				}
				break;
			case "set-gridlines":
				el = $(event.target);
				value = el.hasClass("active_");
				pEl = Parser.tblWrapper;
				// toggle button and table UI
				el[ value ? "removeClass" : "addClass" ]("active_");
				pEl[ value ? "addClass" : "removeClass" ]( Self.glHash[el.data("name")] );
				break;
			case "set-alt-row-bg":
				value = event.el.is(":checked");
				Parser.tblWrapper[ value ? "addClass" : "removeClass" ]("alternate-row-bg");
				break;
			case "set-alt-row-color":
				Parser.tblWrapper.css({ "--alt-row-bg": event.value });
				break;
			case "set-table-outline-color":
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
