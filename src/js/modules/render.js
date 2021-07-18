
const Render = {
	init() {
		this.els = {
			head: window.find("content > .head .sheet-reel"),
			body: window.find("content > .body > .wrapper"),
		};
	},
	workbook(book) {
		let APP = eniac;
		// save reference to book
		this.book = book;
		// console.log(book);

		// render sheet names
		book.SheetNames.map((name, i) => {
			eniac.head.dispatch({
				type: "add-sheet",
				name,
			});
		});

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
		// render sheet table
		let sheet = this.book.Sheets[name],
			{ html, css } = XLSX.utils.sheet_to_html_css(sheet, this.book);
		
		html = html.replace(/<table>/, `<table class="sheet">`);
		html = html.replace(/(\d{1,})pt;/g, `$1px;`);

		html += `<style>${css}</style>`;

		// remove existing sheet
		this.els.body.find("table.sheet").remove();
		// append new sheet
		this.els.body.append(html);
		// hide tools
		Cursor.dispatch({ type: "blur-table" });
	},
	sheet_old(name) {
		let str = XLSX.write(this.book, { sheet: name, type: "string", bookType: "html" });

		// str = str.match(/<table>[\s\S]*?<\/table>/gm)[0];
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
