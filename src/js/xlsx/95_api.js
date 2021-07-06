
(function(utils) {

	function add_consts(R) {
		R.forEach(a => { utils.consts[a[0]] = a[1] });
	}

	function get_default(x, y, z) {
		return x[y] != null ? x[y] : (x[y] = z);
	}

	/* get cell, creating a stub if necessary */
	function ws_get_cell_stub(ws, R, C) {
		/* A1 cell address */
		if (typeof R == "string") {
			/* dense */
			if (Array.isArray(ws)) {
				var RC = decode_cell(R);
				if (!ws[RC.r]) ws[RC.r] = [];
				return ws[RC.r][RC.c] || (ws[RC.r][RC.c] = { t: "z" });
			}
			return ws[R] || (ws[R] = { t: "z" });
		}
		/* cell address object */
		if (typeof R != "number") {
			return ws_get_cell_stub(ws, encode_cell(R));
		}
		/* R and C are 0-based indices */
		return ws_get_cell_stub(ws, encode_cell({ r: R, c: C || 0 }));
	}

	/* find sheet index for given name / validate index */
	function wb_sheet_idx(wb, sh) {
		if (typeof sh == "number") {
			if (sh >= 0 && wb.SheetNames.length > sh) return sh;
			throw new Error(`Cannot find sheet # ${sh}`);
		} else if (typeof sh == "string") {
			var idx = wb.SheetNames.indexOf(sh);
			if (idx > -1) return idx;
			throw new Error(`Cannot find sheet name |${sh}|`);
		} else {
			throw new Error(`Cannot find sheet |${sh}|`);
		}
	}

	utils.consts = utils.consts || {};
	utils.sheet_get_cell = ws_get_cell_stub;

	/* simple blank workbook object */
	utils.book_new = () => ({ SheetNames: [], Sheets: {} });

	/* add a worksheet to the end of a given workbook */
	utils.book_append_sheet = function(wb, ws, name) {
		if (!name) {
			for (var i=1; i<=0xFFFF; ++i, name=undefined) {
				if (wb.SheetNames.indexOf(name = "Sheet"+ i) == -1) break;
			}
		}
		if (!name || wb.SheetNames.length >= 0xFFFF) {
			throw new Error("Too many worksheets");
		}
		check_ws_name(name);
		if (wb.SheetNames.indexOf(name) >= 0) {
			throw new Error(`Worksheet with name |${name}| already exists!`);
		}
		wb.SheetNames.push(name);
		wb.Sheets[name] = ws;
	};

	/* set sheet visibility (visible/hidden/very hidden) */
	utils.book_set_sheet_visibility = function(wb, sh, vis) {
		get_default(wb,"Workbook", {});
		get_default(wb.Workbook, "Sheets", []);

		var idx = wb_sheet_idx(wb, sh);
		// $FlowIgnore
		get_default(wb.Workbook.Sheets,idx, {});

		switch(vis) {
			case 0:
			case 1:
			case 2: break;
			default:
				throw new Error(`Bad sheet visibility setting ${vis}`);
		}
		// $FlowIgnore
		wb.Workbook.Sheets[idx].Hidden = vis;
	};

	add_consts([
		["SHEET_VISIBLE", 0],
		["SHEET_HIDDEN", 1],
		["SHEET_VERY_HIDDEN", 2]
	]);

	/* set number format */
	utils.cell_set_number_format = function(cell, fmt) {
		cell.z = fmt;
		return cell;
	};

	/* set cell hyperlink */
	utils.cell_set_hyperlink = function(cell, target, tooltip) {
		if (!target) {
			delete cell.l;
		} else {
			cell.l = { Target: target };
			if (tooltip) cell.l.Tooltip = tooltip;
		}
		return cell;
	};

	utils.cell_set_internal_link = function(cell, range, tooltip) {
		return utils.cell_set_hyperlink(cell, "#"+ range, tooltip);
	};

	/* add to cell comments */
	utils.cell_add_comment = function(cell, text, author) {
		if (!cell.c) cell.c = [];
		cell.c.push({ t: text, a: author || "SheetJS" });
	};

	/* set array formula and flush related cells */
	utils.sheet_set_array_formula = function(ws, range, formula) {
		var rng = typeof range != "string" ? range : safe_decode_range(range),
			rngstr = typeof range == "string" ? range : encode_range(range);
		for (var R=rng.s.r; R<= rng.e.r; ++R) {
			for (var C=rng.s.c; C<=rng.e.c; ++C) {
				var cell = ws_get_cell_stub(ws, R, C);
				cell.t = "n";
				cell.F = rngstr;
				delete cell.v;
				if (R == rng.s.r && C == rng.s.c) cell.f = formula;
			}
		}
		return ws;
	};

	return utils;

})(utils);
