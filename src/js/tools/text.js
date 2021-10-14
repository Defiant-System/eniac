
// eniac.tools.text

{
	init() {
		// fast references
		let root = window.find(".text-tools");
		this.els = {
			root,
			doc: $(document),
			layout: window.find("layout"),
			gradientTool: root.find(".gradient-tool"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Tools = APP.tools,
			Self = Tools.text,
			Text = Self.text,
			str,
			el;
		switch (event.type) {
			// custom events
			case "blur-text":
				Self.els.root.addClass("hidden");
				Self.els.gradientTool.addClass("hidden");
				break;
			case "focus-text":
				el = event.el;

				// resize tools
				let top = parseInt(el.css("top"), 10),
					left = parseInt(el.css("left"), 10),
					width = parseInt(el.css("width"), 10),
					height = parseInt(el.css("height"), 10);
				Self.els.root
					.css({ top, left, width, height })
					.removeClass("hidden");
				// hide gradient tools
				Self.els.gradientTool.addClass("hidden");

				let gradient = {},
					bg = el.css("background"),
					type = bg.match(/(linear|radial)-gradient\(([^()]*|\([^()]*\))*\)/g),
					switchType = function(type) {
						let el = Self.text,
							defStops = [{ offset: 0, color: "#ffffff" }, { offset: 100, color: "#336699" }],
							stops = this.stops || defStops,
							str = [],
							head,
							background;
						switch (type) {
							case "linear":
							case "radial":
								head = type === "linear" ? "to bottom" : "60px at 50px 40px";
								stops.map(s => str.push(`${s.color} ${s.offset}%`));
								background = `${type}-gradient(${head}, ${str.join(", ")})`;
								break;
							case "solid":
								background = "#336699";
								break;
						}
						Self.text.css({ background });
						// re-focus on shape
						Self.dispatch({ type: "focus-text", el });
					};

				if (type) {
					let str = type[0].match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(1|0\.\d+))?\) \d+./g),
						gradient = {
							el,
							switchType,
							type: type[0].slice(0,6),
							reverse() {
								let stops = [],
									str = [],
									head = `${this.deg}deg`;

								this.stops.map(s => stops.unshift({ ...s, offset: 100 - s.offset }));
								this.stops = stops;

								if (this.type === "radial") {
									let [a, width, left, top] = bg.match(/gradient\((\d+)px at (\d+)px (\d+)px/);
									head = `${width}px at ${left}px ${top}px`;
								}
								
								stops.map((s, i) => str.push(`${s.color} ${s.offset}%`));
								this.el.css({ background: `${this.type}-gradient(${head}, ${str.join(", ")})`});
							},
							stops: str.map(stop => ({
								color: Color.rgbToHex(stop.split(")")[0] +")"),
								offset: parseInt(stop.split(")")[1].trim(), 10),
							})),
							add(stop, index) {
								let stops = this.stops.map(({ offset, color }) => ({ offset, color }));
								stops.splice(index, 0, stop);
								this.update(stops);
							},
							update(stops) {
								let currStops = this.stops,
									reorder = stops.length !== currStops.length || stops.reduce((a, e, i) => a + (e.color !== currStops[i].color ? 1 : 0), 0),
									head = `${this.deg}deg`,
									str = [];

								if (this.type === "radial") {
									let bg = this.el.css("background"),
										[a, width, left, top] = bg.match(/gradient\((\d+)px at (\d+)px (\d+)px/);
									head = `${width}px at ${left}px ${top}px`;
								}
								
								stops.map((s, i) => str.push(`${s.color} ${s.offset}%`));
								this.el.css({ background: `${this.type}-gradient(${head}, ${str.join(", ")})`});
								
								this.stops = stops;
							}
						};

					if (gradient.type === "radial") {
						// unhide gradient tool
						Self.els.gradientTool.removeClass("hidden");

						[str, width, left, top] = bg.match(/gradient\((\d+)px at (\d+)px (\d+)px/);
						top = +top + 2;
						left = +left + 2;
						width = +width + 2;

						let rotation = Self.els.gradientTool.css("transform"),
							[a, b] = rotation.split("(")[1].split(")")[0].split(","),
							rad = Math.atan2(b, a);
						gradient.deg = Math.round(rad * 180 / Math.PI);
						if (gradient.deg < 0) gradient.deg += 360;
						
						// gradient tools for text-element
						Self.els.gradientTool.css({ top, left, width, transform: `rotate(${gradient.deg}deg)` });
					}
					// save reference to gradient
					Self.gradient = gradient;
				} else {
					// reset reference
					Self.gradient = { type: "solid", switchType };
				}
				// remember text element
				Self.text = el;
				break;
		}
	},
	move(event) {
		let APP = eniac,
			Self = APP.tools.text,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// if mousedown on handle
				let el = $(event.target),
					pEl = el.parent();
				if (el.hasClass("handle")) {
					if (el.parent().hasClass("gradient-tool")) {
						return Self.gradientMove(event);
					}
					return Self.resize(event);
				}

				// cover layout
				Self.els.layout.addClass("cover hideMouse hideTools");

				let text = Self.text,
					offset = {
						x: el.prop("offsetLeft"),
						y: el.prop("offsetTop"),
					},
					click = {
						x: event.clientX - offset.x,
						y: event.clientY - offset.y,
					},
					guides = new Guides({
						offset: {
							el: text,
							w: el.prop("offsetWidth"),
							h: el.prop("offsetHeight"),
						}
					});

				// create drag object
				Self.drag = {
					el: $([text[0], Self.els.root[0]]),
					guides,
					click,
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
	resize(event) {
		let APP = eniac,
			Self = APP.tools.text,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// cover layout
				Self.els.layout.addClass("cover");

				let text = Self.text,
					type = event.target.className.split(" ")[1],
					min = { w: 50 },
					click = {
						x: event.clientX,
					},
					offset = {
						x: +text.prop("offsetLeft"),
						w: +text.prop("offsetWidth"),
					};

				// create drag object
				Self.drag = {
					el: $([text[0], Self.els.root[0]]),
					min,
					type,
					click,
					offset,
				};

				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
				break;
			case "mousemove":
				let dim = { width: Drag.offset.w };
				// movement: east
				if (Drag.type.includes("e")) {
					dim.left = event.clientX - Drag.click.x + Drag.offset.x;
					dim.width = Drag.offset.w + Drag.click.x - event.clientX;
				}
				// movement: west
				if (Drag.type.includes("w")) {
					dim.width = event.clientX - Drag.click.x + Drag.offset.w;
				}

				// apply new dimensions to element
				if (dim.width < Drag.min.w) dim.width = Drag.min.w;
				Drag.el.css(dim);
				break;
			case "mouseup":
				// re-focuses shape tools
				Self.dispatch({ type: "focus-text", el: Self.text });
				// uncover layout
				Self.els.layout.removeClass("cover");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	},
	gradientMove(event) {
		let APP = eniac,
			Self = APP.tools.text,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover hideMouse");

				let el = $(event.target.parentNode),
					type = event.target.className.split(" ")[1],
					tEl = Self.text,
					iEl = APP.sidebar.els.el.find(".text-fill-options #text-gradient-angle"),
					x = +el.prop("offsetLeft"),
					y = +el.prop("offsetTop"),
					r = +el.prop("offsetWidth") - 2,
					[a, b] = el.css("transform").split("(")[1].split(")")[0].split(","),
					rad = Math.atan2(a, b),
					width = parseInt(tEl.css("width"), 10),
					height = parseInt(tEl.css("height"), 10),
					gradient = Self.gradient.stops.map(s => `${s.color} ${s.offset}%`).join(", "),
					click = {
						x: event.clientX,
						y: event.clientY,
					};

				// create drag object
				Self.drag = {
					el,
					tEl,
					iEl,
					type,
					click,
					gradient,
					origo: { x, y, r },
					offset: {
						width,
						height,
						y: Math.round(y + r * Math.cos(rad)),
						x: Math.round(x + r * Math.sin(rad)),
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
				let dY = event.clientY - Drag.click.y,
					dX = event.clientX - Drag.click.x;

				if (Drag.type === "p1") {
					let top = dY + Drag.origo.y,
						left = dX + Drag.origo.x;
					Drag.el.css({ top, left });
					// update text element
					let background = `radial-gradient(${Drag.origo.r}px at ${left-2}px ${top-2}px, ${Drag.gradient})`;
					Drag.tEl.css({ background });
				} else {
					// rotate
					let y = dY + Drag.offset.y - Drag.origo.y,
						x = dX + Drag.offset.x - Drag.origo.x,
						deg = Drag._round(Drag._atan2(y, x) * Drag._PI),
						width = Drag._round(Drag._sqrt(y*y + x*x))+2;
					if (deg < 0) deg += 360;
					Drag.el.css({ width, transform: `rotate(${deg}deg)` });
					// updates sidebar angle input value
					Drag.iEl.val(deg);
					// update text element
					let background = `radial-gradient(${width-2}px at ${Drag.origo.x-2}px ${Drag.origo.y-2}px, ${Drag.gradient})`;
					Drag.tEl.css({ background });
				}
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.gradientMove);
				break;
		}
	}
}
