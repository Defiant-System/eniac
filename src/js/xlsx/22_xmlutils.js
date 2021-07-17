
var XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n',
	attregexg = /([^"\s?>\/]+)\s*=\s*((?:")([^"]*)(?:")|(?:')([^']*)(?:')|([^'">\s]+))/g,
	tagregex = /<[\/\?]?[a-zA-Z0-9:_-]+(?:\s+[^"\s?>\/]+\s*=\s*(?:"[^"]*"|'[^']*'|[^'">\s=]+))*\s*[\/\?]?>/mg,
	nsregex = /<\w*:/,
	nsregex2 = /<(\/?)\w+:/,
	encodings = {
		"&quot;" : '"',
		"&apos;" : "'",
		"&gt;"   : '>',
		"&lt;"   : '<',
		"&amp;"  : '&'
	},
	rencoding = evert(encodings),
	vtvregex = /<\/?(?:vt:)?variant>/g,
	vtmregex = /<(?:vt:)([^>]*)>([\s\S]*)</,
	wtregex = /(^\s|\s$|\n)/,
	XMLNS = {
		"dc": "http://purl.org/dc/elements/1.1/",
		"dcterms": "http://purl.org/dc/terms/",
		"dcmitype": "http://purl.org/dc/dcmitype/",
		"mx": "http://schemas.microsoft.com/office/mac/excel/2008/main",
		"r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
		"sjs": "http://schemas.openxmlformats.org/package/2006/sheetjs/core-properties",
		"vt": "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes",
		"xsi": "http://www.w3.org/2001/XMLSchema-instance",
		"xsd": "http://www.w3.org/2001/XMLSchema",
		"x14ac": "http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac",
		"mc": "http://schemas.openxmlformats.org/markup-compatibility/2006",
	},
	XLMLNS = {
		"o":    "urn:schemas-microsoft-com:office:office",
		"x":    "urn:schemas-microsoft-com:office:excel",
		"ss":   "urn:schemas-microsoft-com:office:spreadsheet",
		"dt":   "uuid:C2F41010-65B3-11d1-A29F-00AA00C14882",
		"mv":   "http://macVmlSchemaUri",
		"v":    "urn:schemas-microsoft-com:vml",
		"html": "http://www.w3.org/TR/REC-html40"
	};

XMLNS.main = [
		"http://schemas.openxmlformats.org/spreadsheetml/2006/main",
		"http://purl.oclc.org/ooxml/spreadsheetml/main",
		"http://schemas.microsoft.com/office/excel/2006/main",
		"http://schemas.microsoft.com/office/excel/2006/2"
	];

function parsexmltag(tag, skip_root, skip_LC) {
	var z = {},
		eq = 0,
		c = 0;
	for (; eq !== tag.length; ++eq) {
		if ((c = tag.charCodeAt(eq)) === 32 || c === 10 || c === 13) break;
	}
	if (!skip_root) z[0] = tag.slice(0, eq);
	if (eq === tag.length) return z;

	var m = tag.match(attregexg),
		j = 0,
		v = "",
		i = 0,
		q = "",
		cc = "",
		quot = 1;
	if (m) {
		for (i=0; i!=m.length; ++i) {
			cc = m[i];
			for (c=0; c!=cc.length; ++c) {
				if (cc.charCodeAt(c) === 61) break;
			}
			q = cc.slice(0, c).trim();
			while (cc.charCodeAt(c + 1) == 32) ++c;
			quot = ((eq=cc.charCodeAt(c + 1)) == 34 || eq == 39) ? 1 : 0;
			v = cc.slice(c + 1 + quot, cc.length-quot);
			for (j=0; j!=q.length; ++j) {
				if (q.charCodeAt(j) === 58) break;
			}
			if (j === q.length) {
				if (q.indexOf("_") > 0) q = q.slice(0, q.indexOf("_")); // from ods
				z[q] = v;
				if (!skip_LC) z[q.toLowerCase()] = v;
			} else {
				var k = (j===5 && q.slice(0, 5) === "xmlns" ? "xmlns" : "") + q.slice(j + 1);
				if (z[k] && q.slice(j - 3, j) == "ext") continue; // from ods
				z[k] = v;
				if (!skip_LC) z[k.toLowerCase()] = v;
			}
		}
	}
	return z;
}

function strip_ns(x) {
	return x.replace(nsregex2, "<$1");
}

// TODO: CP remap (need to read file version to determine OS)
var unescapexml = (function() {
	/* 22.4.2.4 bstr (Basic String) */
	var encregex = /&(?:quot|apos|gt|lt|amp|#x?([\da-fA-F]+));/ig,
		coderegex = /_x([\da-fA-F]{4})_/ig;
	return function unescapexml(text) {
		var s = text +"",
			i = s.indexOf("<![CDATA[");
		if (i == -1) {
			let out = s
				.replace(encregex, ($$, $1) => encodings[$$] || String.fromCharCode(parseInt($1,$$.indexOf("x") > -1 ? 16 : 10)) || $$)
				.replace(coderegex, (m, c) => String.fromCharCode(parseInt(c, 16)));
			return out;
		}
		var j = s.indexOf("]]>");
		return unescapexml(s.slice(0, i)) + s.slice(i + 9, j) + unescapexml(s.slice(j + 3));
	};
})();

var decregex=/[&<>'"]/g,
	charegex = /[\u0000-\u0008\u000b-\u001f]/g,
	htmlcharegex = /[\u0000-\u001f]/g;

function escapexml(text){
	var s = text +"";
	return s.replace(decregex, y => rencoding[y])
			.replace(charegex, s => "_x" + ("000"+ s.charCodeAt(0).toString(16)).slice(-4) +"_");
}

function escapexmltag(text){
	return escapexml(text).replace(/ /g, "_x0020_");
}

function escapehtml(text){
	var s = text +"";
	return s.replace(decregex, y => rencoding[y])
			.replace(/\n/g, "<br/>")
			.replace(htmlcharegex, s => "&#x"+ ("000"+ s.charCodeAt(0).toString(16)).slice(-4) +";");
}

function escapexlml(text){
	var s = text +"";
	return s.replace(decregex, y => rencoding[y])
			.replace(htmlcharegex, s => "&#x"+ (s.charCodeAt(0).toString(16)).toUpperCase() +";");
}

/* TODO: handle codepages */
var xlml_fixstr = (function() {
		var entregex = /&#(\d+);/g;
		
		function entrepl($$, $1) {
			return String.fromCharCode(parseInt($1, 10));
		}

		return function xlml_fixstr(str) {
			return str.replace(entregex, entrepl);
		};
	})();

var xlml_unfixstr = (function() {
		return function xlml_unfixstr(str) {
			return str.replace(/(\r\n|[\r\n])/g, "\&#10;");
		};
	})();

function parsexmlbool(value) {
	switch (value) {
		case 1:
		case true:
		case "1":
		case "true":
		case "TRUE": return true;
		default:
			return false;
	}
}

var utf8read = function utf8reada(orig) {
		var out = "",
			i = 0,
			c = 0,
			d = 0,
			e = 0,
			f = 0,
			w = 0;
		while (i < orig.length) {
			c = orig.charCodeAt(i++);
			if (c < 128) {
				out += String.fromCharCode(c);
				continue;
			}
			d = orig.charCodeAt(i++);
			if (c>191 && c<224) {
				f = ((c & 31) << 6);
				f |= (d & 63);
				out += String.fromCharCode(f);
				continue;
			}
			e = orig.charCodeAt(i++);
			if (c < 240) {
				out += String.fromCharCode(((c & 15) << 12) | ((d & 63) << 6) | (e & 63));
				continue;
			}
			f = orig.charCodeAt(i++);
			w = (((c & 7) << 18) | ((d & 63) << 12) | ((e & 63) << 6) | (f & 63))-65536;
			out += String.fromCharCode(0xD800 + ((w>>>10)&1023));
			out += String.fromCharCode(0xDC00 + (w&1023));
		}
		return out;
	};

function utf8write(orig) {
	var out = [],
		i = 0,
		c = 0,
		d = 0;
	while (i < orig.length) {
		c = orig.charCodeAt(i++);
		switch (true) {
			case c < 128:
				out.push(String.fromCharCode(c));
				break;
			case c < 2048:
				out.push(String.fromCharCode(192 + (c >> 6)));
				out.push(String.fromCharCode(128 + (c & 63)));
				break;
			case c >= 55296 && c < 57344:
				c -= 55296; d = orig.charCodeAt(i++) - 56320 + (c<<10);
				out.push(String.fromCharCode(240 + ((d >>18) & 7)));
				out.push(String.fromCharCode(144 + ((d >>12) & 63)));
				out.push(String.fromCharCode(128 + ((d >> 6) & 63)));
				out.push(String.fromCharCode(128 + (d & 63)));
				break;
			default:
				out.push(String.fromCharCode(224 + (c >> 12)));
				out.push(String.fromCharCode(128 + ((c >> 6) & 63)));
				out.push(String.fromCharCode(128 + (c & 63)));
		}
	}
	return out.join("");
}

// matches <foo>...</foo> extracts content
var matchtag = (function() {
		var mtcache = {};
		return function matchtag(f, g) {
			var t = f +"|"+ (g || "");
			if (mtcache[t]) return mtcache[t];
			return (mtcache[t] = new RegExp('<(?:\\w+:)?'+ f +'(?: xml:space="preserve")?(?:[^>]*)>([\\s\\S]*?)</(?:\\w+:)?'+ f +'>', (g || "")));
		};
	})();

var htmldecode = (function() {
	var entities = [
			['nbsp', ' '],
			['middot', '·'],
			['quot', '"'],
			['apos', "'"],
			['gt',   '>'],
			['lt',   '<'],
			['amp',  '&']
		].map(x => [new RegExp('&'+ x[0] +';', "ig"), x[1]]);

	return function htmldecode(str) {
		var o = str
				// Remove new lines and spaces from start of content
				.replace(/^[\t\n\r ]+/, "")
				// Remove new lines and spaces from end of content
				.replace(/[\t\n\r ]+$/,"")
				// Added line which removes any white space characters after and before html tags
				.replace(/>\s+/g,">").replace(/\s+</g,"<")
				// Replace remaining new lines and spaces with space
				.replace(/[\t\n\r ]+/g, " ")
				// Replace <br> tags with new lines
				.replace(/<\s*[bB][rR]\s*\/?>/g, "\n")
				// Strip HTML elements
				.replace(/<[^>]*>/g, "");
		for (var i=0; i<entities.length; ++i) {
			o = o.replace(entities[i][0], entities[i][1]);
		}
		return o;
	};
})();

var vtregex = (function() {
		var vt_cache = {};
		return function vt_regex(bt) {
			if (vt_cache[bt] !== undefined) return vt_cache[bt];
			return (vt_cache[bt] = new RegExp("<(?:vt:)?"+ bt +">([\\s\\S]*?)</(?:vt:)?"+ bt +">", "g") );
		};
	})();

function html2xml(td) {
	if (td.childNodes.length > 1 || (td.childNodes.length && td.childNodes[0].nodeType === 2)) {
		let xml = [],
			getTextNodes = el => {
				el.childNodes.map(el => {
					switch (el.nodeType) {
						case 1:
							if (el.nodeName === "BR") {
								xml.push(`<r><t xml:space="preserve">\r\n</t></r>`);
							} else {
								getTextNodes(el);
							}
							break;
						case 3:
							let style = getComputedStyle(el.parentNode),
								color = style["color"].match(/\d+/g).map(i => +i),
								bold = style["font-weight"] >= 500 ? `\n<b/>` : "",
								italic = style["font-style"] === "italic" ? `\n<i/>` : "",
								underline = style["text-decoration"].startsWith("underline") ? `\n<u val="single"/>` : "",
								stricken = style["text-decoration"].startsWith("line-through") ? `\n<strike/>` : "",
								g = el.nodeValue;
							xml.push(`<r>
										<rPr>${stricken + bold + italic + underline}
											<color rgb="${rgb2Hex(color).toLowerCase()}"/>
											<sz val="${(parseInt(style["font-size"], 10)) * (72/96)}"/>
											<rFont val="${style["font-family"].split(",")[0]}"/>
										</rPr>
										<t${ g.match(wtregex) ? ` xml:space="preserve"` : "" }>${g}</t>
									</r>`);
							break;
					}
				});
			};

		getTextNodes(td);

		return xml.join("").replace(/\t/g, "");
		// return `<is>${xml.join("")}</is>`.replace(/\t/g, "");
	} else {
		return htmldecode(td.innerHTML);
	}
}

function parseVector(data, opts) {
	var h = parsexmltag(data),
		matches = data.match(vtregex(h.baseType)) || [],
		res = [];
	if (matches.length != h.size) {
		if (opts.WTF) {
			throw new Error("unexpected vector length " + matches.length + " != " + h.size);
		}
		return res;
	}
	matches.forEach(function(x) {
		var v = x.replace(vtvregex, "").match(vtmregex);
		if (v) res.push({ v: utf8read(v[2]), t: v[1] });
	});
	return res;
}

function writetag(f, g) {
	return "<"+ f + (g.match(wtregex) ? ' xml:space="preserve"' : "") +">"+ g +"</"+ f +">";
}

function wxt_helper(h) {
	return keys(h).map(k => ` ${k}="${h[k]}"`).join("");
}

function writextag(f, g, h) {
	return "<"+ f +
		((h != null) ? wxt_helper(h) : "") +
		((g != null) ? (g.match(wtregex) ? ' xml:space="preserve"' : "") + ">" + g + "</" + f : "/") +
		">";
}

function write_w3cdtf(d, t) {
	try {
		return d.toISOString().replace(/\.\d*/,"");
	} catch(e) {
		if (t) throw e;
	}
	return "";
}
