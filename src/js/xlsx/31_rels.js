
XMLNS.RELS = 'http://schemas.openxmlformats.org/package/2006/relationships';

/* 9.3 Relationships */
var RELS = {
		WB:    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
		SHEET: "http://sheetjs.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
		HLINK: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
		VML:   "http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing",
		XPATH: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLinkPath",
		XMISS: "http://schemas.microsoft.com/office/2006/relationships/xlExternalLinkPath/xlPathMissing",
		XLINK: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLink",
		CXML:  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml",
		CXMLP: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXmlProps",
		VBA:   "http://schemas.microsoft.com/office/2006/relationships/vbaProject",
		CMNT:  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments",
	},
	RELS_EXTERN = [RELS.HLINK, RELS.XPATH, RELS.XMISS],
	RELS_ROOT = writextag("Relationships", null, { "xmlns": XMLNS.RELS });


/* 9.3.3 Representing Relationships */
function get_rels_path(file) {
	var n = file.lastIndexOf("/");
	return file.slice(0, n + 1) +"_rels/"+ file.slice(n + 1) +".rels";
}

function parse_rels(data, currentFilePath) {
	var rels = { "!id": {} },
		hash = {};

	if (!data) return rels;
	if (currentFilePath.charAt(0) !== "/") {
		currentFilePath = "/"+ currentFilePath;
	}

	(data.match(tagregex) || []).forEach(x => {
		var y = parsexmltag(x);
		/* 9.3.2.2 OPC_Relationships */
		if (y[0] === "<Relationship") {
			var rel = {},
				canonictarget = y.TargetMode === "External" ? y.Target : resolve_path(y.Target, currentFilePath);
			rel.Type = y.Type;
			rel.Target = y.Target;
			rel.Id = y.Id;
			rel.TargetMode = y.TargetMode;
			rels[canonictarget] = rel;
			hash[y.Id] = rel;
		}
	});
	rels["!id"] = hash;
	return rels;
}

function write_rels(rels) {
	var o = [XML_HEADER, RELS_ROOT];
	keys(rels["!id"]).forEach(rid => {
		o[o.length] = writextag("Relationship", null, rels["!id"][rid]);
	});
	if (o.length > 2){
		o[o.length] = ("</Relationships>");
		o[1] = o[1].replace("/>",">");
	}
	return o.join("");
}

function add_rels(rels, rId, f, type, relobj, targetmode) {
	if (!relobj) relobj = {};
	if (!rels["!id"]) rels["!id"] = {};
	if (rId < 0) {
		for(rId=1; rels["!id"]["rId"+ rId]; ++rId) {}
	}
	relobj.Id = "rId"+ rId;
	relobj.Type = type;
	relobj.Target = f;

	if (targetmode) relobj.TargetMode = targetmode;
	else if (RELS_EXTERN.indexOf(relobj.Type) > -1) relobj.TargetMode = "External";
	
	if (rels["!id"][relobj.Id]) {
		throw new Error(`Cannot rewrite rId ${rId}`);
	}
	
	rels["!id"][relobj.Id] = relobj;
	rels[("/"+ relobj.Target).replace("//", "/")] = relobj;
	
	return rId;
}