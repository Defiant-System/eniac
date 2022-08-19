
class File {

	constructor(fsFile, data) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File();
		
		switch (this._file.kind) {
			case "csv":
				let reader = new FileReader();
				reader.addEventListener("load", async () => {
					this._file.data = reader.result;
					// parse CSV file into workbook
					this._file.workbook = CSV.parse(this._file.data);
				}, false);
				return reader.readAsText(this._file.blob);
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
	}

	dispatch(event) {
		let APP = eniac,
			spawn = event.spawn,
			xSheet,
			xClone,
			name,
			value,
			str;
		switch (event.type) {
			case "reset-sheet-names":
				APP.spawn.head.dispatch({ type: "clear-all-sheet", spawn });
				break;
			case "render-sheet-names":
				this.sheetNames.reverse().map(name => {
					let makeActive = name === this._activeSheet;
					APP.spawn.head.dispatch({ type: "add-sheet", spawn, name, makeActive });
				});
				break;
			case "render-sheet":
				break;
		}
	}

	get base() {
		return this._file.base;
	}

	get sheetNames() {
		let xSheets = this._file.workbook.selectNodes(`/Workbook/Sheet`);
		return xSheets.map(xSheet => xSheet.getAttribute("name"));
	}

	get activeSheet() {
		return this._activeSheet;
	}

	sheet(name) {
		
	}

	toBlob(kind) {
		
	}

	get isDirty() {
		
	}

	undo() {
		
	}

	redo() {
		
	}

}
