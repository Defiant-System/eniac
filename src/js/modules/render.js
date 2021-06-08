
const Render = {
	els: {},
	init() {
		this.els.head = window.find("content > .head");
		this.els.body = window.find("content > .body > .wrapper");
	},
	workbook(book) {
		// console.log(book);

		// clear sheet names
		this.els.head.find("span:not(.icon-add)").remove();
		// render sheet names
		let str = [];
		book.SheetNames.map((name, i) => {
			let cn = i === 0 ? 'class="active"' : "";
			str.push(`<span ${cn}>${name}</span>`);
		});
		this.els.head.append(str.join(""));


		str = XLSX.utils.sheet_to_html(book.Sheets[book.SheetNames[0]], { editable: true });
		str = str.replace(/<table>/, `<table class="sheet" data-click="focus-cell"`);

		// render sheet table
		// str = XLSX.write(book, {
		// 	sheet: "No Filter",
		// 	type: "string",
		// 	bookType: "html"
		// });
		// str = str.match(/<table>.*?<\/table>/gm)[0];
		// str = str.replace(/<table>/, `<table class="sheet" data-click="focus-cell">`);
		this.els.body.append(str);

		this.els.body.find("td:nth(0)").trigger("click");
	}
};
