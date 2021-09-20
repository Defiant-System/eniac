
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
					h = parseInt(el.css("height"), 10),
					mh = h * .5,
					mw = w * .5;
				if (svg !== offset.el) {
					found.push({ y, x, w, h, mh, mw });
				}
			});
		// snap sensitivity
		this.sensivity = 10;
		// add guide line element to "this"
		this.offset = {
			x: 0,
			y: 0,
			w: 0,
			h: 0,
			...offset,
			mh: offset.h * .5 || 0,
			mw: offset.w * .5 || 0,
		};
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
			t = m.top + o.y,
			l = m.left + o.x,
			vert = { top: -1, left: -1, width: 1 },
			hori = { top: -1, left: -1, height: 1 },
			calcH = (g, y, add = { t: 0 }) => {
				let minX = l,
					maxX = g.x,
					w = g.w;
				m.top -= y;
				if (g.x < l) {
					minX = g.x;
					maxX = l;
					w = o.w;
				}
				return { top: g.y+add.t, left: minX, width: maxX-minX+w };
			},
			calcV = (g, x, add = { l: 0 }) => {
				let minY = t,
					maxY = g.y,
					h = g.h;
				m.left -= x;
				if (g.y < t) {
					minY = g.y;
					maxY = t;
					h = o.h;
				}
				return { left: g.x+add.l, top: minY, height: maxY-minY+h };
			};
		// iterate guide lines
		this.map(g => {
			let dy = t - g.y,
				dx = l - g.x,
				ohy = dy + o.h,
				ghy = dy - g.h,
				ogh = ohy - g.h,
				oym = ohy - g.mh - o.mh,
				owx = dx + o.w,
				gwx = dx - g.w,
				ogw = owx - g.w,
				oxm = owx - g.mw - o.mw;
			// vertical comparisons
			switch (true) {
				case (dy  < s && dy  > -s): hori = calcH(g, dy);                break;
				case (ohy < s && ohy > -s): hori = calcH(g, ohy);               break;
				case (oym < s && oym > -s): hori = calcH(g, oym, { t: g.mh });  break;
				case (ghy < s && ghy > -s): hori = calcH(g, ghy, { t: g.h-1 }); break;
				case (ogh < s && ogh > -s): hori = calcH(g, ogh, { t: g.h-1 }); break;
			}
			// horizontal comparisons
			switch (true) {
				case (dx  < s && dx  > -s): vert = calcV(g, dx);                break;
				case (owx < s && owx > -s): vert = calcV(g, owx);               break;
				case (oxm < s && oxm > -s): vert = calcV(g, oxm, { l: g.mw  }); break;
				case (gwx < s && gwx > -s): vert = calcV(g, gwx, { l: g.w-1 }); break;
				case (ogw < s && ogw > -s): vert = calcV(g, ogw, { l: g.w-1 }); break;
			}
		});
		// apply UI update
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
