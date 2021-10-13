
// eniac.tools.text

{
	init() {
		// fast references
		let root = window.find(".text-tools");
		this.els = {
			root,
			doc: $(document),
			layout: window.find("layout"),
			gradientBox: root.find(".gradient-box"),
			// gradientTool: root.find(".gradient-tool"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Tools = APP.tools,
			Self = Tools.text,
			Text = Self.text,
			el;
		switch (event.type) {
			// custom events
			case "blur-text":
				Self.els.root.addClass("hidden");
				Self.els.gradientBox.addClass("hidden");
				break;
			case "focus-text":
				el = event.el;

				// resize tools
				let top = parseInt(el.css("top"), 10),
					left = parseInt(el.css("left"), 10),
					width = parseInt(el.css("width"), 10),
					height = parseInt(el.css("height"), 10),
					deg;
				Self.els.root
					.css({ top, left, width, height })
					.removeClass("hidden");

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
								head = type === "linear" ? "to bottom" : "circle 60px at 50px 40px";
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
									head = this.type === "linear" ? "to bottom" : "circle 60px at 50px 40px",
									str = [];

								if (reorder) this.stops = stops;
								stops.map((s, i) => str.push(`${s.color} ${s.offset}%`));

								this.el.css({ background: `${this.type}-gradient(${head}, ${str.join(", ")})`});
							}
						};
					switch (gradient.type) {
						case "radial":
							break;
						case "linear":
							[left, top] = el.css("background-position").split(" ").map(n => parseInt(n, 10));
							[width, height] = el.css("background-size").split(" ").map(n => parseInt(n, 10));;
							top += 4;
							left += 4;
							width -= 2;
							height -= 2;
							deg = 45;

							// gradient tools for text-element
							Self.els.gradientBox
								.css({ top, left, width, height, "--deg": `${deg}deg` })
								.removeClass("hidden");
							break;
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
					if (pEl.hasClass("gradient-tool") || pEl.hasClass("gradient-box")) {
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
			Gradient = Self.gradient,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover hideMouse");

				let text = Self.text,
					el = $(event.target).parents(".gradient-box"),
					type = event.target.className.split(" ")[1],
					click = {
						y: event.clientY,
						x: event.clientX,
					},
					offset = {
						y: el.prop("offsetTop"),
						x: el.prop("offsetLeft"),
						w: el.prop("offsetWidth"),
						h: el.prop("offsetHeight"),
						a: parseInt(el.css("--deg"), 10)
					};

				switch (type) {
					case "a1":
					case "p1": click.y -= offset.y; click.x -= offset.x; break;
					case "p2": click.y -= offset.h; click.x -= offset.w; break;
				}

				// create drag object
				Self.drag = {
					el,
					text,
					type,
					click,
					offset,
					_round: Math.round,
					_atan2: Math.atan2,
					_PI: 180 / Math.PI,
				};

				// bind event
				Self.els.doc.on("mousemove mouseup", Self.gradientMove);
				break;
			case "mousemove":
				let y = event.clientY - Drag.click.y,
					x = event.clientX - Drag.click.x,
					data = {},
					bg = {};
				switch (Drag.type) {
					case "p1":
						data.top = y;
						data.left = x;
						bg["background-position"] = `${x-4}px ${y-4}px`;
						break;
					case "p2":
						data.height = y;
						data.width = x;
						bg["background-size"] = `${x+2}px ${y+2}px`;
						break;
					case "a1":
						let deg = Drag._round(Drag._atan2(y, x) * Drag._PI);
						if (deg < 0) deg += 360;
						data["--deg"] = `${deg}deg`;
						break;
				}
				// apply "background"
				Drag.text.css(bg);
				// move gradient box
				Drag.el.css(data);
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
