
const CSV = {
	possibleDelimiters: [",", ";", "\t"],
	parse(data) {
		let APP = eniac,
			str = [],
			width = 400,
			height = 190,
			top = (APP.body.parent().prop("offsetHeight") - height) >> 1,
			left = (APP.body.parent().prop("offsetWidth") - width) >> 1,
			zIndex = APP.body.find(Guides.selector).length,
			style = `top:${top}px; left:${left}px; z-index:${zIndex}`,
			delimiter = this.detectDelimiter(data);
		// prepare workbook XML
		str.push(`<Workbook>`);
		str.push(`<Sheet name="Sheet 1">`);
		str.push(`<Table width="${width}" height="${height}" style="${style}">`);
		// parse data string to XML
		data.trim().split("\n").map(row => {
			let xRow = "";
			row.split(delimiter).map(cell => {
				let v = cell.trim();
				if (v.startsWith('"') && v.endsWith('"')) {
					v = v.slice(1,-1);
				}
				xRow += `<C v="${v}"/>`;
			});
			str.push(`<R tp="2">${xRow}</R>`);
		});
		// closing tags
		str.push(`</Table>`);
		str.push(`</Sheet>`);
		str.push(`</Workbook>`);
		// return parsed document element
		return $.xmlFromString(str.join("")).documentElement;
	},
	detectDelimiter(text) {
		let weedOut = delimiter => {
				let cache = -1,
		        	checkLength = line => {
		        		if (!line) return true;
			            let length = line.split(delimiter).length;
			            if (cache < 0) cache = length;
			            return cache === length && length > 1;
		        	};
		        return text.split("\n").every(checkLength);
			};
		return this.possibleDelimiters.filter(weedOut);
	},
	export(table) {
		// TODO: export table to CSV
	}
};
