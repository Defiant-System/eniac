
class File {

	constructor(fsFile, data) {
		// save reference to original FS file
		this._file = fsFile || new defiant.File();

		switch (this._file.kind) {
			case "csv":
				// parse CSV file into workbook
				this._file.workbook = CSV.parse(this._file.data);
				break;
			case "xlsx":
				let book = XLSX.read(data, { type: "array", cellStyles: true });
				this._file.workbook = XLSX.utils.book_to_xml(book);
				// console.log( this._file.workbook );
				break;
			case "xml":
				this._file.workbook = this._file.data;
				break;
		}

		// render workbook
		this._activeSheet = this.sheetNames[0];
		this.dispatch({ type: "render-sheet-names" });
		this.dispatch({ type: "render-sheet" });

		let APP = eniac;

		// trigger first mousedown
		setTimeout(() => APP.body.trigger("mousedown").trigger("mouseup"), 10);

		// setTimeout(() => APP.body.find(`.xl-table:nth(0) td:nth(5)`).trigger("mousedown").trigger("mouseup"), 150);
		// setTimeout(() => APP.body.find(`.xl-shape:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
		// setTimeout(() => APP.body.find(`.xl-text:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
		// setTimeout(() => APP.body.find(`.xl-image:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
	}

	dispatch(event) {
		let APP = eniac,
			xSheet,
			xClone,
			name,
			str;
		switch (event.type) {
			case "render-sheet-names":
				this.sheetNames.reverse().map(name => {
					let makeActive = name === this._activeSheet;
					APP.head.dispatch({ type: "add-sheet", name, makeActive })
				});
				break;
			case "render-sheet":
				// keep track of active sheet name
				name = event.name || this.activeSheet;
				this._activeSheet = name;
				// remove existing "sheet-body"
				APP.body.find(Guides.selector).remove();
				// render & append "sheet-body"
				str = this.sheet(name);
				APP.body.append(str);
				// make sure elements have "z-index"
				APP.body.find(Guides.selector).map((item, i) => {
					let el = $(item),
						zIndex = parseInt(el.css("z-index"), 10);
					if (isNaN(zIndex)) el.css({ zIndex: i+1 });
				});
				break;
			case "create-new-sheet":
				let i = 0,
					xSiblings = this._file.workbook.selectNodes("//Sheet"),
					xReference = xSiblings[event.index];
				do {
					i++;
				} while (this._file.workbook.selectSingleNode(`//Sheet[@name="Sheet ${i}"]`));
				// add new sheet node to workbook
				xSheet = $.nodeFromString(`<Sheet name="Sheet ${i}"/>`);
				xReference.parentNode.insertBefore(xSheet, xReference.nextSibling);
				// return name of new sheet
				return xSheet.getAttribute("name");
			case "duplicate-active-sheet":
				xSheet = this._file.workbook.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				xClone = xSheet.cloneNode(true);
				xClone.setAttribute("name", event.name);
				xSheet.parentNode.insertBefore(xClone, xSheet.nextSibling);
				break;
			case "delete-active-sheet":
				xSheet = this._file.workbook.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				xSheet.parentNode.removeChild(xSheet);
				break;
			case "update-sheet-name":
				// update XML
				xSheet = this._file.workbook.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				xSheet.setAttribute("name", event.value);
				// internal reference to active sheet
				this._activeSheet = event.value;
				break;
			case "update-sheet-background":
				// update XML
				xSheet = this._file.workbook.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				xSheet.setAttribute("background", event.value);
				break;
			case "get-sheet-background":
				// update XML
				xSheet = this._file.workbook.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				return xSheet.getAttribute("background");
		}
	}

	get sheetNames() {
		let xSheets = this._file.workbook.selectNodes(`/Workbook/Sheet`);
		return xSheets.map(xSheet => xSheet.getAttribute("name"));
	}

	get activeSheet() {
		return this._activeSheet;
	}

	sheet(name) {
		let sheet, str;
		switch (this._file.kind) {
			case "xlsx":
				// let { html, css } = XLSX.utils.sheet_to_html_css(sheet, this.book);
				// str = `${html}<style>${css}</style>`;
				// return str;
			case "csv":
			case "xml":
				str = window.render({
					data: this._file.workbook,
					match: `/Workbook/Sheet[@name="${name}"]`,
					template: "xl-file",
				});
				return str;
		}
	}

	toBlob(kind) {
		let table = Parser.table[0],
			data = XLSX.utils.table_to_book(table),
			file = XLSX.write(data, { bookType: kind, type: "binary" }),
			type, buffer, view;

		switch (kind) {
			case "xlsx":
				type = "application/vnd.ms-excel";
				buffer = new ArrayBuffer(file.length);
                view = new Uint8Array(buffer)
                for (let i=0, il=file.length; i<il; i++) {
                	view[i] = file.charCodeAt(i) & 0xFF;
                }
                data = buffer;
				break;
			case "csv":
				type = "text/csv";
				data = file;
				break;
			case "xml":
				type = "application/xml";
				data = file;
				break;
		}

		return new Blob([data], { type });
	}

	get isDirty() {
		
	}

	focus() {
		
	}

	blur() {
		
	}

	undo() {
		
	}

	redo() {
		
	}

}
