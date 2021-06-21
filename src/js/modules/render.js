
const Render = {
	init() {
		this.els = {
			head: window.find("content > .head .sheet-reel"),
			body: window.find("content > .body > .wrapper"),
		};
	},
	workbook(book) {
		// save reference to book
		this.book = book;
		// console.log(book);

		// render sheet names
		let str = [];
		book.SheetNames.map((name, i) => {
			let cn = i === 0 ? 'class="active"' : "";
			str.push(`<span ${cn}>${name}</span>`);
		});
		this.els.head.html(str.join(""));

		// render sheet table
		this.sheet(book.SheetNames[0]);

		// temporary
		let anchor = this.els.body.find("td:nth(28)")[0];
		Cursor.dispatch({ type: "focus-cell", anchor });

		// Cursor.dispatch({
		// 	type: "select-rectangle",
		// 	anchorStart: Parser.getCellByCoord(1, 1),
		// 	anchorEnd: Parser.getCellByCoord(4, 3),
		// });
	},
	sheet(name) {
		{
			// render sheet table
			let sheet = this.book.Sheets["Sheet1"],
				str = XLSX.utils.sheet_to_html(sheet);
			// console.log(str);
		}

		// render sheet table
		let str = XLSX.write(this.book, { sheet: name, type: "string", bookType: "html" });

		str = str.match(/<table>[\s\S]*?<\/table>/gm)[0];
		str = str.replace(/<table>/, `<table class="sheet">`);
		str = str.replace(/(\d{1,})pt;/g, `$1px;`);

		// remove existing sheet
		this.els.body.find("table.sheet").remove();
		// append new sheet
		this.els.body.append(str);
		// hide tools
		Cursor.dispatch({ type: "blur-table" });
	}
};
