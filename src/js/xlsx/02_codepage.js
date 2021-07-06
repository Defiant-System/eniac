
var current_codepage = 1200,
	current_ansi = 1252,
	VALID_ANSI = [874, 932, 936, 949, 950, 1250, 1251, 1252, 1253, 1254, 1255, 1256, 1257, 1258],
	/* ECMA-376 Part I 18.4.1 charset to codepage mapping */
	CS2CP = {
		0:    1252, /* ANSI */
		1:   65001, /* DEFAULT */
		2:   65001, /* SYMBOL */
		77:  10000, /* MAC */
		128:   932, /* SHIFTJIS */
		129:   949, /* HANGUL */
		130:  1361, /* JOHAB */
		134:   936, /* GB2312 */
		136:   950, /* CHINESEBIG5 */
		161:  1253, /* GREEK */
		162:  1254, /* TURKISH */
		163:  1258, /* VIETNAMESE */
		177:  1255, /* HEBREW */
		178:  1256, /* ARABIC */
		186:  1257, /* BALTIC */
		204:  1251, /* RUSSIAN */
		222:   874, /* THAI */
		238:  1250, /* EASTEUROPE */
		255:  1252, /* OEM */
		69:   6969  /* MISC */
	};

function set_ansi(cp) {
	if (VALID_ANSI.indexOf(cp) == -1) return;
	current_ansi = CS2CP[0] = cp;
}

function reset_ansi() {
	set_ansi(1252);
}

function set_cp(cp) {
	current_codepage = cp;
	set_ansi(cp);
}

function reset_cp() {
	set_cp(1200);
	reset_ansi();
}

function debom(data) {
	var c1 = data.charCodeAt(0),
		c2 = data.charCodeAt(1);
	if(c1 == 0xFF && c2 == 0xFE) return utf16leread(data.slice(2));
	if(c1 == 0xFE && c2 == 0xFF) return utf16beread(data.slice(2));
	if(c1 == 0xFEFF) return data.slice(1);
	return data;
};
