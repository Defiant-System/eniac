
// eniac.spawn.tools.shape

{
	init() {
		this.els = {};
	},
	dispatch(event) {
		let APP = eniac,
			Tools = APP.spawn.tools,
			Self = Tools.shape,
			Shape = Self.shape,
			Spawn = event.spawn,
			el;
		switch (event.type) {
			// system events
			case "spawn.blur":
				Self.els = {};
				break;
			case "spawn.focus":
				// fast references
				let root = Spawn.find(".shape-tools");
				Self.els = {
					root,
					doc: $(document),
					layout: Spawn.find("layout"),
					body: Spawn.find("content > div.body"),
					gradientTool: root.find(".gradient-tool"),
				};
				break;

			// custom events
			case "blur-shape":
				if (!Self.els.root) return;

				Self.els.root.addClass("hidden");
				Self.els.gradientTool.addClass("hidden");
				// forget shape
				Self.shape = false;
				break;
			case "focus-shape":
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
				Self.shape = event.el;
				Self.shapeItem = event.el.find(Tools.shapeTypes.join(","));
				// set "rounded corner" value & reset handles
				let name = Self.shapeItem.prop("nodeName"),
					rc = Self.shapeItem.attr("rx") || 0;
				Self.els.root
					.addClass(`is-${name}`)
					.css({ "--rc": (rc-3) +"px" })
					.find(".rc").removeAttr("style");

				// gradient tools
				let fill = Self.shapeItem.css("fill"),
					switchType = function(type) {
						let el = Self.shape,
							defStops = [{ offset: 0, color: "#ffffff" }, { offset: 100, color: "#336699" }],
							stops = this.stops || defStops,
							htm = [],
							xGradient,
							fill,
							id;
						switch (type) {
							case "linearGradient":
								// gradient id
								id = Self.shapeItem.css("fill");
								id = id.startsWith("url(") ? id.slice(6,-2) : "s"+ Date.now();
								fill = `url(#${id})`;
								// prepare gradient html
								htm.push(`<linearGradient id="${id}" x1=".5" y1=".1" x2=".5" y2=".9">`);
								stops.map(s => htm.push(`<stop offset="${s.offset}%" stop-color="${s.color}"></stop>`));
								htm.push(`</linearGradient>`);
								// create gradient node and replace existing
								xGradient = $(`<svg>${htm.join("")}</svg>`)[0].firstChild;
								
								if (this.xNode) this.xNode.replace(xGradient);
								else Self.shapeItem.before(xGradient);
								break;
							case "radialGradient":
								// gradient id
								id = Self.shapeItem.css("fill");
								id = id.startsWith("url(") ? id.slice(6,-2) : "s"+ Date.now();
								fill = `url(#${id})`;
								// prepare gradient html
								htm.push(`<radialGradient id="${id}" cx="0.5" cy="0.5" r="0.5">`);
								stops.map(s => htm.push(`<stop offset="${s.offset}%" stop-color="${s.color}"></stop>`));
								htm.push(`</radialGradient>`);
								// create gradient node and replace existing
								xGradient = $(`<svg>${htm.join("")}</svg>`)[0].firstChild;
								
								if (this.xNode) this.xNode.replace(xGradient);
								else Self.shapeItem.before(xGradient);
								break;
							case "solid":
								if (this.xNode) this.xNode.remove();
								fill = "#336699";

								break;
						}
						Self.shapeItem.css({ fill });
						// re-focus on shape
						Self.dispatch({ type: "focus-shape", el });
					};
				if (fill.startsWith("url(")) {
					let xNode = event.el.find(fill.slice(5,-2)),
						gradient = {
							xNode,
							switchType,
							type: xNode.prop("nodeName"),
							reverse() {
								let stops = [],
									htm = [];
								// prepare gradient html
								this.stops.map(s => htm.unshift(`<stop offset="${100 - s.offset}%" stop-color="${s.color}"></stop>`));
								// replace gradient stops
								this.xNode[0].innerHTML = htm.join("");
								// update stops array
								this.stops = this.xNode.find("stop").map((x, index) => ({
									index,
									xNode: $(x),
									offset: parseInt(x.getAttribute("offset"), 10),
									color: x.getAttribute("stop-color"),
								}));
							},
							stops: xNode.find("stop").map((x, index) => ({
								index,
								xNode: $(x),
								offset: parseInt(x.getAttribute("offset"), 10),
								color: x.getAttribute("stop-color"),
							})),
							add(stop, index) {
								let stops = this.stops.map(({ offset, color }) => ({ offset, color }));
								stops.splice(index, 0, stop);
								this.update(stops);
							},
							update(stops) {
								let reorder = stops.length !== this.stops.length || stops.reduce((a, e, i) => a + (e.color !== this.stops[i].color ? 1 : 0), 0);
								if (reorder) {
									let htm = stops.map(stop => `<stop offset="${stop.offset}%" stop-color="${stop.color}" />`),
										newStops = this.xNode.html(htm.join(""))
													.find("stop").map((x, index) => ({
														index,
														xNode: $(x),
														offset: parseInt(x.getAttribute("offset"), 10),
														color: x.getAttribute("stop-color"),
													}));
									this.stops = newStops;
									// Self.gradient.stops = newStops;
								}
								stops.map((s, i) => this.stops[i].xNode.attr({ offset: s.offset +"%" }));
							}
						};
					switch (gradient.type) {
						case "radialGradient":
							top = (+xNode.attr("cy") * height) + 1;
							left = (+xNode.attr("cx") * width) + 1;
							width = +xNode.attr("r") * width;
							deg = 45;
							break;
						case "linearGradient":
							top = ((+xNode.attr("y1") || 0) * height) + 1;
							left = ((+xNode.attr("x1") || 0) * width) + 1;
							dy = (+xNode.attr("y2") * height) - top + 1;
							dx = (+xNode.attr("x2") * width) - left + 1;
							width = Math.round(Math.sqrt(dx*dx + dy*dy));
							deg = Math.round(Math.atan2(dy, dx) * (180 / Math.PI));
							break;
					}
					Self.els.gradientTool
						.css({ top, left, width, transform: `rotate(${deg}deg)` })
						.removeClass("hidden");
					// save reference to gradient
					Self.gradient = gradient;
				} else {
					Self.fill = Color.rgbToHex(fill);
					// reset reference
					Self.gradient = { type: "solid", switchType };
					// hide gradient tools
					Self.els.gradientTool.addClass("hidden");
				}
				// update sidebar
				APP.spawn.sidebar.dispatch({ ...event, type: "show-shape" });
				break;
			case "update-gradient-rotation":
				let Y1 = +Self.gradient.xNode.attr("y1"),
					X1 = +Self.gradient.xNode.attr("x1"),
					Y2 = +Self.gradient.xNode.attr("y2"),
					X2 = +Self.gradient.xNode.attr("x2"),
					dY = Y2 - Y1,
					dX = X2 - X1,
					r = Math.sqrt(dY*dY + dX*dX),
					rad = +event.value * (Math.PI / 180),
					y2 = Number.parseFloat(Y1 + r * Math.sin(rad)).toFixed(2),
					x2 = Number.parseFloat(X1 + r * Math.cos(rad)).toFixed(2);
				Self.gradient.xNode.attr({ x2, y2 });
				Self.els.gradientTool.css({ transform: `rotate(${event.value}deg)` })
				break;
		}
	},
	isLine(shape) {
		let Tools = eniac.spawn.tools,
			lineItem = shape.find(Tools.shapeTypes.join(",")),
			name = lineItem.prop("nodeName"),
			d = (name === "path") ? lineItem.attr("d").split(" ") : false,
			type = name === "line" ? "line" : "shape";

		if (d && d.length === 4) type = "line";

		return type === "line";
	},
	move(event) {
		let APP = eniac,
			Self = APP.spawn.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// if mousedown on handle
				let el = $(event.target);
				if (el.hasClass("handle")) {
					if (el.hasClass("rc")) {
						return Self.rectCornersMove(event);
					}
					if (el.parent().hasClass("gradient-tool")) {
						return Self.gradientMove(event);
					}
					return Self.resize(event);
				}
				// cover layout
				Self.els.layout.addClass("cover hideMouse hideTools");
				
				// assemble variables
				let shape = Self.shape,
					rect = event.target.getBoundingClientRect(),
					guides = new Guides({
						offset: {
							el: shape[0],
							w: rect.width,
							h: rect.height,
						}
					});
				// create drag object
				Self.drag = {
					el: $([shape[0], Self.els.root[0]]),
					sidebar: APP.spawn.sidebar.shape,
					guides,
					click: {
						x: event.clientX - parseInt(shape.css("left"), 10),
						y: event.clientY - parseInt(shape.css("top"), 10),
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
				// update sidebar
				Drag.sidebar.dispatch({ type: "update-shape-box-position" });
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
	resize(event) {
		let APP = eniac,
			Self = APP.spawn.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// cover layout
				Self.els.layout.addClass("cover resize-only hideMouse");

				let svg = Self.shape,
					shape = Self.shapeItem,
					rect = Self.shapeItem.prop("nodeName") === "rect",
					el = $([svg[0], Self.els.root[0]]),
					type = event.target.className.split(" ")[1],
					min = {
						w: 50,
						h: 50,
					},
					click = {
						x: event.clientX,
						y: event.clientY,
					},
					offset = {
						x: parseInt(svg.css("left"), 10),
						y: parseInt(svg.css("top"), 10),
						w: parseInt(svg.css("width"), 10),
						h: parseInt(svg.css("height"), 10),
						rx: +shape.attr("rx"),
					},
					guides = new Guides({
						offset: { el: svg[0], ...offset, type }
					});
				// create drag object
				Self.drag = {
					el,
					type,
					rect,
					svg,
					min,
					shape,
					click,
					offset,
					guides,
					sidebar: APP.spawn.sidebar.shape,
					_min: Math.min,
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
				break;
			case "mousemove":
				let dim = {
						width: Drag.offset.w,
						height: Drag.offset.h,
					};
				// movement: north
				if (Drag.type.includes("n")) {
					dim.top = event.clientY - Drag.click.y + Drag.offset.y;
					dim.height = Drag.offset.h + Drag.click.y - event.clientY;
				}
				// movement: east
				if (Drag.type.includes("e")) {
					dim.left = event.clientX - Drag.click.x + Drag.offset.x;
					dim.width = Drag.offset.w + Drag.click.x - event.clientX;
				}
				// movement: south
				if (Drag.type.includes("s")) {
					dim.height = event.clientY - Drag.click.y + Drag.offset.h;
				}
				// movement: west
				if (Drag.type.includes("w")) {
					dim.width = event.clientX - Drag.click.x + Drag.offset.w;
				}
				// "filter" position with guide lines
				Drag.guides.snapDim(dim);

				// apply new dimensions to element
				if (dim.width < Drag.min.w) dim.width = Drag.min.w;
				if (dim.height < Drag.min.h) dim.height = Drag.min.h;
				Drag.el.css(dim);
				// special handling for rect-element
				if (Drag.rect) {
					Drag.svg.attr({ viewBox: `0 0 ${dim.width} ${dim.height}` });
				}
				// update sidebar
				Drag.sidebar.dispatch({ type: "update-shape-box-size" });
				break;
			case "mouseup":
				// hide guides
				Drag.guides.reset();
				// uncover layout
				Self.els.layout.removeClass("cover resize-only hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				// re-focuses shape tools
				Self.dispatch({ type: "focus-shape", el: Drag.svg });
				break;
		}
	},
	rectCornersMove(event) {
		let APP = eniac,
			Self = APP.spawn.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover hideMouse");

				let el = $(event.target),
					pEl = el.parents(".shape-tools"),
					type = el.prop("className").split(" ")[2],
					shape = Self.shapeItem,
					[t, l, vW, vH] = Self.shape.attr("viewBox").split(" "),
					offset = {
						l: +el.prop("offsetLeft"),
						t: +el.prop("offsetTop"),
						x: parseInt(shape.css("x"), 10),
						w: parseInt(shape.css("width"), 10),
						h: parseInt(shape.css("height"), 10),
					},
					ratio = offset.w / offset.h,
					origo = {
						x: vW >> 1,
						y: vH >> 1,
						r: (Math.min(offset.w, offset.h) >> 1),
					};
				// calculate origo for handles
				if (ratio != 1) {
					switch (type) {
						case "ne":
							origo.x = ratio > 1 ? vH >> 1 : origo.x;
							origo.y = ratio < 1 ? vW >> 1 : origo.y;
							break;
						case "nw":
							origo.x = ratio > 1 ? vW - (vH >> 1) : origo.x;
							origo.y = ratio < 1 ? vW >> 1 : origo.y;
							break;
						case "sw":
							origo.x = ratio > 1 ? vW - (vH >> 1) : origo.x;
							origo.y = ratio < 1 ? vH - (vW >> 1) : origo.y;
							break;
						case "se":
							origo.x = ratio > 1 ? vH >> 1 : origo.x;
							origo.y = ratio < 1 ? vH - (vW >> 1) : origo.y;
							break;
					}
				}
				// create drag object
				Self.drag = {
					el,
					pEl,
					shape,
					type,
					origo,
					offset,
					click: {
						x: event.clientX - offset.l,
						y: event.clientY - offset.t,
					},
					getRadius(x, y) {
						let min = Math.min,
							o = this.origo,
							v;
						switch (this.type) {
							case "ne": v = min(o.y-y, o.x-x, o.r); break;
							case "nw": v = min(o.y-y, x-o.x, o.r); break;
							case "sw": v = min(y-o.y, x-o.x, o.r); break;
							case "se": v = min(y-o.y, o.x-x, o.r); break;
						}
						return min(Math.max(o.r-v, 0), o.r);
					},
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.rectCornersMove);
				break;
			case "mousemove":
				let x = event.clientX - Drag.click.x,
					y = event.clientY - Drag.click.y,
					rx = Drag.getRadius(x, y);
				Drag.pEl.css({ "--rc": (rx-3) +"px" });
				Drag.shape.attr({ rx: rx });
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.rectCornersMove);
				break;
		}
	},
	gradientMove(event) {
		let APP = eniac,
			Self = APP.spawn.tools.shape,
			Drag = Self.drag,
			Gradient = Self.gradient;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover hideMouse");

				let input = APP.spawn.sidebar.els.el.find(".shape-gradient-angle input"),
					el = $(event.target.parentNode),
					type = event.target.className.split(" ")[1],
					[a, b] = el.css("transform").split("(")[1].split(")")[0].split(","),
					rad = Math.atan2(a, b),
					x = +el.prop("offsetLeft"),
					y = +el.prop("offsetTop"),
					r = +el.prop("offsetWidth"),
					width = parseInt(Self.shape.css("width"), 10),
					height = parseInt(Self.shape.css("height"), 10);
				// create drag object
				Self.drag = {
					el,
					type,
					input,
					gradient: Self.gradient,
					origo: { x, y, r },
					click: {
						x: event.clientX,
						y: event.clientY,
					},
					offset: {
						width,
						height,
						y: y + r * Math.cos(rad),
						x: x + r * Math.sin(rad),
					},
					_round: Math.round,
					_sqrt: Math.sqrt,
					_atan2: Math.atan2,
					_PI: 180 / Math.PI,
				};
				// drag functions
				if (Gradient.type === "radialGradient") {
					Gradient.moveP1 = (cx, cy) => Gradient.xNode.attr({ cx, cy });
					Gradient.moveP2 = (x, y, r) => Gradient.xNode.attr({ r });
				} else {
					Gradient.moveP1 = (x1, y1, x2, y2) => Gradient.xNode.attr({ x1, y1, x2, y2 });
					Gradient.moveP2 = (x2, y2) => Gradient.xNode.attr({ x2, y2 });
				}
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.gradientMove);
				break;
			case "mousemove":
				if (Drag.type === "p1") {
					let dY = event.clientY - Drag.click.y,
						dX = event.clientX - Drag.click.x,
						top = dY + Drag.origo.y,
						left = dX + Drag.origo.x,
						y2 = dY + Drag.offset.y,
						x2 = dX + Drag.offset.x,
						oW = Drag.offset.width,
						oH = Drag.offset.height;
					Drag.el.css({ top, left });
					// UI change gradient
					Gradient.moveP1(left/oW, top/oH, x2/oW, y2/oH);
				} else {
					// rotate
					let y = event.clientY - Drag.click.y + Drag.offset.y - Drag.origo.y,
						x = event.clientX - Drag.click.x + Drag.offset.x - Drag.origo.x,
						deg = Drag._round(Drag._atan2(y, x) * Drag._PI),
						width = Drag._sqrt(y*y + x*x),
						oW = Drag.offset.width,
						oH = Drag.offset.height;
					if (deg < 0) deg += 360;
					Drag.el.css({ width, transform: `rotate(${deg}deg)` });
					// updates sidebar angle input value
					Drag.input.val(deg);
					// UI change gradient
					Gradient.moveP2((Drag.origo.x+x)/oW, (Drag.origo.y+y)/oH, width/oW);
				}
				break;
			case "mouseup":
				// update angle ring
				let angle = +Drag.input.val() + 90;
				Drag.input.parent().find(".angle-ring").css({ transform: `rotate(${angle}deg)` });
				// cover layout
				Self.els.layout.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.gradientMove);
				break;
		}
	}
}
