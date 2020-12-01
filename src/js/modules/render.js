
const Render = {
	els: {},
	init() {
		this.els.head = window.find("content > .head");
		this.els.body = window.find("content > .body > .wrapper");
	},
	workbook(book) {
		console.log(book);

		// render sheet names
		let str = [];
		book.SheetNames.map((name, i) => {
			let cn = i === 0 ? 'class="active"' : "";
			str.push(`<span ${cn}>${name}</span>`);
		});
		this.els.head.append(str.join(""));

		// render sheet table
		str = XLSX.write(book, {
			sheet: "No Filter",
			type: "string",
			bookType: "html"
		});
		str = str.match(/<table>.*?<\/table>/gm)[0];
		str = str.replace(/<table>/, `<table class="sheet" data-click="focus-cell">`);
		this.els.body.append(str);
	}
};
