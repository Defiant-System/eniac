
// eniac.sidebar.shape

{
	init(parent) {
		// fast reference
		this.parent = parent;
		// bind event handlers
		parent.els.el.on("mousedown", ".gradient-colors", this.gradientPoints);

		// temp
		// setTimeout(() => {
		// 	let target = this.parent.els.el.find(".gradient-colors .point:nth(0)")[0];
		// 	eniac.popups.dispatch({ type: "popup-color-ring", target });
		// }, 500);
		setTimeout(() => {
			eniac.sidebar.shape.dispatch({ type: "set-shape-shadow" });
		}, 300);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar.shape,
			Els = APP.sidebar.els,
			Shape = event.shape || APP.tools.shape,
			name,
			fill,
			value,
			width,
			el;
		switch (event.type) {
			case "select-fill-type":
				// update tabs
				el = $(event.target);
				el.parent().find(".active_").removeClass("active_");
				el.addClass("active_");
				// update tab body
				el.parents(".group-row")
					.removeClass("solid-options linearGradient-options radialGradient-options")
					.addClass(`${el.data("arg")}-options`);
				// update selected shape
				if (Shape.gradient.type !== el.data("arg")) {
					Shape.gradient.switchType(el.data("arg"));
				}
				break;
			case "populate-shape-values":
				Self.dispatch({ ...event, type: "update-shape-style" });
				Self.dispatch({ ...event, type: "update-shape-fill" });
				Self.dispatch({ ...event, type: "update-shape-outline" });
				Self.dispatch({ ...event, type: "update-shape-shadow" });
				break;
			case "update-shape-style":
				// reset (if any) previous active
				Els.el.find(".shape-styles .active").removeClass("active");
				// update sidebar value
				fill = Shape.shapeItem.cssProp("fill");
				if (!fill.startsWith("url(")) {
					value = Color.rgbToHex(fill);
					Els.el.find(`.shape-styles span[data-arg="${value}"]`).addClass("active");
				}
				break;
			case "update-shape-fill":
				el = Els.el.find(".gradient-colors");
				width = +el.prop("offsetWidth") - 2;
				
				// click option button
				value = APP.tools.shape.gradient.type || "solid";
				Self.parent.els.el.find(`.option-buttons_ span[data-arg="${value}"]`).trigger("click");
				switch (value) {
					case "linearGradient":
					case "radialGradient":
						// gradient
						let points = [],
							strip = [];
						Shape.gradient.stops.map(stop => {
							strip.push(`${stop.color} ${stop.offset}%`);
							points.push(`<span class="point" style="left: ${stop.offset * width / 100}px; --color: ${stop.color}; --offset: ${stop.offset};"></span>`);
						});
						el.html(points.join(""));
						el.css({ "--gradient": `linear-gradient(to right, ${strip.join(",")})` });

						// gradient angle value
						el = APP.tools.shape.els.gradientTool;
						let [a, b] = el.css("transform").split("(")[1].split(")")[0].split(",");
						value = Math.atan2(b, a) * 180 / Math.PI;
						Els.el.find("input#shape-gradient-angle").val(value);
						break;
					default:
						// fill solid
						Self.parent.els.el.find(`.color-preset_[data-change="set-shape-fill-color"]`)
							.css({ "--preset-color": APP.tools.shape.fill });
				}
				break;
			case "update-shape-outline":
				let stroke = Shape.shapeItem.css("stroke");
				// outline style
				value = Shape.shapeItem.css("stroke-dasharray").split(",").map(i => parseInt(i, 10) || 0);
				el = Self.parent.els.el.find(".shape-outline").addClass("has-prefix-icon");
				switch (true) {
					case value[0] === value[1]:
						value = "dotted";
						break;
					case value[0] === value[1] * 2:
						value = "dashed";
						break;
					case stroke === "none":
						value = "none";
						el.removeClass("has-prefix-icon");
						break;
					default:
						value = "solid";
				}
				el.val(value);

				// outline color
				value = Shape.shapeItem.css("stroke");
				value = (stroke === "none" || value === "none")
						? "transparent"
						: Color.rgbToHex(value).slice(0, -2);
				Self.parent.els.el.find(`.color-preset_[data-change="set-shape-outline-color"]`)
							.css({ "--preset-color": value });
				
				// outline width
				value = parseInt(Shape.shapeItem.css("stroke-width"), 10);
				if (stroke === "none") value = 0;
				Els.el.find("input#shape-outline").val(value);
				break;
			case "update-shape-shadow": {
				// console.log(Shape.shapeItem.css("filter"));
				let filter = Shape.shapeItem.css("filter"),
					rgbColor = filter.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(1|0\.\d+))?\)/),
					hexColor = rgbColor ? Color.rgbToHex(rgbColor[0]) : false,
					opacity = rgbColor ? Math.round(parseInt(hexColor.slice(-2), 16) / 255 * 100) : 100,
					shadow = filter.match(/(\d+)px\s*(\d+)px\s*(\d+)px/),
					bX = shadow ? +shadow[1] : 0,
					bY = shadow ? +shadow[2] : 0,
					blur = shadow ? +shadow[3] : 0,
					angle = Math.round(Math.atan2(bY, bX) * (180 / Math.PI)),
					offset = Math.round(Math.sqrt(bY*bY + bX*bX));
				// drop-shadow values
				Self.parent.els.el.find(".shape-shadow-blur input").val(blur);
				Self.parent.els.el.find(".shape-shadow-offset input").val(offset);
				Self.parent.els.el.find(".shape-shadow-opacity input").val(opacity);
				Self.parent.els.el.find(`input[name="shape-shadow-angle"]`).val(angle);
				// drop-shadow color
				hexColor = hexColor ? hexColor.slice(0, -2) : "transparent";
				Self.parent.els.el.find(`.color-preset_[data-change="set-shape-shadow"]`)
							.css({ "--preset-color": hexColor });
				} break;
			case "set-shape-style":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				// update shape element
				Shape.shapeItem.css({ fill: el.data("arg") });
				break;
			case "set-fill-gradient-color":
				// update gradient point
				event.point.css({ "--color": event.hex });
				// update gradient strip
				let maxWidth = +event.el.prop("offsetWidth") - 2,
					stops = [],
					strip = [];
				// loop points
				event.el.find(".point").map(el => {
					let offset = Math.round(el.offsetLeft / maxWidth * 1000) / 10,
						color = getComputedStyle(el).getPropertyValue("--color").trim();
					// prepare strip gradient
					strip.push(`${color} ${offset}%`);
					// prepare svg gradient
					stops.push({ offset, color });
				});
				// UI update sidebar gradient strip
				event.el.css({ "--gradient": `linear-gradient(to right, ${strip.join(",")})` });

				APP.tools.shape.gradient.update(stops);
				break;
			case "set-shape-fill-color":
				APP.tools.shape.shapeItem.css({ fill: event.value });
				break;
			case "set-shape-outline-style":
				width = parseInt(Shape.shapeItem.css("stroke-width"), 10);
				el = Self.parent.els.el.find(".shape-outline").addClass("has-prefix-icon");
				switch (event.arg) {
					case "dashed": value = [width*2, width]; break;
					case "dotted": value = [width, width]; break;
					case "solid": value = [0]; break;
					case "none":
						Self.dispatch({ type: "set-shape-outline-color", value: "none" });
						Self.dispatch({ type: "set-shape-outline-width", value: 0 });
						Self.dispatch({ type: "update-shape-outline" });
						return el.removeClass("has-prefix-icon").val(event.arg);
				}
				Shape.shapeItem.css({ "stroke-dasharray": value.join(",") });
				break;
			case "set-shape-outline-color":
				Shape.shapeItem.css({ "stroke": event.value });
				break;
			case "set-shape-outline-width":
				Shape.shapeItem.css({ "stroke-width": +event.value +"px" });
				break;
			case "set-shape-shadow": {
				let sEl = Self.parent.els.el,
					blur = +sEl.find(".shape-shadow-blur input:nth(0)").val(),
					offset = +sEl.find(".shape-shadow-offset input:nth(0)").val(),
					rad = (+sEl.find(`input[name="shape-shadow-angle"]`).val() * Math.PI) / 180,
					bX = offset * Math.sin(rad),
					bY = offset * Math.cos(rad),
					x = Math.round((+sEl.find(".shape-shadow-opacity input:nth(0)").val() / 100) * 255),
					d = "0123456789abcdef".split(""),
					alpha = d[(x - x % 16) / 16] + d[x % 16],
					color = sEl.find(`.shadow-angle-color .color-preset_`).css("--preset-color"),
					filter = `drop-shadow(${color + alpha} ${bY}px ${bX}px ${blur}px)`;
				// apply drop shadow
				Shape.shapeItem.css({ filter });
				} break;
		}
	},
	gradientPoints(event) {
		let APP = eniac,
			Self = APP.sidebar.shape,
			Parent = Self.parent,
			Drag = Self.drag,
			stops;
		switch (event.type) {
			case "mousedown": {
				// prevent default behaviour
				event.preventDefault();

				// dragged element
				let el = $(event.target),
					pEl = el.parent(),
					index = el.index(),
					siblings = pEl.find("span"),
					gradient = APP.tools.shape.gradient;

				// create drag object
				Self.drag = {
					el,
					pEl,
					siblings,
					gradient,
					clickTime: Date.now(),
					click: {
						y: event.clientY - +el.prop("offsetTop"),
						x: event.clientX - +el.prop("offsetLeft"),
					},
					max: {
						x: +pEl.prop("offsetWidth") - 2,
						y: +pEl.prop("offsetHeight") + parseInt(pEl.css("marginBottom"), 10) - 11,
					},
					_max: Math.max,
					_min: Math.min,
					_round: Math.round,
					getStops() {
						return this.siblings
								.filter(el => !el.classList.contains("hidden"))
								.map(el => {
									let offset = Math.round(el.offsetLeft / this.max.x * 1000) / 10,
										color = getComputedStyle(el).getPropertyValue("--color").trim();
									return { offset, color };
								})
								.sort((a, b) => a.offset - b.offset);
					}
				};

				if (el.hasClass("gradient-colors")) {
					// add new gradient point
					let stops = [...gradient.stops],
						offset = Math.round(event.offsetX / Self.drag.max.x * 1000) / 10;
					stops.map((stop, i) => { if (stop.offset < offset) index = i; });

					let stop1 = stops[index],
						stop2 = stops[index+1],
						perc = ((offset - stop1.offset) / (stop2.offset - stop1.offset)),
						color = Color.mixColors(stop2.color, stop1.color, perc),
						str = `<span class="point" style="left: ${event.offsetX}px; --color: ${color}; --offset: ${offset};"></span>`,
						target = el.insertAt(str, index)[0],
						clientX = event.clientX,
						clientY = event.clientY,
						preventDefault = () => {};
					// add new stop to array
					gradient.add({ offset, color }, index + 1);
					// trigger "fake" mousedown event on new point
					Self.gradientPoints({ type: "mousedown", target, clientX, clientY, preventDefault });
					return;
				}
				// point is being dragged
				el.addClass("dragging");

				// bind event
				Parent.els.doc.on("mousemove mouseup", Self.gradientPoints);
				} break;
			case "mousemove":
				let top = event.clientY - Drag.click.y,
					left = Drag._max(Drag._min(event.clientX - Drag.click.x, Drag.max.x), 0),
					offsetX = Drag._round(left / Drag.max.x * 1000) / 10,
					discard = top > Drag.max.y || top < -11,
					strip;
				Drag.el.css({ left });
				Drag.el[discard ? "addClass" : "removeClass"]("hidden");

				// compose stops array and update SVG
				stops = Drag.getStops();
				Drag.gradient.update(stops);

				// create sidebar gradient strip
				strip = stops.filter(s => !s.discard)
							.map(stop => `${stop.color} ${stop.offset}%`);
				Drag.pEl.css({ "--gradient": `linear-gradient(to right, ${strip.join(",")})` });
				break;
			case "mouseup":
				if (Date.now() - Drag.clickTime < 250) {
					// time check for "click"
					setTimeout(() =>
						APP.popups.dispatch({ type: "popup-color-ring", target: event.target }));
				}

				// reset dragged element
				Drag.el.removeClass("dragging");
				// check if point is to be removed
				if (Drag.el.hasClass("hidden")) {
					// delete element
					Drag.el.remove();
					// compose stops array and update SVG
					stops = Drag.getStops();
					Drag.gradient.update(stops);
				}
				// unbind event
				Parent.els.doc.off("mousemove mouseup", Self.gradientPoints);
				break;
		}
	}
}
