
const Parser = {
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	setTable(table) {
		this.table = table;
		this.cells = table.find("td");
		this.rowNum = table.find("tr").length;
		this.colNum = this.cells.length / this.rowNum;
	},
	parse(num) {
		let expression = this.cells.get(num).data("formula"),
			tokens = expression.match(/([A-Z]+[0-9]+)/g);

		tokens.map(token => {
			let rx = new RegExp(token);
			expression = expression.replace(rx, +this.getCell(token).text());
		});

		return eval(expression.slice(1));
	},
	checkCell(cell) {
		let x = cell.index(),
			y = cell.parent().index() + 1,
			token = this.alphabet[x] + y;
		// find related formulas and compute them
		this.table.find(`td[data-formula*="${token}"]`).map(item => {
			let el = $(item),
				num = (el.parent().index() * this.colNum) + el.index() + 1;
			this.compute(num);
		});
	},
	getCell(token) {
		let [ e, c, y ] = token.match(/([A-Z]+)(\d+)/),
			x = this.alphabet.indexOf(c),
			num = ((y - 1) * this.colNum) + x;
		return this.cells.get(num);
	},
	getCellByCoord(x, y) {
		let num = (y * this.colNum) + x;
		return this.cells.get(num);
	},
	compute(n) {
		let num = n - 1,
			cell = this.cells.get(num),
			value = this.parse(num);
		cell.text(value);
	}
};
