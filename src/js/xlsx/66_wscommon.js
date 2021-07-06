
var strs = {}, // shared strings
	_ssfopts = {}; // spreadsheet formatting options

RELS.WS = [
		"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet",
		"http://purl.oclc.org/ooxml/officeDocument/relationships/worksheet"
	];

function get_sst_id(sst, str, rev) {
	var i = 0,
		len = sst.length;
	if (rev) {
		if (rev.has(str)) {
			var revarr = rev.get(str);
			for (; i<revarr.length; ++i) {
				if (sst[revarr[i]].t === str) {
					sst.Count ++;
					return revarr[i];
				}
			}
		}
	} else for(; i<len; ++i) {
		if (sst[i].t === str) {
			sst.Count ++;
			return i;
		}
	}
	sst[len] = { t: str };
	sst.Count ++;
	sst.Unique ++;

	if (rev) {
		if (!rev.has(str)) rev.set(str, []);
		rev.get(str).push(len);
	}

	return len;
}

function col_obj_w(C, col) {
	var p = {
		min: C + 1,
		max: C + 1
	};
	/* wch (chars), wpx (pixels) */
	var wch = -1;
	if (col.MDW) MDW = col.MDW;
	
	if (col.width != null) p.customWidth = 1;
	else if (col.wpx != null) wch = px2char(col.wpx);
	else if (col.wch != null) wch = col.wch;

	if (wch > -1) {
		p.width = char2width(wch);
		p.customWidth = 1;
	} else if (col.width != null) {
		p.width = col.width;
	}
	
	if (col.hidden) p.hidden = true;

	return p;
}

function default_margins(margins, mode) {
	if (!margins) return;
	var defs = [0.7, 0.7, 0.75, 0.75, 0.3, 0.3];
	if (mode == "xlml") defs = [1, 1, 1, 1, 0.5, 0.5];
	if (margins.left   == null) margins.left   = defs[0];
	if (margins.right  == null) margins.right  = defs[1];
	if (margins.top    == null) margins.top    = defs[2];
	if (margins.bottom == null) margins.bottom = defs[3];
	if (margins.header == null) margins.header = defs[4];
	if (margins.footer == null) margins.footer = defs[5];
}

function get_cell_styles(wb, ref) {
	var fills = wb.fills,
		fonts = wb.fonts,
		td = document.getElementById(ref),
		cellStyle = getComputedStyle(td);
	
	// cell background
	let clr = cellStyle["background-color"].match(/\d+/g).map(i => +i),
		color = rgb2Hex(clr).toLowerCase(),
		fill =  fills.find(c => c.color === color);
	if (clr[3] !== 0) {
		if (fill) fill.refs.push(ref);
		else fills.push({ color, refs: [ref] });
	}

	// cell font
	let fClr = cellStyle["color"].match(/\d+/g).map(i => +i),
		sup = cellStyle["vertical-align"] === "super" ? 1 : 0,
		sub = cellStyle["vertical-align"] === "sub" ? 1 : 0,
		bold = cellStyle["font-weight"] >= 500 ? 1 : 0,
		italic = cellStyle["font-style"] === "italic" ? 1 : 0,
		underline = cellStyle["text-decoration"].startsWith("underline") ? 1 : 0,
		strike = cellStyle["text-decoration"].startsWith("line-through") ? 1 : 0,
		fRecord = {
			family: cellStyle["font-family"],
			size: (sup || sub) ? 12 : (parseInt(cellStyle["font-size"], 10)) * (72/96),
			color: rgb2Hex(fClr).toLowerCase(),
			bold,
			italic,
			underline,
			strike,
			sup,
			sub,
		},
		font =  fonts.find(f => JSON.stringify(f.fRecord) === JSON.stringify(fRecord));

	if (font) font.refs.push(ref);
	else fonts.push({ fRecord, refs: [ref] });
}

function get_cell_style(styles, cell, opts, ref, wb) {
	var td = document.getElementById(ref),
		cellStyle = ref ? getComputedStyle(td) : {},
		numFmtId = opts.revssf[cell.z != null ? cell.z : "General"],
		i = 0x3c,
		len = styles.length,
		alignment = {},
		fillId = 0,
		fontId = 0;
	
	if (numFmtId == null && opts.ssf) {
		for (; i<0x188; ++i) {
			if (opts.ssf[i] == null) {
				SSF.load(cell.z, i);
				// $FlowIgnore
				opts.ssf[i] = cell.z;
				opts.revssf[cell.z] = numFmtId = i;
				break;
			}
		}
	}

	if (ref) {
		if (["center", "right"].includes(cellStyle["text-align"])) {
			alignment.horizontal = cellStyle["text-align"];
		}
		if (["top", "middle"].includes(cellStyle["vertical-align"])) {
			let translate = {
					top: "top",
					middle: "center",
				};
			alignment.vertical = translate[cellStyle["vertical-align"]];
		}
		wb.fills.map((f, i) => (f.refs.includes(ref)) ? fillId = i + 2 : null);
		wb.fonts.map((f, i) => (f.refs.includes(ref)) ? fontId = i + 1 : null);
	}
	
	let st = styles.find(s =>
				s.numFmtId === numFmtId &&
				s.fillId === fillId &&
				s.fontId === fontId &&
				JSON.stringify(s.alignment) === JSON.stringify(alignment));
	if (st) return styles.indexOf(st);

	// push properties to styles array
	styles[len] = {
		alignment,
		fillId,
		fontId,
		numFmtId,
		borderId: 0,
		xfId: 0,
		applyNumberFormat: 1,
	};

	return len;
}

function safe_format(p, fmtid, fillid, opts, themes, styles) {
	try {
		if (opts.cellNF) p.z = SSF._table[fmtid];
	} catch (e) {
		if (opts.WTF) throw e;
	}
	
	if (p.t === "z") return;
	if (p.t === "d" && typeof p.v === "string") p.v = parseDate(p.v);

	if (!opts || opts.cellText !== false) {
		try {
			if (SSF._table[fmtid] == null) SSF.load(SSFImplicit[fmtid] || "General", fmtid);
			if (p.t === "e") p.w = p.w || BErr[p.v];
			else if (fmtid === 0) {
				if (p.t === "n") {
					if ((p.v|0) === p.v) p.w = SSF._general_int(p.v);
					else p.w = SSF._general_num(p.v);
				} else if (p.t === "d") {
					var dd = datenum(p.v);
					if ((dd|0) === dd) p.w = SSF._general_int(dd);
					else p.w = SSF._general_num(dd);
				} else if (p.v === undefined) {
					return "";
				} else {
					p.w = SSF._general(p.v, _ssfopts);
				}
			} else if (p.t === "d") {
				p.w = SSF.format(fmtid, datenum(p.v), _ssfopts);
			} else {
				p.w = SSF.format(fmtid, p.v, _ssfopts);
			}
		} catch (e) {
			if (opts.WTF) throw e;
		}
	}
	if (!opts.cellStyles) return;

	if (fillid != null) {
		try {
			p.s = styles.Fills[fillid];
			if (p.s.fgColor && p.s.fgColor.theme && !p.s.fgColor.rgb) {
				p.s.fgColor.rgb = rgb_tint(themes.themeElements.clrScheme[p.s.fgColor.theme].rgb, p.s.fgColor.tint || 0);
				if (opts.WTF) p.s.fgColor.raw_rgb = themes.themeElements.clrScheme[p.s.fgColor.theme].rgb;
			}
			if (p.s.bgColor && p.s.bgColor.theme) {
				p.s.bgColor.rgb = rgb_tint(themes.themeElements.clrScheme[p.s.bgColor.theme].rgb, p.s.bgColor.tint || 0);
				if (opts.WTF) p.s.bgColor.raw_rgb = themes.themeElements.clrScheme[p.s.bgColor.theme].rgb;
			}
		} catch (e) {
			if (opts.WTF && styles.Fills) throw e;
		}
	}
}

function check_ws(ws, sname, i) {
	if (ws && ws["!ref"]) {
		var range = safe_decode_range(ws["!ref"]);
		if (range.e.c < range.s.c || range.e.r < range.s.r) {
			throw new Error("Bad range (" + i + "): " + ws["!ref"]);
		}
	}
}
