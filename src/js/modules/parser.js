
const Parser = {
	alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	setTable(table) {
		this.table = table;
		this.cells = table.find("td");
		this.rowNum = table.find("tr").length;
		this.colNum = this.cells.length / this.rowNum;
	},
	parse(num) {
		let expression = this.cells.get(num).data("formula");
		let tokens = expression.match(/([A-Z]+[0-9]+)/g);

		tokens.map(token => {
			let rx = new RegExp(token);
			expression = expression.replace(rx, +this.getCell(token).text());
		});

		return eval(expression.slice(1));
	},
	getCell(token) {
		let [ e, c, y ] = token.match(/([A-Z]+)(\d+)/);
		let x = this.alphabet.indexOf(c);
		let num = ((y - 1) * this.colNum) + x;
		return this.cells.get(num);
	},
	compute(n) {
		let num = n - 1;
		let cell = this.cells.get(num);
		let value = this.parse(num);
		cell.text(value);
	}
};
