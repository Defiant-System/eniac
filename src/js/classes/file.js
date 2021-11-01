
class File {

	constructor(fsFile, data) {
		// save reference to original FS file
		this._file = fsFile || new defiant.File();

		let html;
		if (data) {
			// attach reference to book
			this._file.book = XLSX.read(data, { type: "array", cellStyles: true });
		} else {
			html = window.render({ data: this._file.data, template: "xl-file" });
			
			// setTimeout(() => window.find(`.xl-table:nth(0) td:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
			// setTimeout(() => window.find(`.xl-shape:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
			// setTimeout(() => window.find(`.xl-text:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
			setTimeout(() => window.find(`.xl-image:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
		}

		// render workbook
		Render.workbook(this._file.book, html);
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
