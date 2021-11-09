
function make_json_row(sheet, r, R, cols, header, hdr, dense, o) {
	var rr = encode_row(R),
		defval = o.defval,
		raw = o.raw || !Object.prototype.hasOwnProperty.call(o, "raw"),
		isempty = true,
		row = (header === 1) ? [] : {};
	
	if (header !== 1) {
		if (Object.defineProperty) {
			try {
				Object.defineProperty(row, "__rowNum__", { value: R, enumerable: false });
			} catch(e) {
				row.__rowNum__ = R;
			}
		} else {
			row.__rowNum__ = R;
		}
	}
	if (!dense || sheet[R]) {
		for (var C=r.s.c; C<=r.e.c; ++C) {
			var val = dense ? sheet[R][C] : sheet[cols[C] + rr];
			if (val === undefined || val.t === undefined) {
				if (defval === undefined) continue;
				if (hdr[C] != null) row[hdr[C]] = defval;
				continue;
			}
			var v = val.v;
			switch (val.t){
				case "z": if (v == null) break; continue;
				case "e": v = void 0; break;
				case "s":
				case "d":
				case "b":
				case "n": break;
				default:
					throw new Error(`unrecognized type ${val.t}`);
			}
			if (hdr[C] != null) {
				if (v == null) {
					if (defval !== undefined) row[hdr[C]] = defval;
					else if (raw && v === null) row[hdr[C]] = null;
					else continue;
				} else {
					row[hdr[C]] = raw || (o.rawNumbers && val.t == "n") ? v : format_cell(val, v, o);
				}
				if (v != null) isempty = false;
			}
		}
	}
	return { row, isempty };
}


function sheet_to_json(sheet, opts) {
	if (sheet == null || sheet["!ref"] == null) return [];
	var val = { t: "n", v: 0 },
		header = 0,
		offset = 1,
		hdr = [],
		v = 0,
		vv = "",
		r = {
			s: { r: 0, c: 0},
			e: { r: 0, c: 0 }
		},
		o = opts || {},
		range = o.range != null ? o.range : sheet["!ref"];

	if (o.header === 1) header = 1;
	else if (o.header === "A") header = 2;
	else if (Array.isArray(o.header)) header = 3;
	else if (o.header == null) header = 0;
	
	switch (typeof range) {
		case "string":
			r = safe_decode_range(range);
			break;
		case "number":
			r = safe_decode_range(sheet["!ref"]);
			r.s.r = range;
			break;
		default:
			r = range;
	}
	
	if (header > 0) offset = 0;
	
	var rr = encode_row(r.s.r),
		cols = [],
		out = [],
		outi = 0, counter = 0,
		dense = Array.isArray(sheet),
		R = r.s.r,
		C = 0,
		CC = 0;
	
	if (dense && !sheet[R]) sheet[R] = [];
	
	for(C = r.s.c; C <= r.e.c; ++C) {
		cols[C] = encode_col(C);
		val = dense ? sheet[R][C] : sheet[cols[C] + rr];
		switch (header) {
			case 1: hdr[C] = C - r.s.c; break;
			case 2: hdr[C] = cols[C]; break;
			case 3: hdr[C] = o.header[C - r.s.c]; break;
			default:
				if (val == null) val = { w: "__EMPTY", t: "s" };
				vv = v = format_cell(val, null, o);
				counter = 0;
				for(CC = 0; CC < hdr.length; ++CC) {
					if (hdr[CC] == vv) {
						vv = v + "_" + (++counter);
					}
				}
				hdr[C] = vv;
		}
	}
	for (R = r.s.r + offset; R <= r.e.r; ++R) {
		var row = make_json_row(sheet, r, R, cols, header, hdr, dense, o);
		if ((row.isempty === false) || (header === 1 ? o.blankrows !== false : !!o.blankrows)) out[outi++] = row.row;
	}
	out.length = outi;
	return out;
}

var qreg = /"/g;

function make_csv_row(sheet, r, R, cols, fs, rs, FS, o) {
	var isempty = true,
		row = [],
		txt = "",
		rr = encode_row(R);
	for(var C=r.s.c; C<=r.e.c; ++C) {
		if (!cols[C]) continue;
		var val = o.dense ? (sheet[R] || [])[C]: sheet[cols[C] + rr];
		if (val == null) txt = "";
		else if (val.v != null) {
			isempty = false;
			txt = ""+ (o.rawNumbers && val.t == "n" ? val.v : format_cell(val, null, o));
			for(var i=0, cc=0; i!==txt.length; ++i) {
				if ((cc = txt.charCodeAt(i)) === fs || cc === rs || cc === 34 || o.forceQuotes) {
					txt = "\""+ txt.replace(qreg, '""') +"\"";
					break;
				}
			}
			if (txt == "ID") txt = '"ID"';
		} else if (val.f != null && !val.F) {
			isempty = false;
			txt = "=" + val.f;
			if (txt.indexOf(",") >= 0) txt = '"'+ txt.replace(qreg, '""') +'"';
		} else {
			txt = "";
		}
		/* NOTE: Excel CSV does not support array formulae */
		row.push(txt);
	}
	if (o.blankrows === false && isempty) {
		return null;
	}
	return row.join(FS);
}

function sheet_to_csv(sheet, opts) {
	var out = [],
		o = opts == null ? {} : opts;
	if (sheet == null || sheet["!ref"] == null) return "";
	
	var r = safe_decode_range(sheet["!ref"]),
		FS = o.FS !== undefined ? o.FS : ",", fs = FS.charCodeAt(0),
		RS = o.RS !== undefined ? o.RS : "\n", rs = RS.charCodeAt(0),
		endregex = new RegExp((FS=="|" ? "\\|" : FS) +"+$"),
		row = "",
		cols = [];
	o.dense = Array.isArray(sheet);
	var colinfo = o.skipHidden && sheet["!cols"] || [],
		rowinfo = o.skipHidden && sheet["!rows"] || [];
	for(var C = r.s.c; C <= r.e.c; ++C) {
		if (!((colinfo[C] || {}).hidden)) {
			cols[C] = encode_col(C);
		}
	}
	for(var R=r.s.r; R<=r.e.r; ++R) {
		if ((rowinfo[R] || {}).hidden) continue;
		row = make_csv_row(sheet, r, R, cols, fs, rs, FS, o);
		if (row == null) continue;
		if (o.strip) row = row.replace(endregex, "");
		out.push(row + RS);
	}
	delete o.dense;
	return out.join("");
}

function sheet_to_txt(sheet, opts) {
	if (!opts) opts = {};
	opts.FS = "\t";
	opts.RS = "\n";
	var s = sheet_to_csv(sheet, opts);
	if (typeof cptable == "undefined" || opts.type == "string") return s;
	var o = cptable.utils.encode(1200, s, "str");
	return String.fromCharCode(255) + String.fromCharCode(254) + o;
}

function sheet_to_formulae(sheet) {
	var y = "",
		x,
		val="";
	if (sheet == null || sheet["!ref"] == null) return [];
	var r = safe_decode_range(sheet['!ref']),
		rr = "",
		cols = [],
		C,
		cmds = [],
		dense = Array.isArray(sheet);
	for(C=r.s.c; C<=r.e.c; ++C) {
		cols[C] = encode_col(C);
	}
	for(var R=r.s.r; R<=r.e.r; ++R) {
		rr = encode_row(R);
		for(C=r.s.c; C<=r.e.c; ++C) {
			y = cols[C] + rr;
			x = dense ? (sheet[R] || [])[C] : sheet[y];
			val = "";
			if (x === undefined) continue;
			else if (x.F != null) {
				y = x.F;
				if (!x.f) continue;
				val = x.f;
				if (y.indexOf(":") == -1) {
					y = y +":"+ y;
				}
			}
			if (x.f != null) val = x.f;
			else if (x.t == "z") continue;
			else if (x.t == "n" && x.v != null) val = ""+ x.v;
			else if (x.t == "b") val = x.v ? "TRUE" : "FALSE";
			else if (x.w !== undefined) val = "'"+ x.w;
			else if (x.v === undefined) continue;
			else if (x.t == "s") val = "'"+ x.v;
			else val = ""+ x.v;
			cmds[cmds.length] = y + "="+ val;
		}
	}
	return cmds;
}

function sheet_add_json(_ws, js, opts) {
	var o = opts || {},
		offset = +!o.skipHeader,
		ws = _ws || {},
		_R = 0,
		_C = 0;
	if (ws && o.origin != null) {
		if (typeof o.origin == "number") _R = o.origin;
		else {
			var _origin = typeof o.origin == "string" ? decode_cell(o.origin) : o.origin;
			_R = _origin.r;
			_C = _origin.c;
		}
	}
	var cell,
		range = {
			s: { c: 0, r: 0 },
			e: { c: _C, r: _R + js.length - 1 + offset }
		};
	if (ws["!ref"]) {
		var _range = safe_decode_range(ws["!ref"]);
		range.e.c = Math.max(range.e.c, _range.e.c);
		range.e.r = Math.max(range.e.r, _range.e.r);
		if (_R == -1) {
			_R = _range.e.r + 1;
			range.e.r = _R + js.length - 1 + offset;
		}
	} else {
		if (_R == -1) {
			_R = 0;
			range.e.r = js.length - 1 + offset;
		}
	}
	var hdr = o.header || [],
		C = 0;

	js.forEach(function(JS, R) {
		keys(JS).forEach(function(k) {
			if ((C=hdr.indexOf(k)) == -1) hdr[C=hdr.length] = k;
			var v = JS[k],
				t = "z",
				z = "",
				ref = encode_cell({ c: _C + C, r: _R + R + offset });
			cell = utils.sheet_get_cell(ws, ref);

			if (v && typeof v === "object" && !(v instanceof Date)) {
				ws[ref] = v;
			} else {
				if (typeof v == "number") t = "n";
				else if (typeof v == "boolean") t = "b";
				else if (typeof v == "string") t = "s";
				else if (v instanceof Date) {
					t = "d";
					if (!o.cellDates) { t = 'n'; v = datenum(v); }
					z = (o.dateNF || SSF._table[14]);
				}
				if (!cell) ws[ref] = cell = { t, v };
				else {
					cell.t = t;
					cell.v = v;
					delete cell.w;
					delete cell.R;
					if (z) cell.z = z;
				}
				if (z) cell.z = z;
			}
		});
	});

	range.e.c = Math.max(range.e.c, _C + hdr.length - 1);
	var __R = encode_row(_R);
	if (offset) {
		for (C=0; C<hdr.length; ++C) {
			ws[encode_col(C + _C) + __R] = { t: "s", v: hdr[C] };
		}
	}
	ws["!ref"] = encode_range(range);
	return ws;
}

function json_to_sheet(js, opts) {
	return sheet_add_json(null, js, opts);
}

var utils = {
	encode_col,
	encode_row,
	encode_cell,
	encode_range,
	decode_col,
	decode_row,
	split_cell,
	decode_cell,
	decode_range,
	format_cell,
	sheet_add_aoa,
	sheet_add_json,
	sheet_add_dom,
	aoa_to_sheet,
	json_to_sheet,
	table_to_book,
	sheet_to_csv,
	sheet_to_txt,
	sheet_to_json,
	sheet_to_formulae,
	get_formulae: sheet_to_formulae,
	parse_formula: parseFormula,
	make_csv: sheet_to_csv,
	make_json: sheet_to_json,
	make_formulae: sheet_to_formulae,
	table_to_sheet: parse_dom_table,
	book_to_xml: HTML_.book_to_xml,
	sheet_to_row_object_array: sheet_to_json
};

