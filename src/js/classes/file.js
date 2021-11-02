
class File {

	constructor(fsFile, data) {
		// save reference to original FS file
		this._file = fsFile || new defiant.File();

		switch (this._file.kind) {
			case "xlsx":
				this._file.workbook = XLSX.read(data, { type: "array", cellStyles: true });
				break;
			case "xml":
				this._file.workbook = this._file.data;
				break;
		}

		// render workbook
		this.render({ part: "sheet-names" });
		this.render({ part: "sheet", name: this.sheetNames[0] });

		setTimeout(() => window.find(`.xl-table:nth(0) td:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
		// setTimeout(() => window.find(`.xl-shape:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
		// setTimeout(() => window.find(`.xl-text:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
		// setTimeout(() => window.find(`.xl-image:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
	}

	render(opt) {
		let APP = eniac,
			str;
		switch (opt.part) {
			case "sheet-names":
				str = this.sheetNames.reverse().map(name => APP.head.dispatch({ type: "add-sheet", name }))
				break;
			case "sheet":
				// remove existing "sheet-body"
				APP.body.find(".sheet-body").remove();
				// render & append "sheet-body"
				str = this.sheet(opt.name);
				APP.body.append(`<div class="sheet-body">${str}</div>`);
				break;
		}
	}

	get sheetNames() {
		switch (this._file.kind) {
			case "xlsx":
				return this._file.workbook.SheetNames;
			case "xml":
				let xSheets = this._file.workbook.selectNodes(`/Workbook/Sheet`);
				return xSheets.map(xSheet => xSheet.getAttribute("name"));
		}
	}

	sheet(name) {
		let sheet, str;
		switch (this._file.kind) {
			case "xlsx":
				let { html, css } = XLSX.utils.sheet_to_html_css(sheet, this.book);
				str = `${html}<style>${css}</style>`;
				return str;
			case "xml":
				str = window.render({
					data: this._file.data,
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
