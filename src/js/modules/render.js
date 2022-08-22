
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
			this.els.body.append(html);
		} else {
			// render sheet names
			book.SheetNames.map(name =>
				APP.head.dispatch({ type: "add-sheet", name }));

			// render sheet table
			this.sheet(book.SheetNames[0]);
		}
		// make sure elements have "z-index"
		APP.spawn.els.body.find(Guides.selector).map((item, i) => {
			let el = $(item),
				zIndex = parseInt(el.css("z-index"), 10);
			if (isNaN(zIndex)) el.css({ zIndex: i+1 });
		});
	},
	sheet(name) {
		// render sheet table
		let sheet = this.book.Sheets[name],
			{ html, css } = XLSX.utils.sheet_to_html_css(sheet, this.book);
		
		// html = html.replace(/<table>/, `<table class="sheet">`);
		// html = html.replace(/(\d{1,})pt;/g, `$1px;`);

		html += `<style>${css}</style>`;

		// remove existing sheet
		this.els.body.find(".xl-table").remove();
		// append new sheet
		this.els.body.append(html);
	}
};
