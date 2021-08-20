
/*
function hslToHex(h, s, l) {
	l /= 100;
	const a = s * Math.min(l, 1 - l) / 100;
	const f = n => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}
*/

const Color = {
	hslToRgb(h, s, l) {
		let _round = Math.round,
			_min = Math.min,
			_max = Math.max,
			a = s * _min(l, 1-l);
		let f = (n, k = (n + h / 30) % 12) => l - a * _max(_min(k - 3, 9 - k, 1), -1);
		return [_round(f(0) * 255), _round(f(8) * 255), _round(f(4) * 255)];
	},
	rgbToHsv(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;
		var _round = Math.round,
			min = Math.min(r, g, b),
			max = Math.max(r, g, b),
			h = 0, s = 0, v = 0,
			d, h;
		// Black-gray-white
		if (min === max) return [0, 0, _round(min * 100)];
		// Colors other than black-gray-white:
		d = (r === min) ? g - b : ((b === min) ? r - g : b - r);
		h = (r === min) ? 3 : ((b === min) ? 1 : 5);
		h = 60 * (h - d / (max - min));
		s = (max - min) / max;
		return [_round(h), _round(s * 100), _round(max * 100)];
	},
	rgbToHex(rgb) {
		let d = "0123456789abcdef".split(""),
			hex = x => isNaN(x) ? "00" : d[(x-x%16)/16] + d[x%16];

		rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		
		return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
	}
};
