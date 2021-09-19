
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

		// selector = "#shape-rounded";
		window.find(selector)
			.map(svg => {
				let el = $(svg),
					y = parseInt(el.css("top"), 10),
					x = parseInt(el.css("left"), 10),
					w = parseInt(el.css("width"), 10),
					h = parseInt(el.css("height"), 10);
				if (svg !== offset.el) {
					found.push({ y, x, w, h });
				}
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
	snap(m) {
		let s = this.sensivity,
			o = this.offset,
			vert = { top: -1, left: -1, width: 1 },
			hori = { top: -1, left: -1, height: 1 },
			diag = { top: -1, left: -1, width: 1 },
			minY, maxY, h,
			minX, maxX, w,
			calcH = (p, y) => {
				m.top -= y;
				if (p.x < m.left) {
					minX = p.x;
					maxX = m.left;
					w = o.w;
				} else {
					minX = m.left;
					maxX = p.x;
					w = p.w;
				}
				return { top: p.y, left: minX, width: maxX-minX+w };
			},
			calcV = (p, x) => {
				m.left -= x;
				if (p.y < m.top) {
					minY = p.y;
					maxY = m.top;
					h = o.h;
				} else {
					minY = m.top;
					maxY = p.y;
					h = p.h;
				}
				return { left: p.x, top: minY, height: maxY-minY+h };
			};

		this.map(p => {
			let dy = m.top - p.y,
				dx = m.left - p.x,
				ohy = dy + o.h,
				owx = dx + o.w;
			// vertical comparisons
			switch (true) {
				case (dy  < s && dy  > -s): hori = calcH(p, dy);  break;
				case (ohy < s && ohy > -s): hori = calcH(p, ohy); break;
			}
			// horizontaö comparisons
			switch (true) {
				case (dx  < s && dx  > -s): vert = calcV(p, dx); break;
				case (owx < s && owx > -s): vert = calcV(p, owx); break;
			}
		});

		this.lines.vertical.css(vert);
		this.lines.horizontal.css(hori);
	},
	reset() {
		let data = { top: -99, left: -99, width: 1, height: 1 };
		this.lines.vertical.css(data);
		this.lines.horizontal.css(data);
		this.lines.horizontal.css(data);
	}
};

const Guides = function() {
	var guide = new Smart();
	return guide.find.apply(guide, arguments);
};
