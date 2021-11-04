
const CSV = {
	parse(data) {
		let str = [];

		str.push(`<Workbook>`);
		str.push(`<Sheet name="Sheet 1">`);
		str.push(`<Table style="top: 40px; left: 40px;">`);

		// returns workbook
		data.split("\n").map(row => {
			let xRow = `<Row tp="2">`;
			row.split(",").map(cell => {
				let v = cell.trim();
				if (v.startsWith('"') && v.endsWith('"')) {
					v = v.slice(1,-1);
				}
				xRow += `<Cell v="${v}"/>`;
			});
			xRow += "</Row>";

			str.push(xRow);
		});

		str.push(`</Table>`);
		str.push(`</Sheet>`);
		str.push(`</Workbook>`);

		// console.log( str.join("\n") );

		return $.xmlFromString(str.join("")).documentElement;
	}
};
