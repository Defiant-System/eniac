
var HTML_ = (function() {

	function html_to_sheet(str, _opts) {
		var opts = _opts || {};
		
		if (DENSE != null && opts.dense == null) opts.dense = DENSE;
		
		var ws = opts.dense ? [] : {};
		str = str.replace(/<!--.*?-->/g, "");
		var mtch = str.match(/<table/i);
		
		if (!mtch) {
			throw new Error("Invalid HTML: could not find <table>");
		}
		
		var mtch2 = str.match(/<\/table/i),
			i = mtch.index,
			il,
			j = mtch2 && mtch2.index || str.length,
			jl,
			rows = split_regex(str.slice(i, j), /(:?<tr[^>]*>)/i, "<tr>"),
			R = -1,
			C = 0,
			RS = 0,
			CS = 0,
			range = {
				s: { r: 10000000, c: 10000000 },
				e: { r: 0, c: 0 }
			},
			merges = [];
		for (i=0, il=rows.length; i<il; ++i) {
			var row = rows[i].trim(),
				hd = row.slice(0,3).toLowerCase();
			if (hd == "<tr") {
				++R;
				if (opts.sheetRows && opts.sheetRows <= R) {
					--R;
					break;
				}
				C = 0;
				continue;
			}
			if (hd != "<td" && hd != "<th") continue;

			var cells = row.split(/<\/t[dh]>/i);
			for (j=0, jl=cells.length; j<jl; ++j) {
				var cell = cells[j].trim();
				if (!cell.match(/<t[dh]/i)) continue;
				var m = cell,
					cc = 0;
				/* TODO: parse styles etc */
				while(m.charAt(0) == "<" && (cc = m.indexOf(">")) > -1) {
					m = m.slice(cc + 1);
				}
				for (var midx=0; midx<merges.length; ++midx) {
					var _merge = merges[midx];
					if (_merge.s.c == C && _merge.s.r < R && R <= _merge.e.r) {
						C = _merge.e.c + 1;
						midx = -1;
					}
				}
				var tag = parsexmltag(cell.slice(0, cell.indexOf(">")));
				CS = tag.colspan ? +tag.colspan : 1;
				if ((RS = +tag.rowspan) > 1 || CS > 1) {
					merges.push({
						s: { r: R, c: C},
						e: { r: R + (RS || 1) - 1, c: C + CS - 1}
					});
				}
				var _t = tag.t || "";
				/* TODO: generate stub cells */
				if (!m.length) {
					C += CS;
					continue;
				}
				m = htmldecode(m);
				if (range.s.r > R) range.s.r = R;
				if (range.e.r < R) range.e.r = R;
				if (range.s.c > C) range.s.c = C;
				if (range.e.c < C) range.e.c = C;
				if (!m.length) continue;
				
				var o = { t: "s", v: m };

				if (opts.raw || !m.trim().length || _t == "s") { }

				else if (m === "TRUE") o = { t: "b", v: true };
				else if (m === "FALSE") o = { t: "b", v: false };
				else if (!isNaN(fuzzynum(m))) o = { t: "n", v: fuzzynum(m) };
				else if (!isNaN(fuzzydate(m).getDate())) {
					o = { t: "d", v: parseDate(m) };
					if (!opts.cellDates) o = { t: "n", v: datenum(o.v) };
					o.z = opts.dateNF || SSF._table[14];
				}
				if (opts.dense) {
					if (!ws[R]) ws[R] = [];
					ws[R][C] = o;
				} else {
					ws[encode_cell({ r: R, c: C })] = o;
				}
				C += CS;
			}
		}
		ws["!ref"] = encode_range(range);
		if (merges.length) ws["!merges"] = merges;

		return ws;
	}

	function html_to_book(str, opts) {
		return sheet_to_workbook(html_to_sheet(str, opts), opts);
	}

	function make_html_row(ws, r, R, o) {
		var M = (ws["!merges"] || []),
			oo = [];
		for (var C=r.s.c; C<=r.e.c; ++C) {
			var RS = 0,
				CS = 0;
			for (var j=0; j<M.length; ++j) {
				if (M[j].s.r > R || M[j].s.c > C) continue;
				if (M[j].e.r < R || M[j].e.c < C) continue;
				if (M[j].s.r < R || M[j].s.c < C) { RS = -1; break; }
				RS = M[j].e.r - M[j].s.r + 1; CS = M[j].e.c - M[j].s.c + 1; break;
			}
			if (RS < 0) continue;
			var coord = encode_cell({ r: R, c: C }),
				cell = o.dense ? (ws[R] || [])[C] : ws[coord],
				/* TODO: html entities */
				w = (cell && cell.v != null) && (cell.h || escapehtml(cell.w || (format_cell(cell), cell.w) || "")) || "",
				sp = {};

			if (RS > 1) sp.rowspan = RS;
			if (CS > 1) sp.colspan = CS;
			sp.t = cell && cell.t || "z";
			if (cell && cell.f) sp.f = cell.f;
			if (o.editable) w = `<span contenteditable="true">${w}</span>`;
			sp.id = coord;
			if (sp.t != "z") {
				sp.v = cell.v;
				if (cell.z != null) sp.z = cell.z;
			}
			// temp fix
			w = w.replace(/#FF(.{6});/g, "#$1;");

			oo.push(writextag("td", w, sp));
		}
		return `<tr>${oo.join("")}</tr>`;
	}

	function make_html_preamble(ws, R, o) {
		return '<table' + (o && o.id ? ' id="' + o.id + '"' : "") + '>';
	}

	function sheet_to_html(ws, opts) {
		var o = opts || {},
			out = [],
			r = decode_range(ws["!ref"]);
		o.dense = Array.isArray(ws);
		out.push(make_html_preamble(ws, r, o));
		for (var R = r.s.r; R <= r.e.r; ++R) {
			out.push(make_html_row(ws, r, R, o));
		}
		out.push("</table>");
		return out.join("");
	}

	function sheet_to_css(ws, wb) {
		let out = [],
			coord = [];
		// translate keys to two dimensional array
		Object.keys(ws)
			.filter(k => !k.startsWith("!"))
			.map(key => {
				let [n, c, r] = key.match(/(\D+)(\d+)/);
				if (!coord[r-1]) coord[r-1] = [];
				coord[r-1].push(key);
			});
		// iterate keys
		for (let key in ws) {
			let item = ws[key];
			switch (key) {
				case "!ref": break;
				case "!rows":
					// console.log( JSON.stringify(item) );
					item.map((row, i) =>
						row.hpx > 35 ? out.push(`#${coord[i][0]} { height: ${row.hpt * (96/72)}px; }`) : null);
					break;
				case "!cols":
					// console.log( JSON.stringify(item) );
					item.map((col, i) =>
						out.push(`#${coord[0][i]} { width: ${width2px(col.width)}px; }`));
					break;
				default:
					if (!item.styleIndex) continue;

					let cellCss = [],
						style = wb.Styles.CellXf[item.styleIndex],
						fill = wb.Styles.Fills[style.fillId],
						font = wb.Styles.Fonts[style.fontId],
						numFmt = wb.Styles.NumberFmt ? wb.Styles.NumberFmt[style.numFmtId] : 0,
						border = wb.Styles.Borders[style.borderId],
						noBorder = border.width.join("") + border.style.join("") + border.color.join(""),
						hasBorders = noBorder !== "0000solidsolidsolidsolid000000000000";

					if (font.name) cellCss.push(`font-family:${font.name},sans-serif`);
					if (font.sz) cellCss.push(`font-size:${font.sz * (96/72)}px`);
					if (font.bold) cellCss.push(`font-weight:bold`);
					if (font.italic) cellCss.push(`font-style:italic`);
					if (font.underline) cellCss.push(`text-decoration:underline`);
					if (font.strike) cellCss.push(`text-decoration:line-through`);
					if (font.color) cellCss.push(`color:#${font.color.rgb}`);
					if (fill?.bgColor) cellCss.push(`background:#${fill.fgColor.rgb}`);
					if (style.alignment) {
						if (["right", "center"].includes(style.alignment.horizontal)) cellCss.push(`text-align:${style.alignment.horizontal}`);
						if (["top", "bottom"].includes(style.alignment.vertical)) cellCss.push(`vertical-align:${style.alignment.vertical}`);
						if (!style.alignment.vertical) cellCss.push(`vertical-align:bottom`);
					}
					if (font.vertAlign === "superscript") cellCss.push(`font-size:smaller;vertical-align:super;`);
					if (font.vertAlign === "subscript") cellCss.push(`font-size:smaller;vertical-align:sub;`);
					if (hasBorders) cellCss.push(`position:relative;`);
					if (cellCss.length) out.push(`#${key} { ${cellCss.join(";")} }`);

					if (hasBorders) {
						cellCss = [`content:"";position:absolute;top:-1px;left:-1px;right:-1px;bottom:-1px;`];
						cellCss.push(`border-width:${border.width.map(i => i +"px").join(" ")};`);
						cellCss.push(`border-style:${border.style.map(i => i).join(" ")};`);
						cellCss.push(`border-color:${border.color.map(i => "#"+ i).join(" ")};`);
						out.push(`#${key}:before { ${cellCss.join(";")} }`);
					}
			}
		}
		return out.join("");
	}

	function sheet_to_html_css() {
		return {
			html: sheet_to_html(...arguments),
			css: sheet_to_css(...arguments),
		}
	}

	return {
		to_workbook: html_to_book,
		to_sheet: html_to_sheet,
		_row: make_html_row,
		_preamble: make_html_preamble,
		from_sheet: sheet_to_html,
		with_css_from_sheet: sheet_to_html_css,
	};

})();

function sheet_add_dom(ws, table, _opts) {
	var opts = _opts || {};
	if (DENSE != null) opts.dense = DENSE;
	
	var or_R = 0,
		or_C = 0;

	if (opts.origin != null) {
		if (typeof opts.origin == "number") or_R = opts.origin;
		else {
			var _origin = typeof opts.origin == "string" ? decode_cell(opts.origin) : opts.origin;
			or_R = _origin.r; or_C = _origin.c;
		}
	}
	
	var rows = table.getElementsByTagName("tr"),
		sheetRows = Math.min(opts.sheetRows || 10000000, rows.length),
		range = {
			s: { r: 0, c: 0 },
			e: { r: or_R, c: or_C }
		};
	
	if (ws["!ref"]) {
		var _range = decode_range(ws["!ref"]);
		range.s.r = Math.min(range.s.r, _range.s.r);
		range.s.c = Math.min(range.s.c, _range.s.c);
		range.e.r = Math.max(range.e.r, _range.e.r);
		range.e.c = Math.max(range.e.c, _range.e.c);
		if (or_R == -1) range.e.r = or_R = _range.e.r + 1;
	}

	if (!ws["!cols"]) {
		ws["!cols"] = [...rows[0].getElementsByTagName("td")].map(td => {
			let customwidth = 1,
				wpx = td.offsetWidth + 5,
				wch = px2char(wpx),
				width = char2width(wch);
			return { width, customwidth, wpx, wch, MDW };
		});
	}
	
	if (!ws["!rows"]) {
		ws["!rows"] = [...rows].map(tr => {
			let v = tr.offsetHeight * (72/96);
			return { hpt: v, hpx: v };
		});
	}

	var merges = [],
		midx = 0,
		rowinfo = ws["!rows"] || (ws["!rows"] = []),
		_R = 0,
		R = 0,
		_C = 0,
		C = 0,
		RS = 0,
		CS = 0;
	
	for (; _R<rows.length && R<sheetRows; ++_R) {
		var row = rows[_R];
		if (is_dom_element_hidden(row)) {
			if (opts.display) continue;
			rowinfo[R] = { hidden: true };
		}
		var elts = row.children;
		for (_C = C = 0; _C < elts.length; ++_C) {
			var elt = elts[_C];
			if (opts.display && is_dom_element_hidden(elt)) continue;
			
			var v = html2xml(elt),
				z = elt.getAttribute("z");
			
			for (midx=0; midx<merges.length; ++midx) {
				var m = merges[midx];
				if (m.s.c == C + or_C && m.s.r < R + or_R && R + or_R <= m.e.r) {
					C = m.e.c + 1 - or_C;
					midx = -1;
				}
			}
			
			CS = +elt.getAttribute("colspan") || 1;
			if ((RS = (+elt.getAttribute("rowspan") || 1)) > 1 || CS > 1) {
				merges.push({
					s: {
						r: R + or_R,
						c: C + or_C
					},
					e: {
						r: R + or_R + (RS || 1) - 1,
						c: C + or_C + (CS || 1) - 1
					}
				});
			}
			var o = { t: "s", v },
				_t = elt.getAttribute("t") || "";

			if (v != null) {
				if (v.length == 0) o.t = _t || "z";
				else if (opts.raw || v.trim().length == 0 || _t == "s") {}
				else if (v === "TRUE") o = { t: "b", v: true };
				else if (v === "FALSE") o = { t: "b", v: false };
				else if (!isNaN(fuzzynum(v))) o = { t: "n", v: fuzzynum(v) };
				else if (!isNaN(fuzzydate(v).getDate())) {
					o = { t: "d", v: parseDate(v) };
					if (!opts.cellDates) o = { t: "n", v: datenum(o.v) };
					o.z = opts.dateNF || SSF._table[14];
				}
			}
			
			if (o.z === undefined && z != null) o.z = z;
			
			if (opts.dense) {
				if (!ws[R + or_R]) ws[R + or_R] = [];
				ws[R + or_R][C + or_C] = o;
			} else {
				let cellId = encode_cell({ c: C + or_C, r: R + or_R });
				ws[cellId] = o;
			}
			if (range.e.c < C + or_C) range.e.c = C + or_C;
			C += CS;
		}
		++R;
	}
	if (merges.length) {
		ws["!merges"] = (ws["!merges"] || []).concat(merges);
	}
	range.e.r = Math.max(range.e.r, R - 1 + or_R);
	ws["!ref"] = encode_range(range);
	if (R >= sheetRows) {
		// We can count the real number of rows to parse but we don't to improve the performance
		ws["!fullref"] = encode_range((range.e.r = rows.length-_R+R-1 + or_R,range));
	}
	return ws;
}

function parse_dom_table(table, _opts) {
	var opts = _opts || {},
		ws = opts.dense ? [] : {};
	return sheet_add_dom(ws, table, _opts);
}

function table_to_book(table, opts) {
	return sheet_to_workbook(parse_dom_table(table, opts), opts);
}

function is_dom_element_hidden(element) {
	var display = "",
		get_computed_style = get_get_computed_style_function(element);
	if (get_computed_style) display = get_computed_style(element).getPropertyValue("display");
	if (!display) display = element.style.display; // Fallback for cases when getComputedStyle is not available (e.g. an old browser or some Node.js environments) or doesn't work (e.g. if the element is not inserted to a document)
	return display === "none";
}

/* global getComputedStyle */
function get_get_computed_style_function(element) {
	// The proper getComputedStyle implementation is the one defined in the element window
	if (element.ownerDocument.defaultView && typeof element.ownerDocument.defaultView.getComputedStyle === "function") return element.ownerDocument.defaultView.getComputedStyle;
	// If it is not available, try to get one from the global namespace
	if (typeof getComputedStyle === "function") return getComputedStyle;
	return null;
}
