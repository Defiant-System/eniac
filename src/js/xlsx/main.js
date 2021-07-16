
var XLSX = (function() {
	"use strict";
	
	let XLSX = { version: "0.17.0" };

	var DENSE = null,
		DIF_XL = true;

	@import "bits/jszip.js"
	@import "bits/02_codepage.js"
	@import "bits/05_buf.js"
	@import "bits/10_ssf.js"
	@import "bits/20_jsutils.js"
	@import "bits/21_ziputils.js"
	@import "bits/22_xmlutils.js"
	@import "bits/27_csfutils.js"
	@import "bits/30_ctype.js"
	@import "bits/31_rels.js"
	@import "bits/33_coreprops.js"
	@import "bits/34_extprops.js"
	@import "bits/38_xlstypes.js"
	@import "bits/42_sstxml.js"
	@import "bits/46_stycommon.js"
	@import "bits/47_styxml.js"
	@import "bits/49_theme.js"
	@import "bits/59_vba.js"
	@import "bits/61_fcommon.js"
	@import "bits/63_fast.js"
	@import "bits/64_ftokenizer.js"
	@import "bits/66_wscommon.js"
	@import "bits/67_wsxml.js"
	@import "bits/71_wbcommon.js"
	@import "bits/72_wbxml.js"
	@import "bits/79_html.js"
	@import "bits/84_defaults.js"
	@import "bits/85_parsezip.js"
	@import "bits/86_writezip.js"
	@import "bits/87_read.js"
	@import "bits/88_write.js"
	@import "bits/90_utils.js"
	@import "bits/95_api.js"

	XLSX.parseZip = parseZip;
	XLSX.read = readSync;
	XLSX.write = writeFileSync;
	XLSX.utils = utils;
	XLSX.SSF = SSF;

	return XLSX;

})();

module.exports = XLSX;
