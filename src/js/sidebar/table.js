
// eniac.sidebar.table

{
	init(parent) {
		// fast reference
		this.parent = parent;

		// temp
		// setTimeout(() => {
		// 	parent.els.el.find(".sidebar-table .sidebar-head span:nth(2)").trigger("click");
		// }, 200);

		// setTimeout(() => {
		// 	// parent.els.el.find(".sidebar-table input#table-clip").trigger("click");
		// 	eniac.tools.table.table.select({
		// 		anchor: { y: 2, x: 1 },
		// 		yNum: [2,3,4],
		// 		xNum: [1,2],
		// 	});

		// 	let pEl = eniac.sidebar.els.el.find(`.borders`);
		// 	pEl.find(".active, .disabled").removeClass("active disabled");
		// 	pEl.find(`> span[data-arg="middle"]`).addClass("active");

		// 	// this.dispatch({ type: "apply-cell-border" });
		// 	this.dispatch({ type: "cell-border-style-preset", arg: "preset-8" });
		// }, 300);

		// setTimeout(() => {
		// 	this.dispatch({ type: "cell-border-style-preset", arg: "preset-8" });
		// }, 300);
	},
	glHash: {
		"h-gridlines": "hide-hg-lines",
		"v-gridlines": "hide-vg-lines",
		"hg-header":   "hide-hgh-lines",
		"vg-body":     "hide-vgb-lines",
		"vg-footer":   "hide-vgf-lines",
	},
	borderPresets: {
		"preset-1": "1px solid #000000",
		"preset-2": "1px solid #ff0000",
		"preset-3": "1px solid #0000ff",
		"preset-4": "2px solid #000000",
		"preset-5": "2px solid #ff0000",
		"preset-6": "2px solid #0000ff",
		"preset-7": "2px dashed #229922",
		"preset-8": "2px dotted #ff9900",
		"default":  "1px solid transparent",
		"none":     "0px none transparent",
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar.table,
			Tools = APP.tools,
			Els = APP.sidebar.els,
			Table = Tools.table,
			Anchor = Table.table.selected ? Table.table.selected.anchor.el : false,
			TblEl = event.table || Table.table._el,
			xNum, yNum,
			layout,
			value,
			index,
			arg,
			allEl,
			pEl,
			el;
		switch (event.type) {
			case "enter-edit-mode":
				Self.edit = new Edit({ el: Els.el });
				break;
			case "exit-edit-mode":
				Self.edit = false;
				break;
			case "content-cursor-state":
				console.log(event);
				break;
			case "populate-table-values":
				// tab: Table
				Self.dispatch({ ...event, type: "update-table-style" });
				Self.dispatch({ ...event, type: "update-table-title-caption" });
				Self.dispatch({ ...event, type: "update-table-head-footer-rows" });
				Self.dispatch({ ...event, type: "update-table-row-col" });
				Self.dispatch({ ...event, type: "update-table-outlines" });
				Self.dispatch({ ...event, type: "update-gridlines" });
				Self.dispatch({ ...event, type: "update-alt-row-bg" });
				if (Anchor) {
					// tab: Cell
					Self.dispatch({ ...event, type: "update-cell-data-format" });
					Self.dispatch({ ...event, type: "update-cell-fill-color" });
					// tab: Text
					Self.dispatch({ ...event, type: "update-cell-font" });
					Self.dispatch({ ...event, type: "update-cell-color" });
					Self.dispatch({ ...event, type: "update-cell-alignment" });
					Self.dispatch({ ...event, type: "update-cell-wrap" });
					Self.dispatch({ ...event, type: "update-cell-line-height" });
				}
				// tab: Arrange
				Self.dispatch({ ...event, type: "update-table-arrange" });
				Self.dispatch({ ...event, type: "update-table-box-size" });
				Self.dispatch({ ...event, type: "update-table-box-position" });
				break;
			// tab: Table
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
			case "update-table-title-caption":
				// checkbox values
				value = TblEl.find(".tbl-title").length;
				Els.el.find(`input#table-title`).prop({ checked: value });
				value = TblEl.find(".tbl-caption").length;
				Els.el.find(`input#table-caption`).prop({ checked: value });
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
				// update size values
				value = Table.table.width;
				Els.el.find(`.table-box-size input[name="width"]`).val(value);
				value = Table.table.height;
				Els.el.find(`.table-box-size input[name="height"]`).val(value);
				break;
			case "update-table-outlines":
				// border style
				value = TblEl.cssProp("--tbl-border-style").trim();
				Els.el.find(".table-outline option").prop({ value });
				// border style
				value = TblEl.cssProp("--tbl-border-color").trim();
				Els.el.find(".table-outline-details .color-preset_").css({ "--preset-color": value });
				// border style
				value = parseInt(TblEl.cssProp("--tbl-border-width").trim(), 10);
				Els.el.find(".table-outline-details input").prop({ value });
				// checkbox values
				value = TblEl.find(".tbl-title").hasClass("title-outline");
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
				if (!Table.table.selected) return;
				el = Table.table.selected.anchor.el;
				pEl = Els.el.find(".table-cell-dimensions")
				pEl.find(`input[data-change="set-cell-width"]`).val(el.prop("offsetWidth"));
				pEl.find(`input[data-change="set-cell-height"]`).val(el.prop("offsetHeight"));
				break;
			// tab: Cell
			case "update-cell-data-format":
				break;
			case "update-cell-fill-color":
				// font color
				value = Color.rgbToHex(Anchor.css("background-color")).slice(0,-2);
				Els.el.find(`.color-preset_[data-change="set-cell-fill-color"]`)
					.css({ "--preset-color": value });
				break;
			case "update-cell-border-options":
				pEl = Els.el.find(".cell-border-settings");
				// border buttons
				allEl = pEl.find(`.borders[data-click="select-cell-border"] > span`);
				index = pEl.find(`.borders[data-click="select-cell-border"] > .active`).index();
				arg = ["outline", "all", "left", "right", "top", "bottom"];
				value = Table.table.selected;
				// conditional checks on selected cells
				if (value.yNum.length > 1) arg.push("middle");
				if (value.xNum.length > 1) arg.push("center");
				if (value.xNum.length > 1 && value.yNum.length > 1) arg.push("inside");
				// toggle border buttons
				allEl.map(span => $(span).toggleClass("disabled", arg.includes(span.dataset.arg)));
				if (allEl.get(index).hasClass("disabled")) index = 0;
				allEl.removeClass("active")
				allEl.get(index).addClass("active");
				
				// border style
				value = Anchor.cssProp("--border-style").split(" ");
				arg = new Set(value); // keep unique entries
				el = pEl.find("selectbox.table-cell-border").removeClass("has-prefix-icon");
				if (arg.size === 1) {
					if (value[0]) el.addClass("has-prefix-icon").val(value[0]);
					else el.val(["none", "None"]);
				} else el.val("Multiple");

				// border color
				value = Anchor.cssProp("--border-color").split(" ");
				arg = new Set(value); // keep unique entries
				el = Els.el.find(`.color-preset_[data-change="set-cell-border-color"]`).removeClass("multiple_");
				if (arg.size === 1) el.css({ "--preset-color": value[0] });
				else el.addClass("multiple_");

				// border width
				value = Anchor.cssProp("--border-width").split(" ").map(n => parseInt(n, 10));
				el = pEl.find(`input[name="cell-border-width"]`).val(Math.max(...value));
				arg = new Set(value); // keep unique entries
				if (arg.size > 1) el.parent().addClass("mixed-value");
				break;
			// tab: Text
			case "update-cell-font":
				pEl = Els.el.find(`.cell-font-options`);

				// TODO: font-family
				value = Anchor.css("font-family");
				if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1,-1);
				pEl.find(`selectbox[data-change="set-cell-font-family"]`).val(value);

				// font style
				["bold", "italic", "underline", "strikeThrough"].map(type => {
					let value = Anchor.hasClass(type);
					pEl.find(`.option-buttons_ span[data-name="${type}"]`).toggleClass("active_", !value);
				});
				value = parseInt(Anchor.css("font-size"), 10);
				pEl.find(`input[name="cell-font-size"]`).val(value);
				break;
			case "update-cell-color":
				// font color
				value = Color.rgbToHex(Anchor.css("color")).slice(0,-2);
				Els.el.find(`.color-preset_[data-change="set-cell-color"]`)
					.css({ "--preset-color": value });
				break;
			case "update-cell-alignment":
				pEl = Els.el.find(`.cell-hv-alignment`);
				// reset all options
				pEl.find(".active_").removeClass("active_");
				// iterate cell class names
				value = Anchor.prop("className").split(" ");
				if (["start", "left"].includes(Anchor.css("text-align"))) {
					// if default "text align left"
					value.push("left");
				}
				value.map(name =>
					pEl.find(`[data-click="set-cell-hAlign"] span[data-name="${name}"]`).addClass("active_"));
				value.map(name =>
					pEl.find(`[data-click="set-cell-vAlign"] span[data-name="${name}"]`).addClass("active_"));
				break;
			case "update-cell-wrap":
				value = Anchor.hasClass("wrap");
				Els.el.find(`.cell-font-options input#cell-text-wrap`).prop({ checked: value });
				break;
			case "update-cell-line-height":
				// translate to decimal value
				value = {
					fS: parseInt(Anchor.css("font-size"), 10),
					lH: parseInt(Anchor.css("line-height"), 10),
				};
				value.v = (value.lH / value.fS).toFixed(1).toString();
				Els.el.find(`selectbox[data-menu="cell-line-height"]`).val(value.v);
				break;
			// tab: Arrange
			case "update-table-arrange":
				pEl = Els.el.find(`.flex-row[data-click="set-table-arrange"]`);
				// disable all options if single element
				allEl = APP.body.find(Guides.selector);
				pEl.find(".option-buttons_ span").toggleClass("disabled_", allEl.length !== 1);

				// disable "back" + "backward" option, if active element is already in the back
				value = +TblEl.css("z-index");
				pEl.find(".option-buttons_:nth(0) > span:nth(0)").toggleClass("disabled_", value !== 1);
				pEl.find(".option-buttons_:nth(1) > span:nth(0)").toggleClass("disabled_", value !== 1);
				// disable "front" + "forward" option, if active element is already in front
				pEl.find(".option-buttons_:nth(0) > span:nth(1)").toggleClass("disabled_", value !== allEl.length);
				pEl.find(".option-buttons_:nth(1) > span:nth(1)").toggleClass("disabled_", value !== allEl.length);
				break;
			case "update-table-box-size":
				value = TblEl.prop("offsetWidth");
				Els.el.find(`.table-box-size input[name="width"]`).val(value);
				value = TblEl.prop("offsetHeight");
				Els.el.find(`.table-box-size input[name="height"]`).val(value);
				value = TblEl.hasClass("clipped");
				Els.el.find(`.table-box-size input#table-clip`).prop({ checked: value });
				break;
			case "update-table-box-position":
				value = TblEl.prop("offsetLeft");
				Els.el.find(`.table-box-position input[name="x"]`).val(value);
				value = TblEl.prop("offsetTop");
				Els.el.find(`.table-box-position input[name="y"]`).val(value);
				break;
			case "toggle-table-clip":
				// toggle table clipping
				if (event.el.is(":checked")) {
					TblEl.addClass("clipped");
					// enable input fields
					Els.el.find(`.table-box-size input[name="width"]`)
						.attr({ max: Table.table.width })
						.removeAttr("disabled");
					Els.el.find(`.table-box-size input[name="height"]`)
						.attr({ max: Table.table.height })
						.removeAttr("disabled");
				} else {
					TblEl.removeClass("clipped");
					// reset dimensions
					TblEl.find(".tbl-root").css({ width: "", height: "" });
					// dinable input fields
					Els.el.find(`.table-box-size input[type="number"]`).attr({ disabled: true });
				}
				// re-sync table tools
				Table.dispatch({ type: "sync-table-tools" });
				// remove selection
				Table.table.unselect();
				break;
			/*
			 * set values based on UI interaction
			 */
			// tab: Table
			case "set-table-style":
				el = $(event.target);
				event.el.find(".active").removeClass("active");
				el.addClass("active");
				
				// TblEl.prop({ className: `xl-table ${el.data("arg")}` });
				TblEl.removeClass("gray-table-1 blue-table-1 green-table-1 blue-table-2 orange-table-1 white-table-1")
					.addClass(el.data("arg"));
				break;
			case "set-table-col-head":
				// alter table
				Table.table.alter({ type: "col-head", num: +event.arg });
				break;
			case "set-table-row-head":
				// alter table
				Table.table.alter({ type: "row-head", num: +event.arg });
				break;
			case "set-table-col-foot":
				// alter table
				Table.table.alter({ type: "col-foot", num: +event.arg });
				break;
			case "set-alt-row-bg":
				value = event.el.is(":checked");
				TblEl[ value ? "addClass" : "removeClass" ]("alt-row-bg");
				break;
			case "set-alt-row-color":
				TblEl.css({ "--alt-row-color": event.value });
				break;
			case "toggle-table-title":
				// toggle table title
				if (event.el.is(":checked")) TblEl.prepend(`<div class="tbl-title"><span>Title</span></div>`);
				else TblEl.find(".tbl-title").remove();
				// sync tools table
				Table.dispatch({ type: "sync-table-tools", table: TblEl });
				// sync tools selection indicators
				Table.dispatch({ type: "select-coords", ...Table.table.selected });
				break;
			case "toggle-table-caption":
				// toggle table caption
				if (event.el.is(":checked")) TblEl.append(`<div class="table-caption"><span>Caption</span></div>`);
				else TblEl.find(".table-caption").remove();
				break;
			case "set-table-font-size":
				console.log(event);
				break;
			case "set-table-rows-num":
				arg = +event.value;
				layout = Table.table.layout;
				value = layout.rows.head + layout.rows.body + layout.rows.foot;
				// course of action
				if (arg > value) Table.table.addRow();
				else if (arg < value) Table.table.removeRow();
				break;
			case "set-table-cols-num":
				arg = +event.value;
				layout = Table.table.layout;
				value = layout.cols.head + layout.cols.body;
				// course of action
				if (arg > value) Table.table.addCol();
				else if (arg < value) Table.table.removeCol();
				break;
			case "set-cell-width":
				el = Table.table.selected.anchor.el;
				[yNum, xNum] = Table.table.getCoord(el[0]);
				// update column width
				Table.table.getCoordCol(xNum).css({ width: +event.value });
				// sync table tools / selection
				Table.dispatch({ type: "sync-table-tools" });
				Table.dispatch({ type: "re-sync-selection" });
				break;
			case "set-cell-height":
				el = Table.table.selected.anchor.el;
				[yNum, xNum] = Table.table.getCoord(el[0]);
				// update row height
				Table.table.getCoordRow(yNum).css({ height: +event.value });
				// sync table tools / selection
				Table.dispatch({ type: "sync-table-tools" });
				Table.dispatch({ type: "re-sync-selection" });
				break;
			case "fit-table-cell":
				console.log(event);
				break;
			case "set-table-outline-style":
				value = event.arg;
				TblEl.css({ "--tbl-border-style": value });
				break;
			case "set-table-outline-color":
				value = event.value;
				TblEl.css({ "--tbl-border-color": value });
				break;
			case "set-table-outline-width":
				value = event.value +"px";
				TblEl.css({ "--tbl-border-width": value });
				break;
			case "toggle-table-title-outline":
				// toggle title outline
				if (event.el.is(":checked")) TblEl.find(".tbl-title").addClass("tbl-outline");
				else TblEl.find(".tbl-title").removeClass("tbl-outline");
				break;
			case "set-gridlines":
				el = $(event.target);
				value = el.hasClass("active_");
				TblEl = event.table || Table.table._el;
				// toggle button and table UI
				el[ value ? "removeClass" : "addClass" ]("active_");
				TblEl[ value ? "addClass" : "removeClass" ]( Self.glHash[el.data("name")] );
				break;
			// tab: Cell
			case "set-cell-fill-color":
				Anchor.css({ "background": event.value });
				// sidebar font color preset
				Els.el.find(`.color-preset_[data-change="set-cell-fill-color"]`)
					.css({ "--preset-color": event.value });
				break;
			case "cell-border-style-preset":
				pEl = Els.el.find(".cell-border-settings");
				value = Self.borderPresets[event.arg];
				
				let [bW, bS, bC] = value.split(" ");
				el = pEl.find(`input[name="cell-border-width"]`).val(parseInt(bW, 10));
				pEl.find(`selectbox.table-cell-border`).val(bS);
				pEl.find(`.color-preset_[data-click="popup-color-palette-1"]`).css({ "--preset-color": bC });
				// trigger change on element
				el.trigger("change");
				return false;
			case "select-cell-border":
				// reset border buttons
				event.el.find(".active").removeClass("active");
				// make sekected button active
				$(event.target).addClass("active");
				// refresh cell border values
				Self.dispatch({ type: "reset-cell-border-box" });
				break;
			case "set-cell-border-width":
				Els.el.find(`.cell-border-settings input[name="cell-border-width"]`)
					.parent().removeClass("mixed-value");
				// assemble & apply cell border
				Self.dispatch({ type: "apply-cell-border" });
				break;
			case "set-cell-border-style":
				// assemble & apply cell border
				Self.dispatch({ type: "apply-cell-border" });
				break;
			case "set-cell-border-color":
				// sidebar font color preset
				Els.el.find(`.color-preset_[data-change="set-cell-border-color"]`)
					.removeClass("multiple_")
					.css({ "--preset-color": event.value });
				// assemble & apply cell border
				Self.dispatch({ type: "apply-cell-border" });
				break;
			case "apply-cell-border":
				pEl = Els.el.find(".cell-border-settings");
				arg = pEl.find(`.borders[data-click="select-cell-border"] .active`).data("arg");
				value = {
					color: pEl.find(`.color-preset_[data-click="popup-color-palette-1"]`).css("--preset-color") || "transparent",
					width: pEl.find(`input[name="cell-border-width"]`).val() +"px",
					style: pEl.find(`selectbox.table-cell-border`).val() || "",
				};
				// apply values to appropriate cells
				Self.cellMatrix.apply(Table.table, arg, value);
				break;
			// tab: Text
			case "set-cell-font-family":
				value = event.xMenu.getAttribute("name");
				Anchor.css({ "font-family": value });
				break;
			case "set-cell-font-size":
				Anchor.css({ "font-size": event.value +"px" });
				break;
			case "set-cell-font-style":
				el = $(event.target);
				value = el.hasClass("active_");
				Anchor.toggleClass(el.data("name"), value);
				// update text vertical alignment
				Self.dispatch({ type: "update-cell-font" });
				break;
			case "set-cell-color":
				Anchor.css({ "color": event.value });
				// sidebar font color preset
				Els.el.find(`.color-preset_[data-change="set-cell-color"]`)
					.css({ "--preset-color": event.value });
				break;
			case "set-cell-hAlign":
				el = $(event.target);
				Anchor.removeClass("left center right justify").addClass(el.data("name"));
				// update text vertical alignment
				Self.dispatch({ type: "update-cell-alignment" });
				break;
			case "set-cell-vAlign":
				el = $(event.target);
				Anchor.removeClass("top middle bottom").addClass(el.data("name"));
				// update text vertical alignment
				Self.dispatch({ type: "update-cell-alignment" });
				break;
			case "toggle-cell-text-wrap":
				TblEl.find(".selected").toggleClass("wrap", !event.el.is(":checked"));
				// re-sync table tools
				Table.dispatch({ type: "sync-table-tools" });
				// sync tools selection indicators
				Table.dispatch({ type: "select-coords", ...Table.table.selected });
				break;
			case "set-cell-line-height":
				Anchor.css({ "line-height": event.arg });
				// re-focus on anchor
				Tools.table.dispatch({ type: "focus-cell", el: Anchor });
				break;
			// tab: Arrange
			case "set-table-arrange":
				el = $(event.target);
				value = el.data("name").split("-")[1];
				APP.sidebar.zIndexArrange(TblEl, value);
				// update arrange buttons
				Self.dispatch({ ...event, type: "update-table-arrange" });
				break;
			case "set-table-box-size":
				TblEl.find(".tbl-root").css({
					width: Els.el.find(`.table-box-size input[name="width"]`).val() +"px",
					height: Els.el.find(`.table-box-size input[name="height"]`).val() +"px",
				});
				// re-focus on element
				Tools.table.dispatch({ type: "focus-table", el: TblEl });
				break;
			case "set-table-box-position":
				TblEl.css({
					left: Els.el.find(`.table-box-position input[name="x"]`).val() +"px",
					top: Els.el.find(`.table-box-position input[name="y"]`).val() +"px",
				});
				// re-focus on element
				Tools.table.dispatch({ type: "focus-table", el: TblEl });
				break;
		}
	},
	cellMatrix: {
		keys: ["--border-color", "--border-width", "--border-style"],
		getScaffold(side) {
			let matrix = {};
			// scaffold empty matrix
			matrix[side] = {};
			this.keys.map(n => { matrix[side][n] = Array(4); });
			return matrix;
		},
		apply(Table, arg, value, c) {
			let rows = Table.rows,
				selected = Table.selected,
				scaffold = this.getScaffold(arg),
				cells = [],
				fallsThrough = false,
				n;
			// assemble cells matrix
			switch (arg) {
				case "inside":
					fallsThrough = true;
					/* falls through */
				case "center":
					cells = selected.yNum.map(y => selected.xNum.filter((n,i) => i > 0).map(x => rows[y][x])).flat();
					this.apply(Table, "left", value, cells);
					cells = selected.yNum.map(y => selected.xNum.filter((n,i) => i < selected.xNum.length-1).map(x => rows[y][x])).flat();
					this.apply(Table, "right", value, cells);
					if (!fallsThrough) return;
				case "middle":
					cells = selected.yNum.filter((n,i) => i > 0)
								.map(y => rows[y])
								.map(row => row.filter((n,i) => i >= selected.xNum[0] && i <= selected.xNum[selected.xNum.length-1]))
								.flat();
					this.apply(Table, "top", value, cells);
					cells = selected.yNum.filter((n,i) => i < selected.yNum.length-1)
								.map(y => rows[y])
								.map(row => row.filter((n,i) => i >= selected.xNum[0] && i <= selected.xNum[selected.xNum.length-1]))
								.flat();
					this.apply(Table, "bottom", value, cells);
					return;
				case "all":
					selected.xNum.map(x =>
						selected.yNum.map(y =>
							cells.push(rows[y][x])));
					this.apply(Table, "top", value, cells);
					this.apply(Table, "left", value, cells);
					this.apply(Table, "right", value, cells);
					this.apply(Table, "bottom", value, cells);
					return;
				case "outline":
					this.apply(Table, "top", value);
					this.apply(Table, "left", value);
					this.apply(Table, "right", value);
					this.apply(Table, "bottom", value);
					return;
				case "top":    n = 0; cells = c || selected.xNum.map(x => rows[selected.yNum[0]][x]); break;
				case "left":   n = 3; cells = c || selected.yNum.map(y => rows[y][selected.xNum[0]]); break;
				case "right":  n = 1; cells = c || selected.yNum.map(y => rows[y][selected.xNum[selected.xNum.length-1]]); break;
				case "bottom": n = 2; cells = c || selected.xNum.map(x => rows[selected.yNum[selected.yNum.length-1]][x]); break;
			}
			// matrix scaffold
			scaffold[arg][this.keys[0]][n] = value.color;
			scaffold[arg][this.keys[1]][n] = value.width;
			scaffold[arg][this.keys[2]][n] = value.style;
			// apply matrix to cells
			cells.map(cell => {
				let el = $(cell),
					current = {},
					applied = {};
				// prepare current values
				this.keys.map(k => current[k] = el.cssProp(k).split(" "));
				// apply new values
				this.keys.map(k => applied[k] = current[k].map((n, i) => scaffold[arg][k][i] || n).join(" "));
				// apply matrix values on cells
				el.css(applied);
			});
		}
	}
}
