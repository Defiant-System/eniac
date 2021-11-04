
const CSV = {
	parse(data) {
		let APP = eniac,
			str = [],
			width = 400,
			height = 190,
			top = (APP.body.parent().prop("offsetHeight") - height) >> 1,
			left = (APP.body.parent().prop("offsetWidth") - width) >> 1,
			zIndex = APP.body.find(Guides.selector).length,
			style = `top:${top}px; left:${left}px; z-index:${zIndex}`;

		str.push(`<Workbook>`);
		str.push(`<Sheet name="Sheet 1">`);
		str.push(`<Table width="${width}" height="${height}" style="${style}">`);

		// parse data string to XML
		data.trim().split("\n").map(row => {
			let xRow = "";
			row.split(",").map(cell => {
				let v = cell.trim();
				if (v.startsWith('"') && v.endsWith('"')) {
					v = v.slice(1,-1);
				}
				xRow += `<Cell v="${v}"/>`;
			});
			str.push(`<Row tp="2">${xRow}</Row>`);
		});

		str.push(`</Table>`);
		str.push(`</Sheet>`);
		str.push(`</Workbook>`);

		// console.log( str.join("\n") );

		return $.xmlFromString(str.join("")).documentElement;
	},
	export(table) {
		// TODO: export table to CSV
	}
};
