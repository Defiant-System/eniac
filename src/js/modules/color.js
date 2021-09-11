
const Color = {
	rgbToLightness(r, g, b) {
		return (1/2 * (Math.max(r, g, b) + Math.min(r, g, b))) / 255;
	},
	rgbToSaturation(r, g, b) {
		let L = this.rgbToLightness(r, g, b),
			max = Math.max(r, g, b),
			min = Math.min(r, g, b);
		return (L === 0 || L === 1)
			? 0
			: ((max - min) / (1 - Math.abs(2 * L - 1))) / 255;
	},
	rgbToHue(r, g, b) {
		let hue = Math.round(Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180 / Math.PI );
		return hue < 0 ? hue + 360 : hue;
	},
	hslToRgb(h, s, l, a=1) {
		let _round = Math.round,
			_min = Math.min,
			_max = Math.max,
			b = s * _min(l, 1-l);
		let f = (n, k = (n + h / 30) % 12) => l - b * _max(_min(k - 3, 9 - k, 1), -1);
		return [_round(f(0) * 255), _round(f(8) * 255), _round(f(4) * 255), a];
	},
	hslToHex(h, s, l, a=1) {
		let rgb = this.hslToRgb(h, s, l, a);
		return this.rgbToHex(`rgba(${rgb.join(",")})`);
	},
	hexToHsl(hex) {
		let rgb = this.hexToRgb(hex);
		return this.rgbToHsl(...rgb);
	},
	mixColors(hex1, hex2, p) {
		let rgb1 = this.hexToRgb(hex1),
			rgb2 = this.hexToRgb(hex2),
			w = p * 2 - 1,
			w1 = (w + 1) / 2.0,
			w2 = 1 - w1,
			rgb = [
				parseInt(rgb1[0] * w1 + rgb2[0] * w2, 10),
				parseInt(rgb1[1] * w1 + rgb2[1] * w2, 10),
				parseInt(rgb1[2] * w1 + rgb2[2] * w2, 10),
				rgb1[3] * w1 + rgb2[3] * w2
			];
		return this.rgbToHex(`rgba(${rgb.join(",")})`);
	},
	hexToHsv(hex) {
		let rgb = this.hexToRgb(hex);
		return this.rgbToHsv(...rgb);
	},
	rgbToHsv(r, g, b, a=1) {
		var max = Math.max(r, g, b), min = Math.min(r, g, b),
			d = max - min,
			h,
			s = (max === 0 ? 0 : d / max),
			v = max / 255;
		switch (max) {
			case min: h = 0; break;
			case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
			case g: h = (b - r) + d * 2; h /= 6 * d; break;
			case b: h = (r - g) + d * 4; h /= 6 * d; break;
		}
		return [Math.round(h*360), s, v, a];
	},
	hexToRgb(hex) {
		let r = parseInt(hex.substr(1,2), 16),
			g = parseInt(hex.substr(3,2), 16),
			b = parseInt(hex.substr(5,2), 16),
			a = parseInt(hex.substr(7,2) || "ff", 16) / 255;
		return [r, g, b, a];
	},
	rgbToHsl(r, g, b, a=1) {
		r /= 255;
		g /= 255;
		b /= 255;
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
			hex = x => isNaN(x) ? "00" : d[( x - x % 16) / 16] + d[x % 16];
		rgb = rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\.\d]+)\)$/);
		if (!rgb) rgb = arguments[0].match(/^rgb?\((\d+),\s*(\d+),\s*(\d+)\)$/);
		let a = Math.round((rgb[4] || 1) * 255);
		return "#"+ hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]) + hex(a);
	}
};
