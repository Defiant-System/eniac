
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

		// setTimeout(() => {
		// 	eniac.sidebar.shape.dispatch({ type: "set-shape-shadow" });
		// }, 300);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.sidebar.shape,
			Els = APP.sidebar.els,
			Shape = event.shape || APP.tools.shape,
			name,
			color,
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
					.removeClass("solid-fill linearGradient-fill radialGradient-fill")
					.addClass(`${el.data("arg")}-fill`);
				// update selected shape
				if (Shape.gradient.type !== el.data("arg")) {
					Shape.gradient.switchType(el.data("arg"));
				}
				break;
			case "toggle-group-body":
				el = event.el.parent();
				if (el.hasClass("expanded")) {
					el.removeClass("expanded");
				} else {
					el.addClass("expanded");
				}
				break;
			case "populate-shape-values":
				event.values = Self.dispatch({ ...event, type: "collect-shape-values" });

				Self.dispatch({ ...event, type: "update-shape-style" });
				Self.dispatch({ ...event, type: "update-shape-fill" });
				Self.dispatch({ ...event, type: "update-shape-outline" });
				Self.dispatch({ ...event, type: "update-shape-shadow" });
				Self.dispatch({ ...event, type: "update-shape-reflection" });
				Self.dispatch({ ...event, type: "update-shape-opacity" });
				break;
			case "collect-shape-values": {
				let fill = {},
					border = {},
					shadow = {},
					reflection = {},
					opacity = {};
				
				// fill values
				fill.color = APP.tools.shape.fill || "";
				fill.type = APP.tools.shape.gradient.type;
				fill._expand = fill.type !== "solid" || fill.color.slice(-2) !== "00";

				// border values
				border.color = Shape.shapeItem.css("stroke");
				border.dash = Shape.shapeItem.css("stroke-dasharray").split(",").map(i => parseInt(i, 10) || 0);
				border.width = parseInt(Shape.shapeItem.css("stroke-width"), 10);
				border._expand = border.width > 1;

				// shadow values
				shadow.filter = Shape.shapeItem.css("filter");
				shadow._expand = shadow.filter !== "none";

				// reflection values
				reflection.reflect = Shape.shape.css("-webkit-box-reflect");
				reflection._expand = Shape.shape.hasClass("reflection");

				// opacity values
				opacity.value = +Shape.shape.css("opacity");
				opacity._expand = opacity.value !== 1;

				let data = { fill, border, shadow, reflection, opacity };
				Object.keys(data).map(key => {
					let el = Els.el.find(`.group-row.shape-${key}-options`);
					if (data[key]._expand) el.addClass("expanded");
					else el.removeClass("expanded");
				});

				return data; }
			// Updaters
			case "update-shape-style":
				// reset (if any) previous active
				Els.el.find(".shape-styles .active").removeClass("active");
				// update sidebar value
				fill = Shape.shapeItem.cssProp("fill");
				if (!fill.startsWith("url(")) {
					value = Color.rgbToHex(fill).slice(0,-2);
					Els.el.find(`.shape-styles span[data-arg="${value}"]`).addClass("active");
				}
				break;
			case "update-shape-fill":
				el = Els.el.find(".gradient-colors");
				width = +el.prop("offsetWidth") - 2;
				
				// click option button
				value = event.values.fill.type;
				Els.el.find(`.option-buttons_ span[data-arg="${value}"]`).trigger("click");
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
						Els.el.find(`.color-preset_[data-change="set-shape-fill-color"]`)
							.css({ "--preset-color": event.values.fill.color });
				}
				break;
			case "update-shape-outline":
				// outline style
				color = event.values.border.color;
				value = event.values.border.dash;
				el = Els.el.find(".shape-outline").addClass("has-prefix-icon");
				switch (true) {
					case value[0] === value[1]:
						value = "dotted";
						break;
					case value[0] === value[1] * 2:
						value = "dashed";
						break;
					case color === "none":
						value = "none";
						el.removeClass("has-prefix-icon");
						break;
					default:
						value = "solid";
				}
				el.val(value);

				// outline color
				value = color === "none" ? "transparent" : Color.rgbToHex(color).slice(0, -2);
				Els.el.find(`.color-preset_[data-change="set-shape-outline-color"]`)
							.css({ "--preset-color": value });
				
				// outline width
				value = color === "none" ? 0 : event.values.border.width;
				Els.el.find("input#shape-outline").val(value);
				break;
			case "update-shape-shadow": {
				let filter = event.values.shadow.filter,
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
				Els.el.find(".shape-shadow-blur input").val(blur);
				Els.el.find(".shape-shadow-offset input").val(offset);
				Els.el.find(".shape-shadow-opacity input").val(opacity);
				Els.el.find(`input[name="shape-shadow-angle"]`).val(angle);
				// drop-shadow color
				hexColor = hexColor ? hexColor.slice(0, -2) : "transparent";
				Els.el.find(`.color-preset_[data-change="set-shape-shadow"]`)
							.css({ "--preset-color": hexColor });
				} break;
			case "update-shape-reflection":
				value = event.values.reflection.reflect.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(1|0\.\d+))?\)/);
				value = value ? Math.round(value[4] * 100) : 0;
				Els.el.find(".shape-reflection input").val(value);
				break;
			case "update-shape-opacity":
				value = event.values.opacity.value * 100;
				Els.el.find(".shape-opacity input").val(value);
				break;
			// Setters
			case "set-shape-style":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				let fn = () => {
						// update shape element
						Shape.shapeItem.css({ fill: el.data("arg") });
						// update "Stroke" group color
						Els.el.find(`.color-preset_[data-change="set-shape-fill-color"]`)
							.css({ "--preset-color": el.data("arg") });
					};
				if (Els.el.find(`.shape-fill-options .active_`).attr("data-arg") !== "solid") {
					Els.el.find(`.shape-fill-options span[data-arg="solid"]`).trigger("click");
					setTimeout(fn, 10);
				} else {
					fn();
				}
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
				el = Els.el.find(".shape-outline").addClass("has-prefix-icon");
				switch (event.arg) {
					case "dashed": value = [width*2, width]; break;
					case "dotted": value = [width, width]; break;
					case "solid": value = [0]; break;
					case "none":
						Self.dispatch({ type: "set-shape-outline-color", value: "none" });
						Self.dispatch({ type: "set-shape-outline-width", value: 0 });
						// border values
						let border = {
							color: Shape.shapeItem.css("stroke"),
							dash: Shape.shapeItem.css("stroke-dasharray").split(",").map(i => parseInt(i, 10) || 0),
							width: parseInt(Shape.shapeItem.css("stroke-width"), 10),
						};
						Self.dispatch({ type: "update-shape-outline", values: { border } });
						return el.removeClass("has-prefix-icon").val(event.arg);
				}
				Shape.shapeItem.css({ "stroke-dasharray": value.join(",") });
				break;
			case "set-shape-outline-color":
				Shape.shapeItem.css({ "stroke": event.value });
				break;
			case "set-shape-outline-width":
				value = {
					"stroke-width": +event.value +"px",
					"stroke-dasharray": Shape.shapeItem.css("stroke-dasharray"),
				};
				// conditions for dash-array
				if (value["stroke-dasharray"].split(",").length > 1) {
					let arr = value["stroke-dasharray"].split(",").map(i => parseInt(i, 10) || 0);
					value["stroke-dasharray"] = arr[0] === arr[1]
												? [+event.value, +event.value]
												: [+event.value*2, +event.value];
				}
				// apply new width
				Shape.shapeItem.css(value);
				break;
			case "set-shape-shadow": {
				let data = {
						blur: +Els.el.find(".shape-shadow-blur input:nth(0)").val(),
						offset: +Els.el.find(".shape-shadow-offset input:nth(0)").val(),
						opacity: +Els.el.find(".shape-shadow-opacity input:nth(0)").val(),
					};
				// obey new value of event provides value
				if (event.el) {
					let cn = event.el.parents(".flex-row").prop("className"),
						name = cn.split(" ")[1].split("-")[2];
					data[name] = +event.value;
				}
				// collect / prepare values for sidebar
				let rad = (+Els.el.find(`input[name="shape-shadow-angle"]`).val() * Math.PI) / 180,
					bX = Math.round(data.offset * Math.sin(rad)),
					bY = Math.round(data.offset * Math.cos(rad)),
					x = Math.round((data.opacity / 100) * 255),
					d = "0123456789abcdef".split(""),
					alpha = d[(x - x % 16) / 16] + d[x % 16],
					color = Els.el.find(`.shape-shadow-angle-color .color-preset_`).css("--preset-color"),
					filter = `drop-shadow(${color + alpha} ${bY}px ${bX}px ${data.blur}px)`;
				// apply drop shadow
				Shape.shapeItem.css({ filter });
				// make sure all fields shows same value
				Els.el.find(".shape-shadow-blur input").val(data.blur);
				Els.el.find(".shape-shadow-offset input").val(data.offset);
				Els.el.find(".shape-shadow-opacity input").val(data.opacity);
				} break;
			case "set-shape-reflection":
				value = Els.el.find(".shape-reflection input:nth(0)").val();
				let reflect = `below 3px -webkit-linear-gradient(bottom, rgba(255, 255, 255, ${value / 100}) 0%, transparent 50%, transparent 100%)`
				// apply reflection
				Shape.shape.css({ "-webkit-box-reflect": reflect });
				// make sure all fields shows same value
				Els.el.find(".shape-reflection input").val(value);
				break;
			case "set-shape-opacity":
				value = Els.el.find(".shape-opacity input:nth(0)").val();
				// apply shape opacity
				Shape.shape.css({ "opacity": value / 100 });
				// make sure all fields shows same value
				Els.el.find(".shape-opacity input").val(value);
				break;
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
