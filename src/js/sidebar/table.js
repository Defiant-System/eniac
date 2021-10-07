
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
			Table = APP.tools.table,
			TblEl = event.table || Table.table._el,
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
				Self.dispatch({ ...event, type: "update-table-cell-size" });
				break;
			case "update-table-style":
				// reset (if any) previous active
				el = Els.el.find(".table-styles");
				el.find(".active").removeClass("active");
				// table style preset
				TblEl.prop("className").split(" ").map(name => {
					let item = el.find(`span[data-arg="${name}"]`);
					if (item.length) item.addClass("active");
				});
				break;
			case "update-table-title-caption-clip":
				// checkbox values
				value = TblEl.find(".table-title").length;
				Els.el.find(`input#table-title`).prop({ checked: value });
				value = TblEl.find(".table-caption").length;
				Els.el.find(`input#table-caption`).prop({ checked: value });
				value = TblEl.hasClass("clipped");
				Els.el.find(`input#table-clip`).prop({ checked: value });
				
				pEl = Els.el.find(".table-clipping");
				pEl.toggleClass("expand", !value);
				// input fields: fit width
				value = TblEl.find(".tbl-root").prop("offsetWidth");
				pEl.find("input#table-clip-width").val(value);
				pEl.find(`button[arg="width"]`).toggleAttr("disabled", value < Table.table.width);
				// input fields: fit height
				value = TblEl.find(".tbl-root").prop("offsetHeight");
				pEl.find("input#table-clip-height").val(value);
				pEl.find(`button[arg="height"]`).toggleAttr("disabled", value < Table.table.height);
				break;
			case "update-table-head-footer-rows":
				// selectbox: table-header-rows
				value = [TblEl.find(".tbl-body > div:nth-child(1) tr:nth-child(1) td").length];
				// if (value[0] > 0) value.push("table-header-rows-freeze");
				Els.el.find(`selectbox.table-header-rows`).val(value);
				// selectbox: table-header-columns
				value = [TblEl.find(".tbl-col-head > div:nth-child(2) tr").length];
				// if (value[0] > 0) value.push("table-header-columns-freeze");
				Els.el.find(`selectbox.table-header-columns`).val(value);
				// selectbox: table-footer-rows
				value = [TblEl.find(".tbl-col-foot > div:nth-child(2) tr").length];
				// if (value[0] > 0) value.push("table-footer-rows-freeze");
				Els.el.find(`selectbox.table-footer-rows`).val(value);
				break;
			case "update-table-row-col":
				// input values
				value = Table.table.dimension.rows;
				Els.el.find(`input[name="table-rows-num"]`).val(value);
				value = Table.table.dimension.cols;
				Els.el.find(`input[name="table-cols-num"]`).val(value);
				break;
			case "update-table-outlines":
				// border style
				value = TblEl.cssProp("--border-style");
				Els.el.find(".table-outline option").prop({ value });
				// border style
				value = TblEl.cssProp("--border-color");
				Els.el.find(".table-outline-details .color-preset_").css({ "--preset-color": value });
				// border style
				value = parseInt(TblEl.cssProp("--border-width"), 10);
				Els.el.find(".table-outline-details input").prop({ value });
				// checkbox values
				value = TblEl.find(".table-title").hasClass("title-outline");
				Els.el.find(`input#outline-table-title`).prop({ checked: value });
				break;
			case "update-gridlines":
				// enable/disable gridline options
				value = Table.table._tools._cols.hasClass("has-col-head") ? "removeClass" : "addClass";
				Els.el.find(`span[data-name="hg-header"]`)[value]("disabled_");
				value = Table.table._tools._rows.hasClass("has-row-head") ? "removeClass" : "addClass";
				Els.el.find(`span[data-name="vg-body"]`)[value]("disabled_");
				value = Table.table._tools._rows.hasClass("has-row-foot") ? "removeClass" : "addClass";
				Els.el.find(`span[data-name="vg-footer"]`)[value]("disabled_");
				// iterate hash record
				for (let key in Self.glHash) {
					let hash = Self.glHash[key],
						method = TblEl.hasClass(hash) ? "removeClass" : "addClass";
					Els.el.find(`span[data-name="${key}"]`)[method]("active_");
				}
				break;
			case "update-alt-row-bg":
				// checkbox
				value = TblEl.hasClass("alt-row-bg");
				Els.el.find(`input#alternate-row-color`).prop({ checked: value });
				// color preset
				value = TblEl.cssProp("--alt-row-color");
				Els.el
					.find(".table-alt-bg-details .color-preset_")
					.css({ "--preset-color": value || "transparent" });
				break;
			case "update-table-cell-size":
				// console.log(event);
				// console.log( TblEl );
				break;
			// set values based on UI interaction
			case "set-table-style":
				el = $(event.target);
				event.el.find(".active").removeClass("active");
				el.addClass("active");
				
				// TblEl.prop({ className: `xl-table ${el.data("arg")}` });
				TblEl.removeClass("gray-table-1 blue-table-1 green-table-1 blue-table-2 orange-table-1 white-table-1")
					.addClass(el.data("arg"));
				break;
			case "set-table-col-head":
				// head row columns
				from = TblEl.find(".tbl-body > div:nth-child(1) table");
				to = TblEl.find(".tbl-col-head > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-rows-to", from, to });
				// body row columns
				from = TblEl.find(".tbl-body > div:nth-child(2) table");
				to = TblEl.find(".tbl-col-head > div:nth-child(2) table");
				Self.dispatch({ ...event, type: "move-rows-to", from, to });
				break;
			case "set-table-row-head":
				// head row(s)
				from = TblEl.find(".tbl-col-head > div:nth-child(2) table");
				to = TblEl.find(".tbl-col-head > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-column-to", from, to });
				// body row(s)
				from = TblEl.find(".tbl-body > div:nth-child(2) table");
				to = TblEl.find(".tbl-body > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-column-to", from, to });
				// foot row(s)
				from = TblEl.find(".tbl-col-foot > div:nth-child(2) table");
				to = TblEl.find(".tbl-col-foot > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-column-to", from, to });
				// sync tools table
				Table.dispatch({ type: "sync-table-tools", table: TblEl });
				break;
			case "set-table-col-foot":
				// foot row columns
				from = TblEl.find(".tbl-body > div:nth-child(1) table");
				to = TblEl.find(".tbl-col-foot > div:nth-child(1) table");
				Self.dispatch({ ...event, type: "move-rows-to", from, to });
				// body row columns
				from = TblEl.find(".tbl-body > div:nth-child(2) table");
				to = TblEl.find(".tbl-col-foot > div:nth-child(2) table");
				Self.dispatch({ ...event, type: "move-rows-to", from, to });
				break;
			case "set-alt-row-bg":
				value = event.el.is(":checked");
				TblEl[ value ? "addClass" : "removeClass" ]("alt-row-bg");
				break;
			case "set-alt-row-color":
				TblEl.css({ "--alt-row-color": event.value });
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
					[...Array(rowsCurr.length - rowNum)].map(i =>
						tblTo.prepend(tblFrom[0].lastChild));
				} else {
					if (!tblTo.length) {
						event.to.append(tblFrom[0].cloneNode(false));
						tblTo = event.to.find("tbody");
					}
					// manipulate DOM
					[...Array(rowNum - rowsCurr.length)].map(i => {
						// delete potential text-elements
						while (tblFrom[0].firstChild.nodeName !== "TR") {
							tblFrom[0].removeChild(tblFrom[0].firstChild);
						}
						tblTo.append(tblFrom[0].firstChild);
					});
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
						[...Array(colNum - colCurr.length)].map(i => {
							// delete potential text-elements
							while (tr.firstChild.nodeName !== "TD") {
								tr.removeChild(tr.firstChild);
							}
							rowsTo.get(y).append(tr.firstChild);
						}));
				}
				break; }
			case "toggle-table-title":
				// toggle table title
				if (event.el.is(":checked")) TblEl.prepend(`<div class="table-title">Title</div>`);
				else TblEl.find(".table-title").remove();
				// sync tools table
				Table.dispatch({ type: "sync-table-tools", table: TblEl });
				// sync tools selection indicators
				Table.dispatch({ type: "select-coords", ...Table.table.selected });
				break;
			case "toggle-table-caption":
				// toggle table caption
				if (event.el.is(":checked")) TblEl.append(`<div class="table-caption">Caption</div>`);
				else TblEl.find(".table-caption").remove();
				break;
			case "toggle-table-clip":
				// toggle table clipping
				if (event.el.is(":checked")) {
					Els.el.find(".table-clipping").addClass("expand");
					TblEl.addClass("clipped");
					// sync sidebar with clipped table
					Self.dispatch({ type: "update-table-title-caption-clip" });
				} else {
					Els.el.find(".table-clipping").removeClass("expand");
					TblEl.removeClass("clipped");
					// update sidebar
					el = Els.el.find(`.table-clipping button[arg="width"]`);
					Self.dispatch({ type: "fit-table-clip", arg: "width", target: el });
					el = Els.el.find(`.table-clipping button[arg="height"]`);
					Self.dispatch({ type: "fit-table-clip", arg: "height", target: el });
					// reset dimensions
					TblEl.find(".tbl-root").css({ width: "", height: "" });
				}
				// re-sync table tools
				Table.dispatch({ type: "sync-table-tools" });
				break;
			case "fit-table-clip":
				// disable button
				el = $(event.target);
				el.attr({ disabled: true });
				arg = el.attr("arg");

				value = {};
				value[arg] = Table.table[arg];
				TblEl.find(".tbl-root").css(value);
				
				value[arg] = TblEl.prop(arg === "width" ? "offsetWidth" : "offsetHeight");
				Table.els.root.css(value);
				break;
			case "set-table-font-size":
				console.log(event);
				break;
			case "set-table-rows-num":
			case "set-table-cols-num":
				console.log(event);
				break;
			case "set-table-cell-width":
			case "set-table-cell-width":
				console.log(event);
				break;
			case "set-table-outline-style":
				value = event.arg;
				TblEl.css({ "--border-style": value });
				break;
			case "set-table-outline-color":
				value = event.value;
				TblEl.css({ "--border-color": value });
				break;
			case "set-table-outline-width":
				value = event.value +"px";
				TblEl.css({ "--border-width": value });
				break;
			case "toggle-table-title-outline":
				// toggle title outline
				if (event.el.is(":checked")) TblEl.find(".table-title").addClass("title-outline");
				else TblEl.find(".table-title").removeClass("title-outline");
				break;
			case "set-gridlines":
				el = $(event.target);
				value = el.hasClass("active_");
				TblEl = event.table || Table.table._el;
				// toggle button and table UI
				el[ value ? "removeClass" : "addClass" ]("active_");
				TblEl[ value ? "addClass" : "removeClass" ]( Self.glHash[el.data("name")] );
				break;
		}
	}
}
