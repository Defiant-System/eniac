
const Smart = function() {
	let guide = Object.create(Array.prototype);
	for (var prop in Smart.prototype) {
		if (Smart.prototype.hasOwnProperty(prop)) {
			guide[prop] = Smart.prototype[prop];
		}
	}
	return guide;
};

Smart.prototype = {
	find(selector, offset) {
		let found = [];

		selector = "#shape-rounded";
		window.find(selector).map(svg => {
			let el = $(svg),
				y = parseInt(el.css("top"), 10),
				x = parseInt(el.css("left"), 10),
				w = parseInt(el.css("width"), 10),
				h = parseInt(el.css("height"), 10);
			found.push({ y, x });
		});

		this.sensivity = 10;

		// add guide line element to "this"
		this.offset = offset;

		// add guide line element to "this"
		this.lines = {
			horizontal: window.find(".guide-lines .horizontal"),
			vertical: window.find(".guide-lines .vertical"),
			diagonal: window.find(".guide-lines .diagonal"),
		};

		// populate "this"
		found.map(item => Array.prototype.push.call(this, item));
		return this;
	},
	snap(pos) {
		let s = this.sensivity,
			o = this.offset,
			vert = { top: -1, left: -1, height: -1 },
			hori = { top: -1, left: -1, height: -1 },
			diag = { top: -1, left: -1, height: -1 };

		this.map(p => {
			let dy = pos.top - p.y,
				dx = pos.left - p.x;

			if (dy < s && dy > -s) {
				pos.top -= dy;
				hori = {
					top: p.y,
					left: Math.min(pos.left, p.x),
					width: Math.max(pos.left, p.x) + o.w - Math.min(pos.left, p.x)
				};
			}
			if (dx < s && dx > -s) {
				pos.left -= dx;
				vert = {
					top: p.y,
					left: p.x,
					height: pos.top + o.h - p.y
				};
			}
		});

		this.lines.vertical.css(vert);
		this.lines.horizontal.css(hori);
	}
};

const Guides = function() {
	var guide = new Smart();
	return guide.find.apply(guide, arguments);
};
