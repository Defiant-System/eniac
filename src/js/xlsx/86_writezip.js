
function write_zip(wb, opts) {
	// _shapeid = 1024;
	if (wb && !wb.SSF) {
		wb.SSF = SSF.get_table();
	}
	if (wb && wb.SSF) {
		make_ssf(SSF);
		SSF.load_table(wb.SSF);
		// $FlowIgnore
		opts.revssf = evert_num(wb.SSF);
		opts.revssf[wb.SSF[65535]] = 0;
		opts.ssf = wb.SSF;
	}
	opts.rels = {};
	opts.wbrels = {};
	opts.Strings = [];
	opts.Strings.Count = 0;
	opts.Strings.Unique = 0;
	opts.revStrings = new Map();
	
	fix_write_opts(opts = opts || {});
	
	var files = [],
		ct = new_ct(),
		rId = 0;

	opts.cellXfs = [];
	get_cell_style(opts.cellXfs, {}, { revssf: { "General": 0 } });

	if (!wb.Props) wb.Props = {};
	wb.Props.SheetNames = wb.SheetNames;
	wb.Props.Worksheets = wb.Props.SheetNames.length;

	files.unshift({ file: "docProps/core.xml", body: write_core_props(wb.Props, opts)});
	ct.coreprops.push(files[0].file);
	add_rels(opts.rels, 2, files[0].file, RELS.CORE_PROPS);


	files.unshift({ file: "docProps/app.xml", body: write_ext_props(wb.Props, opts)});
	ct.extprops.push(files[0].file);
	add_rels(opts.rels, 3, files[0].file, RELS.EXT_PROPS);


	if (wb.Custprops !== wb.Props && keys(wb.Custprops || {}).length > 0) {
		files.unshift({ file: "docProps/custom.xml", body: write_cust_props(wb.Custprops, opts) });
		ct.custprops.push(files[0].file);
		add_rels(opts.rels, 4, files[0].file, RELS.CUST_PROPS);
	}

	for (rId=1; rId<=wb.SheetNames.length; ++rId) {
		var wsrels = { "!id": {} },
			ws = wb.Sheets[wb.SheetNames[rId - 1]],
			_type = (ws || {})["!type"] || "sheet";
		switch(_type) {
			case "chart":
				/* falls through */
			default:
				files.unshift({ file: `xl/worksheets/sheet${rId}.xml`, body: write_ws_xml(rId - 1, opts, wb, wsrels) });
				// console.log( files[0].body );
				ct.sheets.push(files[0].file);
				add_rels(opts.wbrels, -1, files[0].file.slice(3), RELS.WS[0]);
		}

		if (ws) {
			var comments = ws["!comments"],
				need_vml = false;
			if (comments && comments.length > 0) {
				files.unshift({ file: `xl/comments${rId}.xml`, body: write_comments_xml(comments, opts) });
				ct.comments.push(files[0].file);
				add_rels(wsrels, -1, ".."+ files[0].file.slice(2), RELS.CMNT);
				need_vml = true;
			}
			if (ws["!legacy"] && need_vml) {
				files.unshift({ file: `xl/drawings/vmlDrawing${rId}.vml`, body: write_comments_vml(rId, ws["!comments"]) });
			}
			delete ws["!comments"];
			delete ws["!legacy"];
		}

		// if (wsrels["!id"].rId1) {
		// 	zip.file(get_rels_path(filename), write_rels(wsrels));
		// }
	}

	if (opts.Strings != null && opts.Strings.length > 0) {
		files.unshift({ file: `xl/sharedStrings.xml`, body: write_sst_xml(opts.Strings, opts) });
		ct.strs.push(files[0].file);
		add_rels(opts.wbrels, -1, files[0].file.slice(3), RELS.SST);
	}

	files.unshift({ file: `xl/workbook.xml`, body: write_wb_xml(wb, opts) });
	ct.workbooks.push(files[0].file);
	add_rels(opts.rels, 1, files[0].file, RELS.WB);

	/* TODO: something more intelligent with themes */

	files.unshift({ file: `xl/theme/theme1.xml`, body: write_theme(wb.Themes, opts) });
	ct.themes.push(files[0].file);
	add_rels(opts.wbrels, -1, files[0].file.slice(3), RELS.THEME);

	/* TODO: something more intelligent with styles */

	files.unshift({ file: `xl/styles.xml`, body: write_sty_xml(wb, opts) });
	ct.styles.push(files[0].file);
	add_rels(opts.wbrels, -1, files[0].file.slice(3), RELS.STY);

	files.unshift({ file: "_rels/.rels", body: write_rels(opts.rels) });
	files.unshift({ file: "xl/_rels/workbook.xml.rels", body: write_rels(opts.wbrels) });
	files.unshift({ file: "[Content_Types].xml", body: write_ct(ct, opts) });


	let zip = new jszip();
	// temp fix
	files.unshift({ "file": "b", body: "" });

	files.map(item => zip.file(item.file, item.body));


	// let xStr, xDoc;
	// xStr = zip.files["xl/styles.xml"]._data;
	// xStr = xStr.replace(/<sheetView workbookViewId="0"\/>/, `<sheetView workbookViewId="0"><pane state="frozen" xSplit="0" ySplit="1" topLeftCell="A2" activePane="bottomLeft"/></sheetView>`);
	// xDoc = $.xmlFromString(xStr);
	// console.log(xStr);
	// zip.files["xl/worksheets/sheet1.xml"]._data = xStr;

	// xStr = zip.files["xl/styles.xml"]._data,
	// xDoc = $.xmlFromString(xStr);
	// console.log( xDoc.xml );


	delete opts.revssf;
	delete opts.ssf;

	return zip;
}
