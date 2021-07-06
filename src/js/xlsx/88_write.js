
/*:: declare var encrypt_agile:any; */
function write_zip_type(wb, opts) {
	var o = opts || {};
	var z = write_zip(wb, o);
	var oopts = { type: "string" };
	var payload = z.generate(oopts);

	// return o.type == "string" ? utf8read(payload) : payload;
	return {
		name: o.file,
		payload,
		toBlob: data => new Blob([ s2ab(data) ], { type: "application/octet-stream" }),
	};
}

function writeSync(wb, opts) {
	reset_cp();
	check_wb(wb);
	var o = opts || {};
	if (o.cellStyles) {
		o.cellNF = true;
		o.sheetStubs = true;
	}
	return write_zip_type(wb, o);
}

function writeFileSync(wb, filename, opts) {
	var o = opts || {};
	o.type = o.type || "file";
	o.file = filename;
	o.bookType = "xlsx";
	return writeSync(wb, o);
}
