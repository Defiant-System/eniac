
const Render = {
	init() {
		this.els = {
			head: window.find("content > .head .sheet-reel"),
			body: window.find("content > .body > .wrapper"),
		};
	},
	workbook(book, html) {
		let APP = eniac;
		// save reference to book
		this.book = book;
		// console.log(book);

		if (html) {
			// append new sheet
			// html = html.replace(/<table>/, `<table class="sheet">`);

			// add sheet name
			APP.head.dispatch({ type: "add-sheet", name: "Sheet 1" });
			// append new sheet
			let table = this.els.body.append(html).find("table").get(7);
			// temp
			// table.find("td").get(22).html("123");
			// table.find("td").get(3).html("123");

			// let dim = Parser.tableAbsDim(table);

			// table.addClass("hide-hg-lines hide-vg-lines");
			
			// table.addClass("alternate-row-bg");
			// table.css({ "--alt-row-bg": "#ff9900" });

			// auto focus on first cell
			let anchor = table.find("td").get(1);
			setTimeout(() => Cursor.dispatch({ type: "focus-cell", anchor }), 100);
			// setTimeout(() => APP.sidebar.els.el.find("input#table-title").trigger("click"), 400);
		} else {
			// render sheet names
			book.SheetNames.map(name =>
				APP.head.dispatch({ type: "add-sheet", name }));

			// render sheet table
			this.sheet(book.SheetNames[0]);
		}

		// temporary
		// let anchor = this.els.body.find("td:nth(28)")[0];
		// Cursor.dispatch({ type: "focus-cell", anchor });

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
		
		// html = html.replace(/<table>/, `<table class="sheet">`);
		// html = html.replace(/(\d{1,})pt;/g, `$1px;`);

		html += `<style>${css}</style>`;

		// remove existing sheet
		this.els.body.find(".sheet").remove();
		// append new sheet
		this.els.body.append(html);
		// hide tools
		Cursor.dispatch({ type: "blur-table" });
	}
};
