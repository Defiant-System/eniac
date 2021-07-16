
var XLSX = (function() {
	"use strict";
	
	let XLSX = { version: "0.17.0" };

	var DENSE = null,
		DIF_XL = true;

	@import "jszip.js"
	@import "02_codepage.js"
	@import "05_buf.js"
	@import "10_ssf.js"
	@import "20_jsutils.js"
	@import "21_ziputils.js"
	@import "22_xmlutils.js"
	@import "27_csfutils.js"
	@import "30_ctype.js"
	@import "31_rels.js"
	@import "33_coreprops.js"
	@import "34_extprops.js"
	@import "38_xlstypes.js"
	@import "42_sstxml.js"
	@import "46_stycommon.js"
	@import "47_styxml.js"
	@import "49_theme.js"
	@import "59_vba.js"
	@import "61_fcommon.js"
	@import "63_fast.js"
	@import "64_ftokenizer.js"
	@import "66_wscommon.js"
	@import "67_wsxml.js"
	@import "71_wbcommon.js"
	@import "72_wbxml.js"
	@import "79_html.js"
	@import "84_defaults.js"
	@import "85_parsezip.js"
	@import "86_writezip.js"
	@import "87_read.js"
	@import "88_write.js"
	@import "90_utils.js"
	@import "95_api.js"

	XLSX.parseZip = parse_zip;
	XLSX.read = readSync;
	XLSX.write = writeFileSync;
	XLSX.utils = utils;
	XLSX.SSF = SSF;

	return XLSX;

})();

module.exports = XLSX;
