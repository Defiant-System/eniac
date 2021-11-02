
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
		this._activeSheet = this.sheetNames[0];
		this.dispatch({ type: "render-sheet-names" });
		this.dispatch({ type: "render-sheet" });

		setTimeout(() => window.find(`layout .body`).trigger("mousedown").trigger("mouseup"), 150);
		// setTimeout(() => window.find(`.xl-table:nth(0) td:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
		// setTimeout(() => window.find(`.xl-shape:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
		// setTimeout(() => window.find(`.xl-text:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
		// setTimeout(() => window.find(`.xl-image:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
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
				break;
			case "duplicate-active-sheet":
				xSheet = this._file.data.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				xClone = xSheet.cloneNode(true);
				xClone.setAttribute("name", event.name);
				xSheet.parentNode.insertBefore(xClone, xSheet.nextSibling);
				break;
			case "delete-active-sheet":
				xSheet = this._file.data.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				xSheet.parentNode.removeChild(xSheet);
				break;
			case "update-sheet-name":
				// update XML
				xSheet = this._file.data.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				xSheet.setAttribute("name", event.value);
				// internal reference to active sheet
				this._activeSheet = event.value;
				break;
			case "update-sheet-background":
				// update XML
				xSheet = this._file.data.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				xSheet.setAttribute("background", event.value);
				break;
			case "get-sheet-background":
				// update XML
				xSheet = this._file.data.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				return xSheet.getAttribute("background");
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

	get activeSheet() {
		return this._activeSheet;
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
