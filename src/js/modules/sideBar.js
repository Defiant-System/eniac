
// eniac.sidebar

{
	init() {
		// fast references
		this.els = {
			layout: window.find("layout"),
			el: window.find("sidebar"),
		};
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
			Sheet = event.sheet || APP.tools.sheet.el,
			from,
			to,
			value,
			arg,
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
				Self.dispatch({ ...event, type: "update-table-title-caption-clip" });
				Self.dispatch({ ...event, type: "update-table-head-footer-rows" });
				Self.dispatch({ ...event, type: "update-table-row-col" });
				Self.dispatch({ ...event, type: "update-table-outlines" });
				Self.dispatch({ ...event, type: "update-gridlines" });
				Self.dispatch({ ...event, type: "update-alt-row-bg" });
				break;
			case "update-table-style":
				// Sheet = event.sheet || APP.tools.sheet.el;
				// reset (if any) previous active
				el = Self.els.el.find(".styles");
				el.find(".active").removeClass("active");
				// table style preset
				Sheet.prop("className").split(" ").map(name => {
					let item = el.find(`span[data-arg="${name}"]`);
					if (item.length) item.addClass("active");
				});
				break;
			case "update-table-title-caption-clip":
				// Sheet = event.sheet || APP.tools.sheet.el;
				// checkbox values
				value = Sheet.find(".table-title").length;
				Self.els.el.find(`input#table-title`).prop({ checked: value });
				value = Sheet.find(".table-caption").length;
				Self.els.el.find(`input#table-caption`).prop({ checked: value });
				value = Sheet.hasClass("clipped");
				Self.els.el.find(`input#table-clip`).prop({ checked: value });
				
				pEl = Self.els.el.find(".table-clipping");
				pEl.toggleClass("expand", !value);
				// input fields: fit width
				value = Sheet.find(".tbl-root").prop("offsetWidth");
				pEl.find("input#table-clip-width").val(value);
				pEl.find(`button[arg="width"]`).toggleAttr("disabled", value < APP.tools.sheet.grid.width);
				// input fields: fit height
				value = Sheet.find(".tbl-root").prop("offsetHeight");
				pEl.find("input#table-clip-height").val(value);
				pEl.find(`button[arg="height"]`).toggleAttr("disabled", value < APP.tools.sheet.grid.height);
				break;
			case "update-table-head-footer-rows":
				// Sheet = event.sheet || APP.tools.sheet.el;
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
				// Sheet = event.sheet || APP.tools.sheet.el;
				// input values
				value = APP.tools.sheet.rowNum;
				Self.els.el.find(`input[name="table-rows-num"]`).val(value);
				value = APP.tools.sheet.colNum;
				Self.els.el.find(`input[name="table-cols-num"]`).val(value);
				break;
			case "update-table-outlines":
				// Sheet = event.sheet || APP.tools.sheet.el;
				// border style
				value = Sheet.cssProp("--border-style");
				Self.els.el.find(".table-outline option").prop({ value });
				// border style
				value = Sheet.cssProp("--border-color");
				Self.els.el.find(".table-outline-details .color-preset_").css({ "--preset-color": value });
				// border style
				value = parseInt(Sheet.cssProp("--border-width"), 10);
				Self.els.el.find(".table-outline-details input").prop({ value });
				// checkbox values
				value = Sheet.find(".table-title").hasClass("title-outline");
				Self.els.el.find(`input#outline-table-title`).prop({ checked: value });
				break;
			case "update-gridlines":
				// Sheet = event.sheet || APP.tools.sheet.el;
				// enable/disable gridline options
				value = APP.tools.els.cols.hasClass("has-col-head") ? "removeClass" : "addClass";
				Self.els.el.find(`span[data-name="hg-header"]`)[value]("disabled_");
				value = APP.tools.els.rows.hasClass("has-row-head") ? "removeClass" : "addClass";
				Self.els.el.find(`span[data-name="vg-body"]`)[value]("disabled_");
				value = APP.tools.els.rows.hasClass("has-row-foot") ? "removeClass" : "addClass";
				Self.els.el.find(`span[data-name="vg-footer"]`)[value]("disabled_");
				// iterate hash record
				for (let key in Self.glHash) {
					let hash = Self.glHash[key],
						method = Sheet.hasClass(hash) ? "removeClass" : "addClass";
					Self.els.el.find(`span[data-name="${key}"]`)[method]("active_");
				}
				break;
			case "update-alt-row-bg":
				// checkbox
				value = Sheet.hasClass("alt-row-bg");
				Self.els.el.find(`input#alternate-row-color`).prop({ checked: value });
				// color preset
				value = Sheet.cssProp("--alt-row-color");
				Self.els.el
					.find(".table-alt-bg-details .color-preset_")
					.css({ "--preset-color": value || "transparent" });
				break;
			// set values based on UI interaction
			case "set-table-style":
				el = $(event.target);
				event.el.find(".active").removeClass("active");
				el.addClass("active");
				
				// Sheet = event.sheet || APP.tools.sheet.el;
				Sheet.prop({ className: `sheet ${el.data("arg")}` });
				break;
			case "set-table-col-head":
				// Sheet = event.sheet || APP.tools.sheet.el;
				// head row columns
				from = Sheet.find(".tbl-body > div:nth-child(1) table");
				to = Sheet.find(".tbl-col-head > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-rows-to", from, to });
				// body row columns
				from = Sheet.find(".tbl-body > div:nth-child(2) table");
				to = Sheet.find(".tbl-col-head > div:nth-child(2) table");
				Self.dispatch({ ...event, type: "move-rows-to", from, to });
				break;
			case "set-table-row-head":
				// Sheet = event.sheet || APP.tools.sheet.el;
				// head row(s)
				from = Sheet.find(".tbl-col-head > div:nth-child(2) table");
				to = Sheet.find(".tbl-col-head > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-column-to", from, to });
				// body row(s)
				from = Sheet.find(".tbl-body > div:nth-child(2) table");
				to = Sheet.find(".tbl-body > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-column-to", from, to });
				// foot row(s)
				from = Sheet.find(".tbl-col-foot > div:nth-child(2) table");
				to = Sheet.find(".tbl-col-foot > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-column-to", from, to });
				// sync tools table
				APP.tools.dispatch({ type: "sync-sheet-table", sheet: Sheet });
				break;
			case "set-table-col-foot":
				// Sheet = event.sheet || APP.tools.sheet.el;
				// foot row columns
				from = Sheet.find(".tbl-body > div:nth-child(1) table");
				to = Sheet.find(".tbl-col-foot > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-rows-to", from, to });
				// body row columns
				from = Sheet.find(".tbl-body > div:nth-child(2) table");
				to = Sheet.find(".tbl-col-foot > div:nth-child(2) table");
				Self.dispatch({ ...event, type: "move-rows-to", from, to });
				break;
			case "set-alt-row-bg":
				value = event.el.is(":checked");
				Sheet[ value ? "addClass" : "removeClass" ]("alt-row-bg");
				break;
			case "set-alt-row-color":
				Sheet.css({ "--alt-row-color": event.value });
				break;
			case "move-rows-to": {
				let tblFrom = event.from.find("tbody"),
					tblTo = event.to.find("tbody");
				// exit if both tables are empty
				if (!tblFrom.length && !tblTo.length) return;

				let rowsFrom = tblFrom.find("tr"),
					rowsTo = tblTo.length ? tblTo.find("tr") : [],
					rowsCurr = tblTo.length ? tblTo.find("tr") : [],
					rowNum = +event.arg;
				// course of action
				if (rowsTo.length && rowsCurr.length > rowNum) {
					tblTo = tblFrom;
					tblFrom = event.to.find("tbody");
					// manipulate DOM
					[...Array(rowsCurr.length - rowNum)].map(tr =>
						tblTo.prepend(tblFrom[0].lastChild));
				} else {
					if (!tblTo.length) {
						event.to.append(tblFrom[0].cloneNode(false));
						tblTo = event.to.find("tbody");
					}
					// manipulate DOM
					[...Array(rowNum - rowsCurr.length)].map(tr =>
						tblTo.append(tblFrom[0].firstChild));
				}
				break; }
			case "move-column-to": {
				let tblFrom = event.from.find("tbody"),
					tblTo = event.to.find("tbody");
				// exit if both tables are empty
				if (!tblFrom.length && !tblTo.length) return;

				let rowsFrom = tblFrom.find("tr"),
					rowsTo = tblTo.length ? tblTo.find("tr") : [],
					colCurr = rowsTo.length ? rowsTo.get(0).find("td") : [],
					colNum = +event.arg;
				// course of action
				if (rowsTo.length && colCurr.length > colNum) {
					tblFrom = tblTo;
					rowsFrom = rowsTo;
					tblTo = event.from.find("tbody");
					rowsTo = tblTo.find("tr");
					// manipulate DOM
					rowsFrom.map((tr, y) =>
						[...Array(colCurr.length - colNum)].map(i =>
							rowsTo.get(y).prepend(tr.lastChild)));
				} else {
					// in case to-table doesn't have TBODY
					if (!tblTo.length) {
						event.to.append(tblFrom[0].cloneNode(false));
						tblTo = event.to.find("tbody");
						// first make sure both tables have equal rows
						rowsFrom.map(tr => tblTo.append(tr.cloneNode(false)));
						// refresh reference
						rowsTo = tblTo.find("tr");
					}
					// manipulate DOM
					rowsFrom.map((tr, y) =>
						[...Array(colNum - colCurr.length)].map(i =>
							rowsTo.get(y).append(tr.firstChild)));
				}
				break; }
			case "toggle-table-title":
				// Sheet = event.sheet || APP.tools.sheet.el;
				// toggle table title
				if (event.el.is(":checked")) Sheet.prepend(`<div class="table-title">Title</div>`);
				else Sheet.find(".table-title").remove();
				// sync tools table
				APP.tools.dispatch({ type: "sync-sheet-table", sheet: Sheet });
				// sync tools selection indicators
				APP.tools.dispatch({ type: "select-coords", ...APP.tools.selected });
				// re-sync selection box
				Cursor.dispatch({ type: "re-sync-selection" });
				break;
			case "toggle-table-caption":
				// Sheet = event.sheet || APP.tools.sheet.el;
				// toggle table caption
				if (event.el.is(":checked")) Sheet.append(`<div class="table-caption">Caption</div>`);
				else Sheet.find(".table-caption").remove();
				break;
			case "toggle-table-clip":
				// Sheet = event.sheet || APP.tools.sheet.el;
				// toggle table clipping
				if (event.el.is(":checked")) {
					Self.els.el.find(".table-clipping").addClass("expand");
					Sheet.addClass("clipped");
					APP.tools.els.root.addClass("clip");
				} else {
					Self.els.el.find(".table-clipping").removeClass("expand");
					Sheet.removeClass("clipped");
					APP.tools.els.root.removeClass("clip");
					// update sidebar
					el = Self.els.el.find(`.table-clipping button[arg="width"]`);
					Self.dispatch({ type: "fit-table-clip", arg: "width", target: el });
					el = Self.els.el.find(`.table-clipping button[arg="height"]`);
					Self.dispatch({ type: "fit-table-clip", arg: "width", target: el });
					
					Sheet.find(".tbl-root").css({ width: "", height: "" });
				}
				break;
			case "fit-table-clip":
				// Sheet = event.sheet || APP.tools.sheet.el;
				// disable button
				el = $(event.target);
				el.attr({ disabled: true });
				arg = el.attr("arg");

				value = {};
				value[arg] = APP.tools.sheet.grid[arg];
				Sheet.find(".tbl-root").css(value);
				
				value[arg] = Sheet.prop(arg === "width" ? "offsetWidth" : "offsetHeight");
				APP.tools.els.root.css(value);
				break;
			case "set-table-outline-style":
				value = event.arg;
				Sheet.css({ "--border-style": value });
				break;
			case "set-table-outline-color":
				value = event.value;
				Sheet.css({ "--border-color": value });
				break;
			case "toggle-table-title-outline":
				// Sheet = event.sheet || APP.tools.sheet.el;
				// toggle title outline
				if (event.el.is(":checked")) Sheet.find(".table-title").addClass("title-outline");
				else Sheet.find(".table-title").removeClass("title-outline");
				break;
			case "set-gridlines":
				el = $(event.target);
				value = el.hasClass("active_");
				Sheet = event.sheet || APP.tools.sheet.el;
				// toggle button and table UI
				el[ value ? "removeClass" : "addClass" ]("active_");
				Sheet[ value ? "addClass" : "removeClass" ]( Self.glHash[el.data("name")] );
				break;
			// forward popup events
			case "popup-color-palette":
				APP.popups.dispatch(event);
				break;
		}
	}
}
