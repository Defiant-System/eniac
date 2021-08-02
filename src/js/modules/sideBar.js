
// eniac.sidebar

{
	init() {
		// fast references
		this.els = {
			layout: window.find("layout"),
			el: window.find("sidebar"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar,
			Sheet,
			value,
			pEl,
			el;
		switch (event.type) {
			case "toggle-sidebar":
				isOn = Self.els.layout.hasClass("show-sidebar");
				Self.els.layout.toggleClass("show-sidebar", isOn);
				return !isOn;
			case "show-sheet":
			case "show-title":
			case "show-caption":
			case "show-table":
			case "show-chart":
			case "show-empty":
				Self.els.el.removeClass("show-sheet show-title show-caption show-table show-chart show-empty");
				Self.els.el.addClass(event.type);
				// trigger populate event
				Self.dispatch({ ...event, type: `populate-${event.type.split("-")[1]}-values` });
				break;
			case "select-tab":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				
				pEl = event.el.parent();
				pEl.find(".sidebar-body.active").removeClass("active");
				pEl.find(".sidebar-body").get(el.index()).addClass("active");
				break;
			case "populate-table-values":
				Self.dispatch({ ...event, type: "update-table-style" });
				Self.dispatch({ ...event, type: "update-table-title-caption" });
				Self.dispatch({ ...event, type: "update-table-head-footer-rows" });
				Self.dispatch({ ...event, type: "update-table-row-col" });
				break;
			case "update-table-style":
				Sheet = event.sheet || APP.tools.sheet.el;
				// reset (if any) previous active
				el = Self.els.el.find(".styles");
				el.find(".active").removeClass("active");
				// table style preset
				Sheet.prop("className").split(" ").map(name => {
					let item = el.find(`span[data-arg="${name}"]`);
					if (item.length) item.addClass("active");
				});
				break;
			case "update-table-title-caption":
				Sheet = event.sheet || APP.tools.sheet.el;
				// checkbox values
				value = Sheet.find(".table-title").length;
				Self.els.el.find(`input#table-title`).prop({ checked: value });
				value = Sheet.find(".table-caption").length;
				Self.els.el.find(`input#table-caption`).prop({ checked: value });
				break;
			case "update-table-head-footer-rows":
				Sheet = event.sheet || APP.tools.sheet.el;
				// selectbox: table-header-rows
				value = [Sheet.find(".tbl-body > div:nth-child(1) tr:nth-child(1) td").length];
				if (value[0] > 0) value.push("table-header-rows-freeze");
				Self.els.el.find(`selectbox.table-header-rows`).val(value);
				// selectbox: table-header-columns
				value = [Sheet.find(".tbl-col-head > div:nth-child(2) tr").length];
				if (value[0] > 0) value.push("table-header-columns-freeze");
				Self.els.el.find(`selectbox.table-header-columns`).val(value);
				// selectbox: table-footer-rows
				value = [Sheet.find(".tbl-col-foot > div:nth-child(2) tr").length];
				if (value[0] > 0) value.push("table-footer-rows-freeze");
				Self.els.el.find(`selectbox.table-footer-rows`).val(value);
				break;
			case "update-table-row-col":
				Sheet = event.sheet || APP.tools.sheet.el;
				// input values
				value = Sheet.find(".tbl-root > div > div:nth-child(2) tr").length;
				Self.els.el.find(`input[name="table-rows-num"]`).val(value);
				value = Sheet.find(".tbl-body tr:nth-child(1) td").length;
				Self.els.el.find(`input[name="table-cols-num"]`).val(value);
				break;
			// set values based on UI interaction
			case "set-table-style":
				el = $(event.target);
				event.el.find(".active").removeClass("active");
				el.addClass("active");
				
				Sheet = event.sheet || APP.tools.sheet.el;
				Sheet.prop({ className: `sheet ${el.data("arg")}` });
				break;
			case "toggle-table-title":
				Sheet = event.sheet || APP.tools.sheet.el;

				if (event.el.is(":checked")) {
					Sheet.prepend(`<div class="table-title">Title</div>`);
				} else {
					Sheet.find(".table-title").remove();
				}
				// sync tools table
				APP.tools.dispatch({ type: "sync-sheet-table", sheet: Sheet });
				break;
			// forward popup events
			case "popup-color-palette":
				APP.popups.dispatch(event);
				break;
		}
	}
}
