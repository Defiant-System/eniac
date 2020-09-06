
const Formula = {
	parse(table, id) {
		this.table = table;

		let expression = this.cellFormula(id)
		let tokens = expression.match(/([A-Z]+[0-9]+)/g);

		tokens.map(token => {
			let rx = new RegExp(token);
			expression = expression.replace(rx, this.cellValue(token));
		});

		return eval(expression.slice(1));
	},
	cellValue(id) {
		return +this.table.find(`td[data-id="${id}"]`).text();
	},
	cellFormula(id) {
		return this.table.find(`td[data-id="${id}"]`).data("formula");
	}
};
