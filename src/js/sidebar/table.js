
// eniac.sidebar.table

{
	glHash: {
		"h-gridlines": "hide-hg-lines",
		"v-gridlines": "hide-vg-lines",
		"hg-header":   "hide-hgh-lines",
		"vg-body":     "hide-vgb-lines",
		"vg-footer":   "hide-vgf-lines",
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar.table,
			Els = APP.sidebar.els,
			Table = event.table || APP.tools.table.grid._el,
			from,
			to,
			value,
			arg,
			pEl,
			el;
		switch (event.type) {
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
				// reset (if any) previous active
				el = Els.el.find(".table-styles");
				el.find(".active").removeClass("active");
				// table style preset
				Table.prop("className").split(" ").map(name => {
					let item = el.find(`span[data-arg="${name}"]`);
					if (item.length) item.addClass("active");
				});
				break;
			case "update-table-title-caption-clip":
				// checkbox values
				value = Table.find(".table-title").length;
				Els.el.find(`input#table-title`).prop({ checked: value });
				value = Table.find(".table-caption").length;
				Els.el.find(`input#table-caption`).prop({ checked: value });
				value = Table.hasClass("clipped");
				Els.el.find(`input#table-clip`).prop({ checked: value });
				
				pEl = Els.el.find(".table-clipping");
				pEl.toggleClass("expand", !value);
				// input fields: fit width
				value = Table.find(".tbl-root").prop("offsetWidth");
				pEl.find("input#table-clip-width").val(value);
				pEl.find(`button[arg="width"]`).toggleAttr("disabled", value < APP.tools.table.grid.width);
				// input fields: fit height
				value = Table.find(".tbl-root").prop("offsetHeight");
				pEl.find("input#table-clip-height").val(value);
				pEl.find(`button[arg="height"]`).toggleAttr("disabled", value < APP.tools.table.grid.height);
				break;
			case "update-table-head-footer-rows":
				// selectbox: table-header-rows
				value = [Table.find(".tbl-body > div:nth-child(1) tr:nth-child(1) td").length];
				// if (value[0] > 0) value.push("table-header-rows-freeze");
				Els.el.find(`selectbox.table-header-rows`).val(value);
				// selectbox: table-header-columns
				value = [Table.find(".tbl-col-head > div:nth-child(2) tr").length];
				// if (value[0] > 0) value.push("table-header-columns-freeze");
				Els.el.find(`selectbox.table-header-columns`).val(value);
				// selectbox: table-footer-rows
				value = [Table.find(".tbl-col-foot > div:nth-child(2) tr").length];
				// if (value[0] > 0) value.push("table-footer-rows-freeze");
				Els.el.find(`selectbox.table-footer-rows`).val(value);
				break;
			case "update-table-row-col":
				// input values
				value = APP.tools.table.grid.dimension.rows;
				Els.el.find(`input[name="table-rows-num"]`).val(value);
				value = APP.tools.table.grid.dimension.cols;
				Els.el.find(`input[name="table-cols-num"]`).val(value);
				break;
			case "update-table-outlines":
				// border style
				value = Table.cssProp("--border-style");
				Els.el.find(".table-outline option").prop({ value });
				// border style
				value = Table.cssProp("--border-color");
				Els.el.find(".table-outline-details .color-preset_").css({ "--preset-color": value });
				// border style
				value = parseInt(Table.cssProp("--border-width"), 10);
				Els.el.find(".table-outline-details input").prop({ value });
				// checkbox values
				value = Table.find(".table-title").hasClass("title-outline");
				Els.el.find(`input#outline-table-title`).prop({ checked: value });
				break;
			case "update-gridlines":
				// enable/disable gridline options
				value = APP.tools.table.els.cols.hasClass("has-col-head") ? "removeClass" : "addClass";
				Els.el.find(`span[data-name="hg-header"]`)[value]("disabled_");
				value = APP.tools.table.els.rows.hasClass("has-row-head") ? "removeClass" : "addClass";
				Els.el.find(`span[data-name="vg-body"]`)[value]("disabled_");
				value = APP.tools.table.els.rows.hasClass("has-row-foot") ? "removeClass" : "addClass";
				Els.el.find(`span[data-name="vg-footer"]`)[value]("disabled_");
				// iterate hash record
				for (let key in Self.glHash) {
					let hash = Self.glHash[key],
						method = Table.hasClass(hash) ? "removeClass" : "addClass";
					Els.el.find(`span[data-name="${key}"]`)[method]("active_");
				}
				break;
			case "update-alt-row-bg":
				// checkbox
				value = Table.hasClass("alt-row-bg");
				Els.el.find(`input#alternate-row-color`).prop({ checked: value });
				// color preset
				value = Table.cssProp("--alt-row-color");
				Els.el
					.find(".table-alt-bg-details .color-preset_")
					.css({ "--preset-color": value || "transparent" });
				break;
			// set values based on UI interaction
			case "set-table-style":
				el = $(event.target);
				event.el.find(".active").removeClass("active");
				el.addClass("active");
				
				// Table.prop({ className: `xl-table ${el.data("arg")}` });
				Table.removeClass("gray-table-1 blue-table-1 green-table-1 blue-table-2 orange-table-1 white-table-1")
					.addClass(el.data("arg"));
				break;
			case "set-table-col-head":
				// head row columns
				from = Table.find(".tbl-body > div:nth-child(1) table");
				to = Table.find(".tbl-col-head > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-rows-to", from, to });
				// body row columns
				from = Table.find(".tbl-body > div:nth-child(2) table");
				to = Table.find(".tbl-col-head > div:nth-child(2) table");
				Self.dispatch({ ...event, type: "move-rows-to", from, to });
				break;
			case "set-table-row-head":
				// head row(s)
				from = Table.find(".tbl-col-head > div:nth-child(2) table");
				to = Table.find(".tbl-col-head > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-column-to", from, to });
				// body row(s)
				from = Table.find(".tbl-body > div:nth-child(2) table");
				to = Table.find(".tbl-body > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-column-to", from, to });
				// foot row(s)
				from = Table.find(".tbl-col-foot > div:nth-child(2) table");
				to = Table.find(".tbl-col-foot > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-column-to", from, to });
				// sync tools table
				APP.tools.table.dispatch({ type: "sync-table-tools", table: Table });
				break;
			case "set-table-col-foot":
				// foot row columns
				from = Table.find(".tbl-body > div:nth-child(1) table");
				to = Table.find(".tbl-col-foot > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-rows-to", from, to });
				// body row columns
				from = Table.find(".tbl-body > div:nth-child(2) table");
				to = Table.find(".tbl-col-foot > div:nth-child(2) table");
				Self.dispatch({ ...event, type: "move-rows-to", from, to });
				break;
			case "set-alt-row-bg":
				value = event.el.is(":checked");
				Table[ value ? "addClass" : "removeClass" ]("alt-row-bg");
				break;
			case "set-alt-row-color":
				Table.css({ "--alt-row-color": event.value });
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
				// toggle table title
				if (event.el.is(":checked")) Table.prepend(`<div class="table-title">Title</div>`);
				else Table.find(".table-title").remove();
				// sync tools table
				APP.tools.table.dispatch({ type: "sync-table-tools", table: Table });
				// sync tools selection indicators
				APP.tools.table.dispatch({ type: "select-coords", ...APP.tools.table.grid.selected });
				// re-sync selection box
				APP.tools.table.dispatch({ type: "re-sync-selection" });
				break;
			case "toggle-table-caption":
				// toggle table caption
				if (event.el.is(":checked")) Table.append(`<div class="table-caption">Caption</div>`);
				else Table.find(".table-caption").remove();
				break;
			case "toggle-table-clip":
				// toggle table clipping
				if (event.el.is(":checked")) {
					Els.el.find(".table-clipping").addClass("expand");
					Table.addClass("clipped");
				} else {
					Els.el.find(".table-clipping").removeClass("expand");
					Table.removeClass("clipped");
					// update sidebar
					el = Els.el.find(`.table-clipping button[arg="width"]`);
					Self.dispatch({ type: "fit-table-clip", arg: "width", target: el });
					el = Els.el.find(`.table-clipping button[arg="height"]`);
					Self.dispatch({ type: "fit-table-clip", arg: "width", target: el });
					// reset dimensions
					Table.find(".tbl-root").css({ width: "", height: "" });
				}
				// re-sync table tools
				APP.tools.table.dispatch({ type: "sync-table-tools" });
				break;
			case "fit-table-clip":
				// disable button
				el = $(event.target);
				el.attr({ disabled: true });
				arg = el.attr("arg");

				value = {};
				value[arg] = APP.tools.table.grid[arg];
				Table.find(".tbl-root").css(value);
				
				value[arg] = Table.prop(arg === "width" ? "offsetWidth" : "offsetHeight");
				APP.tools.table.els.root.css(value);
				break;
			case "set-table-outline-style":
				value = event.arg;
				Table.css({ "--border-style": value });
				break;
			case "set-table-outline-color":
				value = event.value;
				Table.css({ "--border-color": value });
				break;
			case "set-table-outline-width":
				value = event.value +"px";
				Table.css({ "--border-width": value });
				break;
			case "toggle-table-title-outline":
				// toggle title outline
				if (event.el.is(":checked")) Table.find(".table-title").addClass("title-outline");
				else Table.find(".table-title").removeClass("title-outline");
				break;
			case "set-gridlines":
				el = $(event.target);
				value = el.hasClass("active_");
				Table = event.table || APP.tools.table.table.el;
				// toggle button and table UI
				el[ value ? "removeClass" : "addClass" ]("active_");
				Table[ value ? "addClass" : "removeClass" ]( Self.glHash[el.data("name")] );
				break;
		}
	}
}
