
// eniac.tools.image

{
	init() {
		// fast references
		this.els = {
			root: window.find(".image-tools"),
			doc: $(document),
			layout: window.find("layout"),
		};
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
				break;
			case "focus-image":
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
						x: event.clientX,
						y: event.clientY,
					},
					offset = {
						x: +image.prop("offsetLeft"),
						y: +image.prop("offsetTop"),
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
					max = {};
				
				switch (type) {
					case "e":
						min.mX = -tOffset.x;
						max.mX = 0;
						min.mW = iOffset.w + iOffset.x + tOffset.x;
						max.mW = iOffset.w + iOffset.x;
						break;
					case "w":
						min.x = tOffset.w - iOffset.x;
						max.x = layout.width - tOffset.x - iOffset.x;
						break;
					case "n":
						min.mY = -tOffset.y;
						max.mY = 0;
						min.mH = 0;
						console.log( tOffset, iOffset );
						break;
					case "s":
						min.y = tOffset.h - iOffset.y;
						max.y = layout.height - tOffset.y - iOffset.y;
						break;
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
							mH = Drag.iOffset.h - dY;
							console.log( mH );
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
							mH = Drag.iOffset.h + dY;
							mW = Drag._round(Drag.ratio * mH);
							break;
						case "se":
							mH = Drag.iOffset.h + dY;
							mW = Drag._round(Drag.ratio * mH);
							mX = Drag._round(Drag.iOffset.x + Drag.iOffset.w - mW);
							break;
						case "nw":
							mW = Drag.iOffset.w + dX;
							mH = Drag._round(mW / Drag.ratio);
							mY = Drag._round(Drag.iOffset.y + Drag.iOffset.h - mH);
							break;
						case "ne":
							mH = Drag.iOffset.h - dY;
							mW = Drag._round(Drag.ratio * mH);
							mX = Drag._round(Drag.iOffset.x + Drag.iOffset.w - mW);
							mY = Drag._round(Drag.iOffset.y + Drag.iOffset.h - mH);
							break;
					}
				} else {
					switch (Drag.type) {
						case "e": // movement: east
							dim.left = dX + Drag.tOffset.x;
							dim.width = Drag.tOffset.w - dX;
							mX = Drag.iOffset.x - dX;
							break;
						case "w": // movement: west
							dim.width = dX + Drag.tOffset.w;
							break;
						case "n": // movement: north
							dim.top = dY + Drag.tOffset.y;
							dim.height = Drag.tOffset.h - dY;
							mY = Drag.iOffset.y - dY;
							break;
						case "s": // movement: south
							dim.height = dY + Drag.tOffset.h;
							break;
						case "sw":
							dim.height = dY + Drag.tOffset.h;
							dim.width = dX + Drag.tOffset.w;
							break;
						case "se":
							dim.left = dX + Drag.tOffset.x;
							dim.width = Drag.tOffset.w - dX;
							dim.height = dY + Drag.tOffset.h;
							mX = Drag.iOffset.x - dX;
							break;
						case "nw":
							dim.height = Drag.tOffset.h - dY;
							dim.width = dX + Drag.tOffset.w;
							dim.top = dY + Drag.tOffset.y;
							mY = Drag.iOffset.y - dY;
							break;
						case "ne":
							dim.top = dY + Drag.tOffset.y;
							dim.left = dX + Drag.tOffset.x;
							dim.width = Drag.tOffset.w - dX;
							dim.height = Drag.tOffset.h - dY;
							mY = Drag.iOffset.y - dY;
							mX = Drag.iOffset.x - dX;
							break;
					}
				}
				if (mY) dim["--mY"] = `${mY}px`;
				if (mX) dim["--mX"] = `${mX}px`;
				if (mH) dim["--mH"] = `${mH}px`;
				if (mW) dim["--mW"] = `${mW}px`;
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
