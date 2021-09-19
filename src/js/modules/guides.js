
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
			// console.log( rect );
			found.push({ y: rect.y, x: rect.x });
			found.push({ y: rect.y + rect.height, x: rect.x });
			found.push({ y: rect.y, x: rect.x + rect.width });
			found.push({ y: rect.y + rect.height, x: rect.x + rect.width });
			found.push({ y: rect.y + (rect.height * .5), x: rect.x + (rect.width * .5) });
		});
		// console.log( found );

		// populate 'this'
		found.map(item => Array.prototype.push.call(this, item));
		return this;
	},
	snap(pos) {
		this.map(p => {
			let sensivity = 7,
				dy = pos.top - p.y,
				dx = pos.left - p.x;
			if (dy < sensivity && dy > -sensivity) pos.top -= dy;
			if (dx < sensivity && dx > -sensivity) pos.left -= dx;
		});
	}
};

const Guides = function() {
	var guide = new Smart();
	return guide.find.apply(guide, arguments);
};
