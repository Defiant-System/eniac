
function get_sheet_type(n) {
	if (RELS.WS.indexOf(n) > -1) return "sheet";
	if (RELS.CS && n == RELS.CS) return "chart";
	if (RELS.DS && n == RELS.DS) return "dialog";
	if (RELS.MS && n == RELS.MS) return "macro";
	return (n && n.length) ? n : "sheet";
}

function safe_parse_wbrels(wbrels, sheets) {
	if (!wbrels) return 0;
	try {
		wbrels = sheets.map(function pwbr(w) {
			if (!w.id) w.id = w.strRelID;
			return [w.name, wbrels["!id"][w.id].Target, get_sheet_type(wbrels["!id"][w.id].Type)];
		});
	} catch(e) {
		return null;
	}
	return !wbrels || wbrels.length === 0 ? null : wbrels;
}

// let hbi_zip;

function safe_parse_sheet(zip, path, relsPath, sheet, idx, sheetRels, sheets, stype, opts, wb, themes, styles) {
	// hbi_zip = zip;
	try {
		sheetRels[sheet] = parse_rels(getzipstr(zip, relsPath, true), path);
		var data = getzipdata(zip, path),
			_ws;
		switch (stype) {
			case "sheet":
				_ws = parse_ws_xml(data, opts, idx, sheetRels[sheet], wb, themes, styles);
				break;
			case "chart":
				_ws = parse_cs_xml(data, opts, idx, sheetRels[sheet], wb, themes, styles);
				if (!_ws || !_ws["!drawel"]) break;
				var dfile = resolve_path(_ws["!drawel"].Target, path),
					drelsp = get_rels_path(dfile),
					draw = parse_drawing(getzipstr(zip, dfile, true), parse_rels(getzipstr(zip, drelsp, true), dfile)),
					chartp = resolve_path(draw, dfile),
					crelsp = get_rels_path(chartp);
				_ws = parse_chart(getzipstr(zip, chartp, true), chartp, opts, parse_rels(getzipstr(zip, crelsp, true), chartp), wb, _ws);
				break;
			case "macro":
				_ws = parse_ms_xml(data, opts, idx, sheetRels[sheet], wb, themes, styles);
				break;
			case "dialog":
				_ws = parse_ds_xml(data, opts, idx, sheetRels[sheet], wb, themes, styles);
				break;
			default:
				throw new Error(`Unrecognized sheet type ${stype}`);
		}
		sheets[sheet] = _ws;

		/* scan rels for comments */
		var comments = [];
		if (sheetRels && sheetRels[sheet]) {
			keys(sheetRels[sheet]).forEach(n => {
				if (sheetRels[sheet][n].Type == RELS.CMNT) {
					var dfile = resolve_path(sheetRels[sheet][n].Target, path);
					comments = parse_comments_xml(getzipdata(zip, dfile, true), opts);
					if (!comments || !comments.length) return;
					sheet_insert_comments(_ws, comments);
				}
			});
		}
	} catch(e) {
		if (opts.WTF) throw e;
	}
}

function strip_front_slash(x) {
	return x.charAt(0) == "/" ? x.slice(1) : x;
}

function parse_zip(zip, opts) {
	make_ssf(SSF);
	opts = opts || {};
	fix_read_opts(opts);

	/* OpenDocument Part 3 Section 2.2.1 OpenDocument Package */
	if (safegetzipfile(zip, "META-INF/manifest.xml")) return parse_ods(zip, opts);
	/* UOC */
	if (safegetzipfile(zip, "objectdata.xml")) return parse_ods(zip, opts);
	/* Numbers */
	if (safegetzipfile(zip, "Index/Document.iwa")) throw new Error("Unsupported NUMBERS file");

	var entries = zipentries(zip),
		dir = parse_ct((getzipstr(zip, "[Content_Types].xml"))),
		xlsb = false,
		sheets,
		binname;
	
	if (dir.workbooks.length === 0) {
		binname = "xl/workbook.xml";
		if (getzipdata(zip,binname, true)) dir.workbooks.push(binname);
	}
	if (dir.workbooks.length === 0) {
		binname = "xl/workbook.bin";
		if (!getzipdata(zip,binname,true)) throw new Error("Could not find workbook");
		dir.workbooks.push(binname);
		xlsb = true;
	}
	if (dir.workbooks[0].slice(-3) == "bin") xlsb = true;

	var themes = {},
		styles = {};
	if (!opts.bookSheets && !opts.bookProps) {
		strs = [];
		if (dir.sst) {
			try {
				strs = parse_sst_xml(getzipdata(zip, strip_front_slash(dir.sst)), opts);
			} catch(e) {
				if (opts.WTF) throw e;
			}
		}

		if (opts.cellStyles && dir.themes.length) {
			themes = parse_theme_xml(getzipstr(zip, dir.themes[0].replace(/^\//, ""), true) || "", opts);
			// themes = parse_theme(getzipstr(zip, dir.themes[0].replace(/^\//, ''), true)||"", dir.themes[0], opts);
		}

		if (dir.style) {
			styles = parse_sty_xml(getzipdata(zip, strip_front_slash(dir.style)), themes, opts);
		}
	}

	dir.links.map(function(link) {
		try {
			var rels = parse_rels(getzipstr(zip, get_rels_path(strip_front_slash(link))), link);
			return parse_xlink(getzipdata(zip, strip_front_slash(link)), rels, link, opts);
		} catch(e) {}
	});

	var wb = parse_wb_xml(getzipdata(zip, strip_front_slash(dir.workbooks[0])), opts),
		props = {},
		propdata = "";

	if (dir.coreprops.length) {
		propdata = getzipdata(zip, strip_front_slash(dir.coreprops[0]), true);
		if (propdata) props = parse_core_props(propdata);
		if (dir.extprops.length !== 0) {
			propdata = getzipdata(zip, strip_front_slash(dir.extprops[0]), true);
			if (propdata) parse_ext_props(propdata, props, opts);
		}
	}

	var custprops = {};
	if (!opts.bookSheets || opts.bookProps) {
		if (dir.custprops.length !== 0) {
			propdata = getzipstr(zip, strip_front_slash(dir.custprops[0]), true);
			if (propdata) custprops = parse_cust_props(propdata, opts);
		}
	}

	var out = {};
	if (opts.bookSheets || opts.bookProps) {
		if (wb.Sheets) sheets = wb.Sheets.map(x => x.name);
		else if (props.Worksheets && props.SheetNames.length > 0) sheets=props.SheetNames;
		if (opts.bookProps) { out.Props = props; out.Custprops = custprops; }
		if (opts.bookSheets && typeof sheets !== "undefined") out.SheetNames = sheets;
		if (opts.bookSheets ? out.SheetNames : opts.bookProps) return out;
	}
	sheets = {};

	var deps = {};
	if (opts.bookDeps && dir.calcchain) {
		deps = parse_cc(getzipdata(zip, strip_front_slash(dir.calcchain)), dir.calcchain, opts);
	}

	var i = 0,
		sheetRels = {},
		path, relsPath,
		wbsheets = wb.Sheets;

	props.Worksheets = wbsheets.length;
	props.SheetNames = [];
	for(var j=0; j!=wbsheets.length; ++j) {
		props.SheetNames[j] = wbsheets[j].name;
	}

	var wbrelsi = dir.workbooks[0].lastIndexOf("/"),
		wbrelsfile = (dir.workbooks[0].slice(0, wbrelsi+1) +"_rels/"+ dir.workbooks[0].slice(wbrelsi + 1) +".rels").replace(/^\//, "");
	if (!safegetzipfile(zip, wbrelsfile)) wbrelsfile = "xl/_rels/workbook.xml.rels";
	var wbrels = parse_rels(getzipstr(zip, wbrelsfile, true), wbrelsfile);
	if (wbrels) wbrels = safe_parse_wbrels(wbrels, wb.Sheets);

	/* Numbers iOS hack */
	var nmode = (getzipdata(zip,"xl/worksheets/sheet.xml", true)) ? 1 : 0;
	wsloop: for(i = 0; i != props.Worksheets; ++i) {
		var stype = "sheet";
		if (wbrels && wbrels[i]) {
			path = 'xl/' + (wbrels[i][1]).replace(/[\/]?xl\//, "");
			if (!safegetzipfile(zip, path)) path = wbrels[i][1];
			if (!safegetzipfile(zip, path)) path = wbrelsfile.replace(/_rels\/.*$/,"") + wbrels[i][1];
			stype = wbrels[i][2];
		} else {
			path = "xl/worksheets/sheet"+ (i + 1 - nmode) +".xml";
			path = path.replace(/sheet0\./,"sheet.");
		}
		relsPath = path.replace(/^(.*)(\/)([^\/]*)$/, "$1/_rels/$3.rels");
		if (opts && opts.sheets != null) switch(typeof opts.sheets) {
			case "number": if (i != opts.sheets) continue wsloop; break;
			case "string": if (props.SheetNames[i].toLowerCase() != opts.sheets.toLowerCase()) continue wsloop; break;
			default: if (Array.isArray && Array.isArray(opts.sheets)) {
				var snjseen = false;
				for(var snj = 0; snj != opts.sheets.length; ++snj) {
					if (typeof opts.sheets[snj] == "number" && opts.sheets[snj] == i) snjseen=1;
					if (typeof opts.sheets[snj] == "string" && opts.sheets[snj].toLowerCase() == props.SheetNames[i].toLowerCase()) snjseen = 1;
				}
				if (!snjseen) continue wsloop;
			}
		}
		safe_parse_sheet(zip, path, relsPath, props.SheetNames[i], i, sheetRels, sheets, stype, opts, wb, themes, styles);
	}

	out = {
		Directory: dir,
		Workbook: wb,
		Props: props,
		Custprops: custprops,
		Deps: deps,
		Sheets: sheets,
		SheetNames: props.SheetNames,
		Strings: strs,
		Styles: styles,
		Themes: themes,
		SSF: SSF.get_table()
	};
	if (opts && opts.bookFiles) {
		out.keys = entries;
		out.files = zip.files;
	}
	if (opts && opts.bookVBA) {
		if (dir.vba.length > 0) out.vbaraw = getzipdata(zip,strip_front_slash(dir.vba[0]),true);
		else if (dir.defaults && dir.defaults.bin === CT_VBA) out.vbaraw = getzipdata(zip, 'xl/vbaProject.bin',true);
	}
	return out;
}

/* [MS-OFFCRYPTO] 2.1.1 */
function parse_xlsxcfb(cfb, _opts) {
	var opts = _opts || {},
		f = "Workbook",
		data = CFB.find(cfb, f);
	try {
		f = "/!DataSpaces/Version";
		data = CFB.find(cfb, f);
		if (!data || !data.content) {
			throw new Error(`ECMA-376 Encrypted file missing ${f}`);
		}
		parse_DataSpaceVersionInfo(data.content);

		/* 2.3.4.1 */
		f = "/!DataSpaces/DataSpaceMap";
		data = CFB.find(cfb, f);
		if (!data || !data.content) {
			throw new Error(`ECMA-376 Encrypted file missing ${f}`);
		}
		var dsm = parse_DataSpaceMap(data.content);
		if (dsm.length !== 1 || dsm[0].comps.length !== 1 || dsm[0].comps[0].t !== 0 || dsm[0].name !== "StrongEncryptionDataSpace" || dsm[0].comps[0].v !== "EncryptedPackage") {
			throw new Error(`ECMA-376 Encrypted file bad ${f}`);
		}

		/* 2.3.4.2 */
		f = "/!DataSpaces/DataSpaceInfo/StrongEncryptionDataSpace";
		data = CFB.find(cfb, f);
		if (!data || !data.content) {
			throw new Error(`ECMA-376 Encrypted file missing ${f}`);
		}
		var seds = parse_DataSpaceDefinition(data.content);
		if (seds.length != 1 || seds[0] != "StrongEncryptionTransform") {
			throw new Error(`ECMA-376 Encrypted file bad ${f}`);
		}

		/* 2.3.4.3 */
		f = "/!DataSpaces/TransformInfo/StrongEncryptionTransform/!Primary";
		data = CFB.find(cfb, f);
		if (!data || !data.content) {
			throw new Error(`ECMA-376 Encrypted file missing ${f}`);
		}
		parse_Primary(data.content);
	} catch(e) {}

	f = "/EncryptionInfo";
	data = CFB.find(cfb, f);
	if (!data || !data.content) {
		throw new Error(`ECMA-376 Encrypted file missing ${f}`);
	}
	var einfo = parse_EncryptionInfo(data.content);

	/* 2.3.4.4 */
	f = "/EncryptedPackage";
	data = CFB.find(cfb, f);
	if (!data || !data.content) {
		throw new Error(`ECMA-376 Encrypted file missing ${f}`);
	}

	/*global decrypt_agile */
	/*:: declare var decrypt_agile:any; */
	if (einfo[0] == 0x04 && typeof decrypt_agile !== "undefined") {
		return decrypt_agile(einfo[1], data.content, opts.password || "", opts);
	}
	/*global decrypt_std76 */
	/*:: declare var decrypt_std76:any; */
	if (einfo[0] == 0x02 && typeof decrypt_std76 !== "undefined") {
		return decrypt_std76(einfo[1], data.content, opts.password || "", opts);
	}

	throw new Error("File is password-protected");
}

