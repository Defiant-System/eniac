
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
			sensitivity: APP.Settings["guides-snap-sensitivity"] || 7,
			// override defaults, if any
			...opt.offset,
		};
	}

	snapDim2(d) {
		let o = this.opts,
			s = o.sensitivity,
			u = d.uniform,
			b = {
				n: o.type.includes("n"),
				w: o.type.includes("w"),
				e: o.type.includes("e"),
				s: o.type.includes("s"),
			},
			diag = { top: -1, left: -1, height: 1 };
		
		diag = {
			top: d.top || o.y,
			left: (d.left || o.x) + (o.r > 90 ? d.width : 0),
			transform: `rotate(${o.r}deg)`,
			width: Math.sqrt(d.height*d.height + d.width*d.width) + 10,
		};
		
		// iterate guide lines
		this.els.map(g => {

		});
		// apply UI update
		this.lines.diagonal.css(diag);
	}

	snapDim(d) {
		let o = this.opts,
			s = o.sensitivity,
			u = d.uniform,
			b = {
				n: o.type.includes("n"),
				w: o.type.includes("w"),
				e: o.type.includes("e"),
				s: o.type.includes("s"),
			},
			vert = { top: -1, left: -1, width: 1 },
			hori = { top: -1, left: -1, height: 1 },
			calcH = (g, c, add = { h: 0 }) => {
				let minX = o.x,
					maxX = g.x,
					w = g.w;
				d.height -= c.h;
				d.top -= c.t;
				if (maxX < minX) {
					minX = g.x;
					maxX = o.x;
					w = o.w;
				}
				return { top: g.y+add.h, left: minX, width: maxX-minX+w };
			},
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
			let t = d.top - g.y,
				th = t - g.h,
				thm = t - g.mh,
				dh = d.height + o.y - g.y,
				ohy = dh - g.h,
				ohm = dh - g.mh,
				l = d.left - g.x,
				lw = l - g.w,
				lwm = l - g.mw,
				dw = d.width + o.x - g.x,
				owx = dw - g.w,
				owm = dw - g.mw,
				c = { w: 0, h: 0, t: 0, l: 0 };
			// horizontal comparisons
			switch (true) {
				// east
				case (b.e && l < s && l > -s):     c.l = l;   c.w -= l;   vert = calcV(g, c);              break;
				case (b.e && lw < s && lw > -s):   c.l = lw;  c.w -= lw;  vert = calcV(g, c, { w: g.w });  break;
				case (b.e && lwm < s && lwm > -s): c.l = lwm; c.w -= lwm; vert = calcV(g, c, { w: g.mw }); break;
				// west
				case (b.w && dw < s && dw > -s):   c.w = dw;  vert = calcV(g, c);              break;
				case (b.w && owx < s && owx > -s): c.w = owx; vert = calcV(g, c, { w: g.w });  break;
				case (b.w && owm < s && owm > -s): c.w = owm; vert = calcV(g, c, { w: g.mw }); break;
			}
			// vertical comparisons
			switch (true) {
				// north
				case (b.n && t < s && t > -s):     c.t = t;   c.h -= t;   hori = calcH(g, c);              break;
				case (b.n && th < s && th > -s):   c.t = th;  c.h -= th;  hori = calcH(g, c, { h: g.h });  break;
				case (b.n && thm < s && thm > -s): c.t = thm; c.h -= thm; hori = calcH(g, c, { h: g.mh }); break;
				// south
				case (b.s && dh < s && dh > -s):   c.h = dh;  hori = calcH(g, c);              break;
				case (b.s && ohy < s && ohy > -s): c.h = ohy; hori = calcH(g, c, { h: g.h });  break;
				case (b.s && ohm < s && ohm > -s): c.h = ohm; hori = calcH(g, c, { h: g.mh }); break;
			}
		});
		// apply UI update
		this.lines.vertical.css(vert);
		this.lines.horizontal.css(hori);
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
					w = maxX-minX+g.w;
				if (w < o.w) w = o.w;
				m.top -= y;
				if (maxX < minX) {
					minX = g.x;
					maxX = l;
					w = maxX-minX+o.w;
					if (w < g.w) w = g.w;
				}
				return { top: g.y+add.t, left: minX, width: w };
			},
			calcV = (g, x, add = { l: 0 }) => {
				let minY = t,
					maxY = g.y,
					h = maxY-minY+g.h;
				if (h < o.h) h = o.h;
				m.left -= x;
				if (maxY < minY) {
					minY = g.y;
					maxY = t;
					h = maxY-minY+o.h;
					if (h < g.h) h = g.h;
				}
				return { top: minY, left: g.x+add.l, height: h };
			};
		// iterate guide lines
		this.els.map(g => {
			let dy = t - g.y,
				dx = l - g.x,
				ohy = dy + o.h,
				oh1 = dy + o.mh,
				oh2 = ohy - g.h - o.mh,
				ghy = dy - g.h,
				ogh = ohy - g.h,
				oym = ohy - g.mh - o.mh,
				owx = dx + o.w,
				ow1 = dx + o.mw,
				ow2 = owx - g.w - o.mw,
				gwx = dx - g.w,
				ogw = owx - g.w,
				oxm = owx - g.mw - o.mw,
				_hd = hori.top !== -1,
				_vd = vert.top !== -1;
			// vertical comparisons
			switch (true) {
				case (!_hd && dy  < s && dy  > -s): hori = calcH(g, dy);                break;
				case (!_hd && ohy < s && ohy > -s): hori = calcH(g, ohy);               break;
				case (!_hd && oh1 < s && oh1 > -s): hori = calcH(g, oh1);               break;
				case (!_hd && oh2 < s && oh2 > -s): hori = calcH(g, oh2, { t: g.h });   break;
				case (!_hd && oym < s && oym > -s): hori = calcH(g, oym, { t: g.mh });  break;
				case (!_hd && ghy < s && ghy > -s): hori = calcH(g, ghy, { t: g.h-1 }); break;
				case (!_hd && ogh < s && ogh > -s): hori = calcH(g, ogh, { t: g.h-1 }); break;
			}
			// horizontal comparisons
			switch (true) {
				case (!_vd && dx  < s && dx  > -s): vert = calcV(g, dx);                break;
				case (!_vd && owx < s && owx > -s): vert = calcV(g, owx);               break;
				case (!_vd && ow1 < s && ow1 > -s): vert = calcV(g, ow1);               break;
				case (!_vd && ow2 < s && ow2 > -s): vert = calcV(g, ow2, { l: g.w });   break;
				case (!_vd && oxm < s && oxm > -s): vert = calcV(g, oxm, { l: g.mw });  break;
				case (!_vd && gwx < s && gwx > -s): vert = calcV(g, gwx, { l: g.w-1 }); break;
				case (!_vd && ogw < s && ogw > -s): vert = calcV(g, ogw, { l: g.w-1 }); break;
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
		this.lines.diagonal.css(data);
	}
}
