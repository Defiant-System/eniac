
class Guides {
	constructor(opt={}) {
		// reference to root application
		let APP = eniac;
		// default properties
		this.els = [];
		// selector = "#shape-rounded";
		window.find(opt.selector, opt.context).map(elem => {
				let el = $(elem),
					y = parseInt(el.css("top"), 10),
					x = parseInt(el.css("left"), 10),
					w = parseInt(el.css("width"), 10),
					h = parseInt(el.css("height"), 10),
					mh = h * .5,
					mw = w * .5;
				if (!isNaN(y) && !isNaN(x) && elem !== opt.offset.el) {
					this.els.push({ y, x, w, h, mh, mw });
				}
			});

		// add guide line element to "this"
		this.lines = {
			horizontal: window.find(".guide-lines .horizontal"),
			vertical: window.find(".guide-lines .vertical"),
			diagonal: window.find(".guide-lines .diagonal"),
		};
		// add guide line element to "this"
		this.opts = {
			// offsets origo
			x: 0,
			y: 0,
			// offsets guide line
			w: 0,
			h: 0,
			mh: opt.offset.h * .5 || 0,
			mw: opt.offset.w * .5 || 0,
			// snap sensitivity
			sensitivity: APP.Settings["guides-snap-sensitivity"] || 10,
			// override defaults, if any
			...opt.offset,
		};
	}

	snapDim(d) {
		let o = this.opts,
			s = o.sensitivity,
			b = o.bearing,
			vert = { top: -1, left: -1, width: 1 },
			calcV = (g, c, add = { w: 0 }) => {
				let minY = o.y,
					maxY = g.y,
					h = g.h;
				
				d.width -= c.w;
				d.left -= c.l;
				
				if (maxY < minY) {
					minY = g.y;
					maxY = o.y;
					h = o.h;
				}
				return { top: minY, left: g.x+add.w, height: maxY-minY+h };
			};
		// iterate guide lines
		this.els.map(g => {
			let l = d.left - g.x,
				lw = l - g.w,
				dw = d.width + o.x - g.x,
				owx = dw - g.w,
				c = { w: 0, l: 0 };
			// horizontal comparisons
			switch (true) {
				// bitwise comparison: east
				case (b & 2 && l < s && l > -s):
					c.l = l;
					c.w -= l;
					vert = calcV(g, c);
					break;
				case (b & 2 && lw < s && lw > -s):
					c.l = lw;
					c.w -= lw;
					vert = calcV(g, c, { w: g.w });
					break;

				// bitwise comparison: west
				case (b & 8 && dw < s && dw > -s):
					c.w = dw;
					vert = calcV(g, c);
					break;
				case (b & 8 && owx < s && owx > -s):
					c.w = owx;
					vert = calcV(g, c, { w: g.w });
					break;
			}
		});
		// apply UI update
		this.lines.vertical.css(vert);
	}

	snapPos(m) {
		let o = this.opts,
			s = o.sensitivity,
			t = m.top + o.y,
			l = m.left + o.x,
			vert = { top: -1, left: -1, width: 1 },
			hori = { top: -1, left: -1, height: 1 },
			calcH = (g, y, add = { t: 0 }) => {
				let minX = l,
					maxX = g.x,
					w = g.w;
				m.top -= y;
				if (maxX < minX) {
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
				if (maxY < minY) {
					minY = g.y;
					maxY = t;
					h = o.h;
				}
				return { top: minY, left: g.x+add.l, height: maxY-minY+h };
			};
		// iterate guide lines
		this.els.map(g => {
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
	}

	reset() {
		let data = { top: -99, left: -99, width: 1, height: 1 };
		this.lines.vertical.css(data);
		this.lines.horizontal.css(data);
		this.lines.horizontal.css(data);
	}
}
