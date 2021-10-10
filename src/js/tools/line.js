
// eniac.tools.line

{
	init() {
		// fast references
		this.els = {
			root: window.find(".shape-tools"),
			doc: $(document),
			layout: window.find("layout"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools.line,
			Line = Self.line,
			el;
		switch (event.type) {
			// custom events
			case "blur-line":
				Self.els.root.addClass("hidden");
				// forget line
				Self.line = false;
				break;
			case "focus-line":
				// resize tools
				let top = parseInt(event.el.css("top"), 10),
					left = parseInt(event.el.css("left"), 10),
					width = parseInt(event.el.css("width"), 10),
					height = parseInt(event.el.css("height"), 10),
					deg, dx, dy;
				Self.els.root
					.css({ top, left, width, height })
					.removeClass("hidden");

				// remember shape
				let names = ["circle", "ellipse", "rect", "polygon", "polyline", "path", "line", "bezier", "image"];
				Self.line = event.el;
				Self.lineItem = event.el.find(names.join(","));

				let name = Self.lineItem.prop("nodeName");
				Self.els.root
					.removeClass(names.map(e => `is-${e}`).join(" "))
					.addClass(`is-${name}`);
				
				let d = (name === "path") ? Self.lineItem.attr("d").split(" ") : false;
				if (name === "line") {
					Self.lineAnchorMove({ type: "position-tool-anchors" });
				} if (d && d.length === 4) {
					Self.els.root.removeClass("is-path").addClass("is-bezier");
					Self.bezierMove({ type: "position-tool-anchors", d });
				}
				// update sidebar
				APP.sidebar.dispatch({ ...event, type: "show-line" });
				break;
		}
	},
	move(event) {
		let APP = eniac,
			Self = APP.tools.line,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// if mousedown on handle
				let el = $(event.target);
				if (el.hasClass("handle")) {
					if (el.hasClass("line")) {
						return Self.lineAnchorMove(event);
					}
				}
				// cover layout
				Self.els.layout.addClass("cover hideMouse hideTools");
				
				// assemble variables
				let line = Self.line,
					rect = event.target.getBoundingClientRect(),
					guides = new Guides({
						offset: {
							el: line[0],
							w: rect.width,
							h: rect.height,
						}
					});

				// create drag object
				Self.drag = {
					el: $([line[0], Self.els.root[0]]),
					guides,
					click: {
						x: event.clientX - parseInt(line.css("left"), 10),
						y: event.clientY - parseInt(line.css("top"), 10),
					}
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.move);
				break;
			case "mousemove":
				let pos = {
						top: event.clientY - Drag.click.y,
						left: event.clientX - Drag.click.x,
					};
				// "filter" position with guide lines
				Drag.guides.snapPos(pos);
				// move dragged object
				Drag.el.css(pos);
				break;
			case "mouseup":
				// hide guides
				Drag.guides.reset();
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse hideTools");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.move);
				break;
		}
	},
	lineAnchorMove(event) {
		let APP = eniac,
			Self = APP.tools.line,
			Drag = Self.drag;
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover hideMouse");

				// if mousedown on handle
				let el = $(event.target),
					pEl = el.parents(".shape-tools"),
					line = Self.lineItem,
					x = +el.prop("offsetLeft"),
					y = +el.prop("offsetTop"),
					r = +el.prop("offsetWidth") >> 1;

				if (Self.els.root.hasClass("is-bezier")) {
					return Self.bezierMove(event);
				}

				let guides = new Guides({
						offset: {
							el: Self.line[0],
							y: +pEl.prop("offsetTop") + 2,
							x: +pEl.prop("offsetLeft") + 2,
						}
					});

				// create drag object
				Self.drag = {
					el,
					line,
					guides,
					origo: {
						y: +pEl.prop("offsetTop"),
						x: +pEl.prop("offsetLeft"),
						r,
					},
					click: {
						x: event.clientX - x,
						y: event.clientY - y,
						i: +el.data("i")
					},
					updateLine(pos) {
						let data = {};
						data["y"+ this.click.i] = pos.top + 3;
						data["x"+ this.click.i] = pos.left + 3;
						this.line.attr(data);
					},
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.lineAnchorMove);
				break;
			case "mousemove":
				let pos = {
						top: event.clientY - Drag.click.y,
						left: event.clientX - Drag.click.x,
					};
				// "filter" position with guide lines
				Drag.guides.snapPos(pos);
				// apply position on anchor
				Drag.el.css(pos);
				// apply line variables
				Drag.updateLine(pos);
				break;
			case "mouseup": {
				// re-calculate shape pos & dimensions
				let m1 = Drag.origo.r,
					y1 = +Drag.line.attr("y1"),
					x1 = +Drag.line.attr("x1"),
					y2 = +Drag.line.attr("y2"),
					x2 = +Drag.line.attr("x2"),
					minY = Math.min(y1, y2),
					minX = Math.min(x1, x2),
					maxY = Math.max(y1, y2),
					maxX = Math.max(x1, x2),
					top = Drag.origo.y + minY - m1,
					left = Drag.origo.x + minX - m1,
					height = maxY - minY + (m1 * 2),
					width = maxX - minX + (m1 * 2),
					viewBox = `0 0 ${width} ${height}`,
					data = {};
				// re-calc line start + end
				x1 -= minX - m1; x2 -= minX - m1;
				y1 -= minY - m1; y2 -= minY - m1;
				if (Math.sqrt(y1*y1 + x1*x1) < Math.sqrt(y2*y2 + x2*x2)) {
					data.x1 = x1; data.x2 = x2;
					data.y1 = y1; data.y2 = y2;
				} else {
					data.x1 = x2; data.x2 = x1;
					data.y1 = y2; data.y2 = y1;
				}
				Drag.line.attr(data);

				// apply shape pos & dimensions
				Self.line
					.css({ top, left, width, height })
					.attr({ viewBox });
				// re-focus on line svg
				Self.dispatch({ type: "focus-shape", el: Self.line });
				// hide guides
				Drag.guides.reset();
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.lineAnchorMove);
				} break;
			// custom events
			case "position-tool-anchors":
				// position anchor points
				Self.els.root.find(".line[data-i]").map(item => {
					let el = $(item),
						i = +el.data("i"),
						top = +Self.lineItem.attr(`y${i}`) - 3,
						left = +Self.lineItem.attr(`x${i}`) - 3;
					el.css({ top, left });
				});
				break;
		}
	},
	bezierMove(event) {
		let APP = eniac,
			Self = APP.tools.line,
			Drag = Self.drag;
		switch (event.type) {
			// native events
			case "mousedown":
				// cover layout
				Self.els.layout.addClass("cover hideMouse");

				// if mousedown on handle
				let el = $(event.target),
					pEl = el.parents(".line-tools"),
					line = Self.lineItem,
					path = Self.bezierMove({ type: "bezier-to-array", d: line.attr("d").split(" ") }),
					x = +el.prop("offsetLeft"),
					y = +el.prop("offsetTop"),
					r = +el.prop("offsetWidth"),
					isAnchor = !el.hasClass("ap"),
					offset = { r: r/2, y, x: y },
					click = {
						x: event.clientX,
						y: event.clientY,
					},
					origo = {
						y: +pEl.prop("offsetTop"),
						x: +pEl.prop("offsetLeft"),
						m: 4,
					},
					updatePath,
					guides;

				// if mousedown on handle
				if (isAnchor) {
					click.y -= y;
					click.x -= x;
					click.i = +el.data("i") - 1;
					// prepare guides
					guides = new Guides({
						offset: {
							el: Self.line[0],
							x: +pEl.prop("offsetLeft") + 2,
							y: +pEl.prop("offsetTop") + 2,
						}
					});
					// anchor updater
					updatePath = function(pos) {
						// update anchor + point
						let i = this.click.i;
						this.path[i+2].x += pos.left - this.path[i].x + 3;
						this.path[i+2].y += pos.top - this.path[i].y + 3;
						this.path[i].x = pos.left + 3;
						this.path[i].y = pos.top + 3;
					};
				} else {
					let [a, b] = el.css("transform").split("(")[1].split(")")[0].split(","),
						rad = Math.atan2(a, b);
					// calculate "anchor point" offset
					origo = { y, x: y };
					offset.y = Math.round(y + r * Math.cos(rad));
					offset.x = Math.round(x + r * Math.sin(rad));
					pEl = el.parent();
					click.i = +pEl.data("i") + 1;
					offset.py = path[click.i].y;
					offset.px = path[click.i].x;
					// anchor point updater
					updatePath = function(y, x) {
						// update point
						let i = this.click.i;
						this.path[i].y = this.offset.py + y;
						this.path[i].x = this.offset.px + x;
					};
				}
				// create drag object
				Self.drag = {
					el,
					pEl,
					path,
					origo,
					line,
					click,
					offset,
					guides,
					isAnchor,
					updatePath,
					_round: Math.round,
					_sqrt: Math.sqrt,
					_atan2: Math.atan2,
					_PI: 180 / Math.PI,
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.bezierMove);
				break;
			case "mousemove":
				if (Drag.isAnchor) {
					let pos = {
							top: event.clientY - Drag.click.y,
							left: event.clientX - Drag.click.x,
						};
					// "filter" position with guide lines
					Drag.guides.snapPos(pos);
					// apply position on anchor
					Drag.el.css(pos);
					// apply anchor position
					Drag.updatePath(pos);
				} else {
					let my = event.clientY - Drag.click.y,
						mx = event.clientX - Drag.click.x,
						y = my - Drag.origo.y + Drag.offset.y,
						x = mx - Drag.origo.x + Drag.offset.x,
						deg = Drag._round(Drag._atan2(y, x) * Drag._PI),
						width = Drag._sqrt(y*y + x*x);
					// apply position on anchor point
					Drag.pEl.css({
						"--width": `${width}px`,
						"--deg": `${deg}deg`
					});
					// apply anchor point position
					Drag.updatePath(my, mx);
				}
				// UI apply new path
				Drag.line.attr({ d: Drag.path.serialize() });
				break;
			case "mouseup":
				if (Drag.isAnchor) {
					// re-calculate line pos & dimensions
					let m1 = Drag.origo.m,
						y1 = Drag.path[0].y,
						x1 = Drag.path[0].x,
						y2 = Drag.path[1].y,
						x2 = Drag.path[1].x,
						minY = Math.min(y1, y2),
						minX = Math.min(x1, x2),
						maxY = Math.max(y1, y2),
						maxX = Math.max(x1, x2),
						top = Drag.origo.y + minY - m1,
						left = Drag.origo.x + minX - m1,
						height = maxY - minY + (m1 * 2),
						width = maxX - minX + (m1 * 2),
						viewBox = `0 0 ${width} ${height}`;
					// move origo
					Drag.path.add(m1-minY, m1-minX);
					// UI apply new path
					Drag.line.attr({ d: Drag.path.serialize() });
					// apply line pos & dimensions
					Self.line
						.css({ top, left, width, height })
						.attr({ viewBox });
					// hide guides
					Drag.guides.reset();
					// re-focus on line svg
					Self.dispatch({ type: "focus-line", el: Self.line });
				}
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.bezierMove);
				break;
			// custom events
			case "position-tool-anchors":
				// console.log(event);
				let d = Self.bezierMove({ ...event, type: "bezier-to-array" });
				// iterate two anchor points
				Self.els.root.find(".line[data-i]").map(item => {
					let el = $(item),
						i = +el.data("i") - 1,
						top = d[i].y - 3,
						left = d[i].x - 3,
						a = d[i+2].y - d[i].y,
						b = d[i+2].x - d[i].x,
						rad = Math.atan2(a, b),
						deg = rad * 180 / Math.PI,
						width = Math.round(Math.sqrt(b*b + a*a));
					// apply anchor points UI
					el.css({
						top,
						left,
						"--width": `${width}px`,
						"--deg": `${deg}deg`
					});
				});
				break;
			case "bezier-to-array":
				let z = event.d,
					arr = [z[0].slice(1), z[3], z[1].slice(1), z[2]].map(p => {
						let [x, y] = p.split(",").map(a => +a);
						return { x, y };
					});
				// adds to every position
				arr.add = function(y, x) {
					return this.map(pos => {
						pos.y += y;
						pos.x += x;
						return pos;
					});
				};
				// serializer to bezier string
				arr.serialize = function() {
					return [
						`M${this[0].x},${this[0].y}`,
						`C${this[2].x},${this[2].y}`,
						`${this[3].x},${this[3].y}`,
						`${this[1].x},${this[1].y}`
					].join(" ");
				};
				return arr;
		}
	}
}
