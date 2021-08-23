
const Color = {
	hslToRgb(h, s, l) {
		let _round = Math.round,
			_min = Math.min,
			_max = Math.max,
			a = s * _min(l, 1-l);
		let f = (n, k = (n + h / 30) % 12) => l - a * _max(_min(k - 3, 9 - k, 1), -1);
		return [_round(f(0) * 255), _round(f(8) * 255), _round(f(4) * 255)];
	},
	hslToHex(h, s, l) {
		let rgb = this.hslToRgb(h, s, l);
		return this.rgbToHex(`rgb(${rgb.join(",")})`);
	},
	hexToHsl(hex) {
		var r = parseInt(hex.substr(1,2), 16),
			g = parseInt(hex.substr(3,2), 16),
			b = parseInt(hex.substr(5,2), 16),
			a = parseInt(hex.substr(7,2) || "ff", 16);
		return this.rgbToHsl(r, g, b, a);
	},
	hexToRgbl(hex) {

	},
	rgbToHsl(r, g, b, a=255) {
		r /= 255;
		g /= 255;
		b /= 255;
		a /= 255;
		var max = Math.max(r, g, b),
			min = Math.min(r, g, b),
			l = (max + min) / 2,
			h, s;
		if (max == min){
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return [Math.round(h*360), s, l, a];
	},
	rgbToHex(rgb) {
		let d = "0123456789abcdef".split(""),
			hex = x => isNaN(x) ? "00" : d[(x-x%16)/16] + d[x%16];
		rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
	}
};
