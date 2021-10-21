
// eniac.tools.image

{
	init() {
		// fast references
		this.els = {
			root: window.find(".image-tools"),
			doc: $(document),
			layout: window.find("layout"),
		};
		// default value
		this.image = {};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.tools.image,
			Image = Self.image,
			el;
		switch (event.type) {
			// csutom events
			case "blur-image":
				Image.removeClass("masking");
				Self.els.root.addClass("hidden").removeClass("mask-mode");
				Self.image = {};
				break;
			case "focus-image":
				if (Self.image.length) {
					if (Self.image.isSame(event.el)) return;
					else Self.dispatch({ type: "blur-image" });
				}
				// resize tools
				let top = parseInt(event.el.css("top"), 10),
					left = parseInt(event.el.css("left"), 10),
					width = parseInt(event.el.css("width"), 10),
					height = parseInt(event.el.css("height"), 10);
				Self.els.root
					.css({ top, left, width, height })
					.removeClass("hidden");

				// remember text element
				Self.image = event.el;
				break;
			case "set-image-mask-mode":
				Self.els.root
					.css(event.vars)
					.toggleClass("mask-mode", event.value);
				break;
		}
	},
	move(event) {
		let APP = eniac,
			Self = APP.tools.image,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();

				// if mousedown on handle
				let el = $(event.target);

				if (Self.image.hasClass("masking")) {
					return Self.maskMove(event);
				}
				if (el.hasClass("handle")) {
					return Self.resize(event);
				}

				// cover layout
				Self.els.layout.addClass("cover hideMouse hideTools");

				let image = Self.image,
					x = +el.prop("offsetLeft"),
					y = +el.prop("offsetTop"),
					w = +el.prop("offsetWidth"),
					h = +el.prop("offsetHeight"),
					offset = { x, y },
					click = {
						x: event.clientX - x,
						y: event.clientY - y,
					},
					guides = new Guides({
						offset: {
							el: image[0],
							t: y,
							l: x,
							w,
							h,
						}
					});

				// create drag object
				Self.drag = {
					el: $([image[0], Self.els.root[0]]),
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
						restrict: event.shiftKey,
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
			Self = APP.tools.image,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// cover layout
				Self.els.layout.addClass("cover hideMouse");

				let image = Self.image,
					type = event.target.className.split(" ")[1],
					w = +image.prop("offsetWidth"),
					h = +image.prop("offsetHeight"),
					click = {
						y: event.clientY,
						x: event.clientX,
					},
					offset = {
						mY: parseInt(image.css("--mY"), 10),
						mX: parseInt(image.css("--mX"), 10),
						mW: parseInt(image.css("--mW"), 10),
						mH: parseInt(image.css("--mH"), 10),
						y: +image.prop("offsetTop"),
						x: +image.prop("offsetLeft"),
						w,
						h,
						r: ["nw", "se"].includes(type)
							? Math.atan2(h, -w) * 180 / Math.PI
							: Math.atan2(h, w) * 180 / Math.PI,
						ratio: w / h,
					},
					min = {
						w: 50,
						h: Math.round(50 / offset.ratio),
					},
					guides = new Guides({
						offset: { el: image[0], ...offset, type }
					});
				// create drag object
				Self.drag = {
					el: $([image[0], Self.els.root[0]]),
					min,
					type,
					image,
					click,
					offset,
					guides,
					_round: Math.round,
					_max: Math.max,
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.resize);
				break;
			case "mousemove":
				let dim = {
						...Drag.offset,
						min: Drag.min,
						width: Drag.offset.w,
						height: Drag.offset.h,
						diagonal: Drag.type.length === 2,
						uniform: true,
					};
				// movement: east
				if (Drag.type.includes("e")) {
					dim.left = event.clientX - Drag.click.x + Drag.offset.x;
					dim.width = Drag.offset.w + Drag.click.x - event.clientX;
				}
				// movement: west
				if (Drag.type.includes("w")) {
					dim.width = event.clientX - Drag.click.x + Drag.offset.w;
				}
				// movement: north
				if (Drag.type.includes("n")) {
					dim.top = event.clientY - Drag.click.y + Drag.offset.y;
					dim.height = Drag.offset.h + Drag.click.y - event.clientY;
				}
				// movement: south
				if (Drag.type.includes("s")) {
					dim.height = event.clientY - Drag.click.y + Drag.offset.h;
				}
				// "filter" position with guide lines
				Drag.guides.snapDim(dim);
				// apply new dimensions to element
				if (dim.width < Drag.min.w) dim.width = Drag.min.w;
				if (dim.height < Drag.min.h) dim.height = Drag.min.h;
				Drag.el.css({
						top: dim.top,
						left: dim.left,
						width: dim.width,
						height: dim.height,
					});

				// apply new dimensions to mask
				let diff = dim.width / Drag.offset.w,
					mW = Drag.offset.mW * diff,
					mH = Drag.offset.mH * diff,
					mY = Drag.offset.mY * diff,
					mX = Drag.offset.mX * diff;
				Drag.el.css({
						"--mY": `${mY}px`,
						"--mX": `${mX}px`,
						"--mW": `${mW}px`,
						"--mH": `${mH}px`,
					});
				break;
			case "mouseup":
				// re-focuses shape tools
				Self.dispatch({ type: "focus-image", el: Self.image });
				// hide guides
				Drag.guides.reset();
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.resize);
				break;
		}
	},
	maskMove(event) {
		let APP = eniac,
			Self = APP.tools.image,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown": {
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover hideMouse");

				if ($(event.target).hasClass("handle")) {
					return Self.maskResize(event);
				}

				let iEl = Self.image,
					tEl = Self.els.root,
					tOffset = {
						y: +iEl.prop("offsetTop"),
						x: +iEl.prop("offsetLeft"),
						w: +iEl.prop("offsetWidth"),
						h: +iEl.prop("offsetHeight"),
					},
					iMask = {
						y: +iEl.prop("offsetTop"),
						x: +iEl.prop("offsetLeft"),
						w: +iEl.prop("offsetWidth"),
						h: +iEl.prop("offsetHeight"),
					},
					iOffset = {
						y: parseInt(iEl.css("--mY"), 10),
						x: parseInt(iEl.css("--mX"), 10),
						w: parseInt(iEl.css("--mW"), 10),
						h: parseInt(iEl.css("--mH"), 10),
					},
					oY = event.offsetY,
					oX = event.offsetX,
					isMask = oY < 0 || oX < 0 || oY > iMask.h || oX > iMask.w,
					click = {
						y: event.clientY - (isMask ? iOffset.y : 0),
						x: event.clientX - (isMask ? iOffset.x : 0),
					},
					min = {
						y: isMask ? 0 : iOffset.y,
						x: isMask ? 0 : iOffset.x,
					},
					max = {
						y: isMask ? iMask.h - iOffset.h : iOffset.h + iOffset.y - iMask.h,
						x: isMask ? iMask.w - iOffset.w : iOffset.w + iOffset.x - iMask.w,
					};
				// create drag object
				Self.drag = {
					el: $([iEl[0], tEl[0]]),
					min,
					max,
					click,
					iMask,
					isMask,
					iOffset,
					tOffset,
					_max: Math.max,
					_min: Math.min,
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.maskMove);
				break; }
			case "mousemove":
				if (Drag.isMask) {
					let mY = Drag._max(Drag._min(event.clientY - Drag.click.y, Drag.min.y), Drag.max.y),
						mX = Drag._max(Drag._min(event.clientX - Drag.click.x, Drag.min.x), Drag.max.x);
					// console.log( mY, mX );
					Drag.el.css({
						"--mY": `${mY}px`,
						"--mX": `${mX}px`,
					});
				} else {
					let top = Drag._min(Drag._max(event.clientY - Drag.click.y, Drag.min.y), Drag.max.y),
						left = Drag._min(Drag._max(event.clientX - Drag.click.x, Drag.min.x), Drag.max.x);
					// console.log( top, left );
					Drag.el.css({
						top: top + Drag.tOffset.y,
						left: left + Drag.tOffset.x,
						"--mY": `${Drag.iOffset.y - top}px`,
						"--mX": `${Drag.iOffset.x - left}px`,
					});
				}
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.maskMove);
				break;
		}
	},
	maskResize(event) {
		let APP = eniac,
			Self = APP.tools.image,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown": {
				// prevent default behaviour
				event.preventDefault();
				// cover layout
				Self.els.layout.addClass("cover hideMouse");

				let iEl = Self.image,
					tEl = Self.els.root,
					el = $(event.target),
					pEl = el.parent(),
					type = event.target.className.split(" ")[1],
					isMask = pEl.hasClass("mask-box"),
					tOffset = {
						y: +iEl.prop("offsetTop"),
						x: +iEl.prop("offsetLeft"),
						w: +iEl.prop("offsetWidth"),
						h: +iEl.prop("offsetHeight"),
					},
					iOffset = {
						y: parseInt(iEl.css("--mY"), 10),
						x: parseInt(iEl.css("--mX"), 10),
						w: parseInt(iEl.css("--mW"), 10),
						h: parseInt(iEl.css("--mH"), 10),
					},
					click = {
						y: event.clientY,
						x: event.clientX,
					},
					ratio = iOffset.w / iOffset.h,
					layout = APP.tools.sheet.layout,
					min = {},
					max = {},
					future = {};
				
				if (isMask) {
					if (type.includes("e")) {
						future.t1 = tOffset.y + (tOffset.h >> 1);
						future.t2 = tOffset.y + iOffset.y + (iOffset.h >> 1);
						future.h = future.t1 < future.t2
									? iOffset.h + (iOffset.y * 2)
									: iOffset.h - ((iOffset.y + iOffset.h - tOffset.h) * 2);
						future.w = Math.round(future.h * ratio);
						min.mW = iOffset.w + iOffset.x + tOffset.x;
						max.mW = Math.max(iOffset.w + iOffset.x, future.w);
						min.mX = -tOffset.x;
						max.mX = Math.min(0, iOffset.x + iOffset.w - future.w);
					}
					if (type.includes("w")) {
						future.t1 = tOffset.y + (tOffset.h >> 1);
						future.t2 = tOffset.y + iOffset.y + (iOffset.h >> 1);
						future.h = future.t1 < future.t2
									? iOffset.h + (iOffset.y * 2)
									: iOffset.h - ((iOffset.y + iOffset.h - tOffset.h) * 2);
						future.w = Math.round(future.h * ratio);
						min.x = Math.max(tOffset.w - iOffset.x, future.w);
						max.x = layout.width - tOffset.x - iOffset.x;
					}
					if (type.includes("n")) {
						future.l1 = tOffset.x + (tOffset.w >> 1);
						future.l2 = tOffset.x + iOffset.x + (iOffset.w >> 1);
						future.w = future.l1 < future.l2
									? iOffset.w + (iOffset.x * 2)
									: iOffset.w - ((iOffset.x + iOffset.w - tOffset.w) * 2);
						future.h = Math.round(future.w / ratio);
						min.mH = iOffset.h + iOffset.y + tOffset.y;
						max.mH = Math.max(iOffset.h + iOffset.y, future.h);
						min.mY = -tOffset.y;
						max.mY = Math.min(0, iOffset.y + iOffset.h - future.h);
					}
					if (type.includes("s")) {
						future.l1 = tOffset.x + (tOffset.w >> 1);
						future.l2 = tOffset.x + iOffset.x + (iOffset.w >> 1);
						future.w = future.l1 < future.l2
									? iOffset.w + (iOffset.x * 2)
									: iOffset.w - ((iOffset.x + iOffset.w - tOffset.w) * 2);
						future.h = Math.round(future.w / ratio);
						min.y = Math.max(tOffset.h - iOffset.y, future.h);
						max.y = layout.height - tOffset.y - iOffset.y;
					}
					if (type.includes("sw")) {
						future.w = iOffset.w + tOffset.w - (iOffset.x + iOffset.w);
						future.h = Math.round(future.w / ratio);
						min.y = Math.max(min.y, future.h);
					}
					if (type.includes("nw")) {
						future.h = iOffset.h + iOffset.y;
						future.w = Math.round(future.h * ratio);
						min.x = Math.max(min.x, future.w);
					}
					if (type.includes("ne")) {
						future.w = iOffset.w + iOffset.x;
						future.h = Math.round(future.w / ratio);
						min.mH = Math.max(min.mH, future.h);
					}
					if (type.includes("se")) {
						future.w = iOffset.w + iOffset.x;
						future.h = Math.round(future.w / ratio);
						min.y = Math.max(min.y, future.h);
					}
				} else {
					if (type.includes("e")) {
						min.w = 20;
						max.w = tOffset.w - iOffset.x;
						min.x = tOffset.x + iOffset.x;
						max.x = tOffset.x + tOffset.w - min.w;
						min.mX = min.w - max.w;
						max.mX = 0;
					}
					if (type.includes("w")) {
						min.w = 20;
						max.w = iOffset.w + iOffset.x;
					}
					if (type.includes("n")) {
						min.h = 20;
						max.h = tOffset.h - iOffset.y;
						min.y = tOffset.y + iOffset.y;
						max.y = tOffset.y + tOffset.h - min.h;
						min.mY = min.h - max.h;
						max.mY = 0;
					}
					if (type.includes("s")) {
						min.h = 20;
						max.h = iOffset.h + iOffset.y;
					}
				}

				// create drag object
				Self.drag = {
					el: $([iEl[0], tEl[0]]),
					min,
					max,
					type,
					ratio,
					click,
					isMask,
					iOffset,
					tOffset,
					_max: Math.max,
					_min: Math.min,
					_round: Math.round,
				};
				// bind event
				Self.els.doc.on("mousemove mouseup", Self.maskResize);
				break; }
			case "mousemove":
				let dY = event.clientY - Drag.click.y,
					dX = event.clientX - Drag.click.x,
					mY, mX, mW, mH,
					dim = {};
				if (Drag.isMask) {
					switch (Drag.type) {
						case "e": // movement: east
							mX = Drag._min(Drag._max(dX + Drag.iOffset.x, Drag.min.mX), Drag.max.mX);
							mW = Drag._max(Drag._min(Drag.iOffset.w - dX, Drag.min.mW), Drag.max.mW);
							// ratio resize
							mH = Drag._round(mW / Drag.ratio);
							mY = Drag._round(Drag.iOffset.y + ((Drag.iOffset.h - mH) >> 1));
							break;
						case "w": // movement: west
							mW = Drag._min(Drag._max(Drag.iOffset.w + dX, Drag.min.x), Drag.max.x);
							// ratio resize
							mH = Drag._round(mW / Drag.ratio);
							mY = Drag._round(Drag.iOffset.y + ((Drag.iOffset.h - mH) >> 1));
							break;
						case "n": // movement: north
							mY = Drag._min(Drag._max(dY + Drag.iOffset.y, Drag.min.mY), Drag.max.mY);
							mH = Drag._max(Drag._min(Drag.iOffset.h - dY, Drag.min.mH), Drag.max.mH);
							// ratio resize
							mW = Drag._round(Drag.ratio * mH);
							mX = Drag._round(Drag.iOffset.x + ((Drag.iOffset.w - mW) >> 1));
							break;
						case "s": // movement: south
							mH = Drag._min(Drag._max(Drag.iOffset.h + dY, Drag.min.y), Drag.max.y);
							// ratio resize
							mW = Drag._round(Drag.ratio * mH);
							mX = Drag._round(Drag.iOffset.x + ((Drag.iOffset.w - mW) >> 1));
							break;
						case "sw":
							mH = Drag._min(Drag._max(Drag.iOffset.h + dY, Drag.min.y), Drag.max.y);
							mW = Drag._round(Drag.ratio * mH);
							break;
						case "se":
							mH = Drag._min(Drag._max(Drag.iOffset.h + dY, Drag.min.y), Drag.max.y);
							mW = Drag._round(Drag.ratio * mH);
							mX = Drag._round(Drag.iOffset.x + Drag.iOffset.w - mW);
							break;
						case "nw":
							mW = Drag._min(Drag._max(Drag.iOffset.w + dX, Drag.min.x), Drag.max.x);
							mH = Drag._round(mW / Drag.ratio);
							mY = Drag._round(Drag.iOffset.y + Drag.iOffset.h - mH);
							break;
						case "ne":
							mH = Drag._min(Drag._max(Drag.iOffset.h - dY, Drag.min.mH), Drag.max.mH);
							mW = Drag._round(Drag.ratio * mH);
							mX = Drag._round(Drag.iOffset.x + Drag.iOffset.w - mW);
							mY = Drag._round(Drag.iOffset.y + Drag.iOffset.h - mH);
							break;
					}
				} else {
					if (Drag.type.includes("e")) { // movement: east
						dim.width = Drag._max(Drag._min(Drag.tOffset.w - dX, Drag.max.w), Drag.min.w);
						dim.left = Drag._min(Drag._max(dX + Drag.tOffset.x, Drag.min.x), Drag.max.x);
						mX = Drag._max(Drag._min(Drag.iOffset.x - dX, Drag.max.mX), Drag.min.mX);
					}
					if (Drag.type.includes("w")) { // movement: west
						dim.width = Drag._min(Drag._max(dX + Drag.tOffset.w, Drag.min.w), Drag.max.w);
					}
					if (Drag.type.includes("n")) { // movement: north
						dim.height = Drag._max(Drag._min(Drag.tOffset.h - dY, Drag.max.h), Drag.min.h);
						dim.top = Drag._min(Drag._max(dY + Drag.tOffset.y, Drag.min.y), Drag.max.y);
						mY = Drag._max(Drag._min(Drag.iOffset.y - dY, Drag.max.mY), Drag.min.mY);
					}
					if (Drag.type.includes("s")) { // movement: south
						dim.height = Drag._min(Drag._max(dY + Drag.tOffset.h, Drag.min.h), Drag.max.h);
					}
				}
				if (mY !== undefined) dim["--mY"] = `${mY}px`;
				if (mX !== undefined) dim["--mX"] = `${mX}px`;
				if (mH !== undefined) dim["--mH"] = `${mH}px`;
				if (mW !== undefined) dim["--mW"] = `${mW}px`;
				// apply new dimensions to elements
				Drag.el.css(dim);
				break;
			case "mouseup":
				// uncover layout
				Self.els.layout.removeClass("cover hideMouse");
				// unbind event
				Self.els.doc.off("mousemove mouseup", Self.maskResize);
				break;
		}
	}
}
