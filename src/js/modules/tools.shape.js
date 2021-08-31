
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
				let top = +event.el.prop("offsetTop"),
					left = +event.el.prop("offsetLeft"),
					width = +event.el.prop("offsetWidth"),
					height = +event.el.prop("offsetHeight"),
					deg, dx, dy;
				Self.els.root
					.css({ top, left, width, height })
					.removeClass("hidden");

				// gradient tools
				let fill = event.el.find("circle, rect, polygon, path").css("fill");
				if (fill.startsWith("url(")) {
					let xNode = event.el.find(fill.slice(5,-2)),
						gradient = {
							xNode,
							type: xNode.prop("nodeName"),
							stops: xNode.find("stop").map(x => ({
								offset: parseInt(x.getAttribute("offset"), 10),
								color: x.getAttribute("stop-color"),
							})),
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
					Self.gradient = gradient;
				} else {
					Self.els.gradientTool.addClass("hidden");
					Self.gradient = {};
				}

				// remember shape
				Self.shape = event.el;
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
				let shape = Self.shape,
					el = $([shape[0], Self.els.root[0]]),
					type = event.target.className.split(" ")[1];
				// create drag object
				Self.drag = {
					el,
					type,
					clickX: event.clientX,
					clickY: event.clientY,
					offset: {
						x: +shape.prop("offsetLeft"),
						y: +shape.prop("offsetTop"),
						w: +shape.prop("offsetWidth"),
						h: +shape.prop("offsetHeight"),
					}
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
				break;
			case "mousemove":
				let data = {};
				if (Drag.type.includes("n")) {
					data.top = event.clientY - Drag.clickY + Drag.offset.y;
					data.height = Drag.offset.h + Drag.clickY - event.clientY;
				}
				if (Drag.type.includes("e")) {
					data.left = event.clientX - Drag.clickX + Drag.offset.x;
					data.width = Drag.offset.w + Drag.clickX - event.clientX;
				}
				if (Drag.type.includes("s")) {
					data.height = event.clientY - Drag.clickY + Drag.offset.h;
				}
				if (Drag.type.includes("w")) {
					data.width = event.clientX - Drag.clickX + Drag.offset.w;
				}
				Drag.el.css(data);
				break;
			case "mouseup":
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	},
	move(event) {
		let APP = eniac,
			Self = APP.tools.shape,
			Drag = Self.drag,
			shape,
			el;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// if mousedown on handle
				el = $(event.target);
				if (el.hasClass("handle")) {
					if (el.parent().hasClass("gradient-tool")) {
						return Self.gradientMove(event);
					}
					return Self.resize(event);
				}
				
				shape = Self.shape;
				el = $([shape[0], Self.els.root[0]]);
				// create drag object
				Self.drag = {
					el,
					clickX: event.clientX,
					clickY: event.clientY,
					offset: {
						x: +shape.prop("offsetLeft"),
						y: +shape.prop("offsetTop"),
					}
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.move);
				break;
			case "mousemove":
				let top = event.clientY - Drag.clickY + Drag.offset.y,
					left = event.clientX - Drag.clickX + Drag.offset.x;
				Drag.el.css({ top, left });
				break;
			case "mouseup":
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.move);
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

				let el = $(event.target.parentNode),
					type = event.target.className.split(" ")[1],
					[a, b] = el.css("transform").split("(")[1].split(")")[0].split(","),
					rad = Math.atan2(a, b),
					x = +el.prop("offsetLeft"),
					y = +el.prop("offsetTop"),
					r = +el.prop("offsetWidth"),
					width = +Self.shape.prop("offsetWidth"),
					height = +Self.shape.prop("offsetHeight");
				
				if (Gradient.type === "radialGradient") {
					Gradient.moveP1 = (cx, cy) => Gradient.xNode.attr({ cx, cy });
					Gradient.moveP2 = (x, y, r) => Gradient.xNode.attr({ r });
				} else {
					Gradient.moveP1 = (x1, y1, x2, y2) => Gradient.xNode.attr({ x1, y1, x2, y2 });
					Gradient.moveP2 = (x2, y2) => Gradient.xNode.attr({ x2, y2 });
				}

				// create drag object
				Self.drag = {
					el,
					type,
					gradient: Self.gradient,
					clickX: event.clientX,
					clickY: event.clientY,
					origo: { x, y, r },
					offset: {
						width,
						height,
						y: x + r * Math.cos(rad),
						x: y + r * Math.sin(rad),
					},
					p2: {
						y: +Self.gradient.xNode.attr("y2") * height,
						x: +Self.gradient.xNode.attr("x2") * width,
					},
					_round: Math.round,
					_sqrt: Math.sqrt,
					_atan2: Math.atan2,
					_PI: 180 / Math.PI,
				};

				// bind event
				Self.els.doc.on("mousemove mouseup", Self.gradientMove);
				break;
			case "mousemove":
				if (Drag.type === "p1") {
					let dY = event.clientY - Drag.clickY,
						dX = event.clientX - Drag.clickX,
						top = dY + Drag.origo.y,
						left = dX + Drag.origo.x,
						y2 = dY + Drag.p2.y,
						x2 = dX + Drag.p2.x,
						oW = Drag.offset.width,
						oH = Drag.offset.height;
					Drag.el.css({ top, left });
					// UI change gradient
					Gradient.moveP1(left/oW, top/oH, x2/oW, y2/oH);
				} else {
					// rotate
					let y = event.clientY - Drag.clickY - Drag.origo.y + Drag.offset.y,
						x = event.clientX - Drag.clickX - Drag.origo.x + Drag.offset.x,
						deg = Drag._round(Drag._atan2(y, x) * Drag._PI),
						width = Drag._sqrt(y*y + x*x),
						oW = Drag.offset.width,
						oH = Drag.offset.height;
					if (deg < 0) deg += 360;
				console.log( deg );
					Drag.el.css({ width, transform: `rotate(${deg}deg)` });
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
