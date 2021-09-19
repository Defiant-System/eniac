
const Smart = function() {
	let guide = Object.create(Array.prototype);
	for (var prop in Smart.prototype) {
		if (Smart.prototype.hasOwnProperty(prop)) {
			guide[prop] = Smart.prototype[prop];
		}
	}
	return guide;
};

Smart.prototype = {
	find(selector) {
		let found = [];

		window.find(selector).map(el => {
			let rect = el.getBoundingClientRect();
			found.push({ y: rect.y, x: rect.x });
			// found.push({ y: rect.y + rect.height, x: rect.x });
			// found.push({ y: rect.y, x: rect.x + rect.width });
			// found.push({ y: rect.y + rect.height, x: rect.x + rect.width });
			// found.push({ y: rect.y + (rect.height * .5), x: rect.x + (rect.width * .5) });
		});

		// add guide line element to "this"
		this.lines = {
			horizontal: window.find(".guide-lines .horizontal"),
			vertical: window.find(".guide-lines .vertical"),
			diagonal: window.find(".guide-lines .diagonal"),
		};

		// populate "this"
		found.map(item => Array.prototype.push.call(this, item));
		return this;
	},
	snap(pos) {
		this.map(p => {
			let sensivity = 7,
				dy = pos.top - p.y,
				dx = pos.left - p.x;
			if (dy < sensivity && dy > -sensivity) pos.top -= dy;
			if (dx < sensivity && dx > -sensivity) {
				pos.left -= dx;

				this.lines.vertical.css({
					top: 100,
					height: 200,
					left: p.x,
				});
			}
		});
	}
};

const Guides = function() {
	var guide = new Smart();
	return guide.find.apply(guide, arguments);
};
