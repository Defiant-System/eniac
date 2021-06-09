
class File {

	constructor(fsFile) {
		// save reference to original FS file
		this._file = fsFile || new defiant.File();
	}

	toBlob(kind) {
		let table = Parser.table[0];
		let data = XLSX.utils.table_to_book(table);
		let file = XLSX.write(data, { bookType: kind, type: "binary" });
		let type, buffer, view;

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
