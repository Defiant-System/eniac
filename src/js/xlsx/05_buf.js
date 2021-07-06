
var chr0 = /\u0000/g,
	chr1 = /[\u0001-\u0006]/g;

function bconcat(bufs) {
	return [].concat.apply([], bufs);
}

function new_raw_buf(len) {
	return new Array(len);
}

function new_unsafe_buf(len) {
	return new Array(len);
}

function s2a(s) {
	return s.split("").map(x => x.charCodeAt(0) & 0xff);
};

function s2ab(s) {
	var sl = s.length,
		buf = new ArrayBuffer(sl),
		view = new Uint8Array(buf);
	for (var i=0; i!=sl; ++i) {
		view[i] = s.charCodeAt(i) & 0xFF;
	}
	return buf;
}

function ab2a(data) {
	if (data instanceof ArrayBuffer) {
		return ab2a(new Uint8Array(data));
	}
	var i = 0,
		il = data.length,
		o = new Array(il);
	for (; i<il; ++i) {
		o[i] = data[i];
	}
	return o;
}
