
const Color = {
	hslToRgb(hsl) {
		let _round = Math.round,
			r, g, b, q, p,
			hue2rgb = (p, q, t) => {
				if(t < 0) t += 1;
				if(t > 1) t -= 1;
				if(t < 1/6) return p + (q - p) * 6 * t;
				if(t < 1/2) return q;
				if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			};
		if (s === 0) {
			r = g = b = l; // achromatic
		} else {
			q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}
		return [_round(r * 255), _round(g * 255), _round(b * 255)];
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
