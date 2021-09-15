
// eniac.tools.shape

{
	init() {
		// fast references
		let root = window.find(".shape-tools");
		this.els = {
			root,
			doc: $(document),
			layout: window.find("layout"),
			gradientTool: root.find(".gradient-tool"),
		};

		// bind event handlers
		this.els.root.on("mousedown", this.move);
		window.find("content > div.body").on("mousedown", event => {
			let el = $(event.target),
				body = el.parents("div.body");
			// let other handlers handle it
			if (el.hasClass("handle")) return;
			
			if (el.hasClass("shape")) {
				// blur table, if any
				Cursor.dispatch({ type: "blur-table", el: body });
				// focus shape
				this.dispatch({ type: "focus-shape", el });
				this.move(event);
			} else {
				this.dispatch({ type: "blur-shape", el: body });
			}
		});
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools.shape,
			Shape = Self.shape,
			el;
		switch (event.type) {
			// native events
			case "blur-shape":
				if (event.el.hasClass("body")) {
					Self.els.root.addClass("hidden");
					// forget shape
					Self.shape = false;
				}
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
				Self.shapeItem = event.el.find("circle, rect, polygon, polyline, path");
				// set "rounded corner" value
				let rc = Self.shapeItem.attr("rx") || 0;
				Self.els.root.css({ "--rc": rc +"px" });

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
									Self.gradient.stops = newStops;
								}
								stops.map((s, i) => this.stops[i].xNode.attr({ offset: s.offset +"%" }));
							}
						};
					switch (gradient.type) {
						case "radialGradient":
							top = +xNode.attr("cy") * height;
							left = +xNode.attr("cx") * width;
							width = +xNode.attr("r") * width;
							deg = 45;
							break;
						case "linearGradient":
							top = (+xNode.attr("y1") || 0) * height;
							left = (+xNode.attr("x1") || 0) * width;
							dy = (+xNode.attr("y2") * height) - top;
							dx = (+xNode.attr("x2") * width) - left;
							width = Math.round(Math.sqrt(dx*dx + dy*dy));
							deg = Math.atan2(dy, dx) * (180 / Math.PI);
							break;
					}
					Self.els.gradientTool
						.css({ top, left, width, transform: `rotate(${deg}deg)` })
						.removeClass("hidden");
					// save reference to gradient
					Self.gradient = gradient;
				} else {
					Self.els.gradientTool.addClass("hidden");
					Self.fill = Color.rgbToHex(fill);
					// reset reference
					Self.gradient = { type: "solid", switchType };
				}
				// update sidebar
				APP.sidebar.dispatch({ ...event, type: "show-shape" });
				break;
		}
	},
	resize(event) {
		let APP = eniac,
			Self = APP.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// cover layout
				Self.els.layout.addClass("cover hideMouse");

				let svg = Self.shape,
					shape = Self.shapeItem,
					rect = Self.shapeItem.prop("nodeName") === "rect",
					el = $([svg[0], Self.els.root[0]]),
					type = event.target.className.split(" ")[1];
				// create drag object
				Self.drag = {
					el,
					type,
					rect,
					svg,
					shape,
					click: {
						x: event.clientX,
						y: event.clientY,
					},
					offset: {
						x: parseInt(svg.css("left"), 10),
						y: parseInt(svg.css("top"), 10),
						w: parseInt(svg.css("width"), 10),
						h: parseInt(svg.css("height"), 10),
						rx: +shape.attr("rx"),
					}
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
				break;
			case "mousemove":
				let data = {
						width: Drag.offset.w,
						height: Drag.offset.h,
					};
				if (Drag.type.includes("n")) {
					data.top = event.clientY - Drag.click.y + Drag.offset.y;
					data.height = Drag.offset.h + Drag.click.y - event.clientY;
				}
				if (Drag.type.includes("e")) {
					data.left = event.clientX - Drag.click.x + Drag.offset.x;
					data.width = Drag.offset.w + Drag.click.x - event.clientX;
				}
				if (Drag.type.includes("s")) {
					data.height = event.clientY - Drag.click.y + Drag.offset.h;
				}
				if (Drag.type.includes("w")) {
					data.width = event.clientX - Drag.click.x + Drag.offset.w;
				}
				Drag.el.css(data);
				// special handling for rect-element
				if (Drag.rect) {
					if (Drag.offset.rx) {
						let w = parseInt(Drag.shape.css("width"), 10),
							h = parseInt(Drag.shape.css("height"), 10),
							rx = Math.min(Drag.offset.rx, (Math.min(w, h)-2)/2);
						Drag.shape.attr({ rx });
					}
					Drag.svg.attr({ viewBox: `0 0 ${data.width} ${data.height}` });
				}
				// re-focuses shape tools
				Self.dispatch({ type: "focus-shape", el: Drag.svg });
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	},
	move(event) {
		let APP = eniac,
			Self = APP.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// if mousedown on handle
				let el = $(event.target),
					shape = Self.shape;
				if (el.hasClass("handle")) {
					if (el.hasClass("rc")) {
						return Self.rectCornersMove(event);
					}
					if (el.parent().hasClass("gradient-tool")) {
						return Self.gradientMove(event);
					}
					return Self.resize(event);
				}
				
				el = $([shape[0], Self.els.root[0]]);
				// create drag object
				Self.drag = {
					el,
					click: {
						x: event.clientX,
						y: event.clientY,
					},
					offset: {
						x: parseInt(shape.css("left"), 10),
						y: parseInt(shape.css("top"), 10),
					}
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.move);
				break;
			case "mousemove":
				let top = event.clientY - Drag.click.y + Drag.offset.y,
					left = event.clientX - Drag.click.x + Drag.offset.x;
				Drag.el.css({ top, left });
				break;
			case "mouseup":
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.move);
				break;
		}
	},
	rectCornersMove(event) {
		let APP = eniac,
			Self = APP.tools.shape,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover hideMouse");

				let shape = Self.shapeItem,
					el = $(event.target),
					pEl = el.parent(),
					type = el.prop("className").split(" ")[2],
					offset = {
						x: +el.prop("offsetLeft"),
						y: +el.prop("offsetTop"),
						w: parseInt(shape.css("width"), 10),
						h: parseInt(shape.css("height"), 10),
					},
					radius = {
						min: (Math.min(offset.w, offset.h) / 2) - 1,
						max: (Math.max(offset.w, offset.h) / 2) + 3,
					},
					normalize = {
						x: 0,
						y: 0
					},
					ratio = offset.w / offset.h;
				// this can most likely be written better
				if (ratio !== 1) {
					switch (type) {
						case "ne": break;
						case "nw":
							normalize.x = ratio < 1 ? 0 : -radius.max;
							normalize.y = ratio < 1 ? 0 : -radius.max;
							break;
						case "sw":
							normalize.x = -radius.max;
							normalize.y = -radius.max;
							break;
						case "se":
							normalize.x = ratio > 1 ? 0 : -radius.max;
							normalize.y = ratio > 1 ? 0 : -radius.max;
							break;
					}
				}
				// create drag object
				Self.drag = {
					el,
					pEl,
					type,
					shape,
					radius,
					offset,
					normalize,
					click: {
						x: event.clientX - offset.x,
						y: event.clientY - offset.y,
					},
					getRadius(x, y) {
						let norm = this.normalize,
							rm = this.radius.min,
							rx;
						// console.log(this.type);
						switch (this.type) {
							case "ne": rx = Math.min(Math.max(rm - x + norm.x, rm - y + norm.y, 0), rm); break;
							case "nw": rx = Math.min(Math.max(x + norm.x - rm, -y + norm.y - rm, 0), rm); break;
							case "sw": rx = Math.min(Math.max(x + norm.x - rm, y + norm.y - rm, 0), rm); break;
							case "se": rx = Math.min(Math.max(-x + norm.x - rm, y + norm.y - rm, 0), rm); break;
						}
						return rm - rx;
					}
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.rectCornersMove);
				break;
			case "mousemove":
				let x = event.clientX - Drag.click.x,
					y = event.clientY - Drag.click.y,
					rx = Drag.getRadius(x, y);
				
				// Drag.el.css({ top: y, left: x });
				Drag.pEl.css({ "--rc": rx +"px" });
				Drag.shape.attr({ rx });
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
			Self = APP.tools.shape,
			Drag = Self.drag,
			Gradient = Self.gradient;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover hideMouse");

				let input = APP.sidebar.els.el.find("input#shape-gradient-angle"),
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
				// cover layout
				Self.els.layout.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.gradientMove);
				break;
		}
	}
}
