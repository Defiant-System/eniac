
class File {

	constructor(fsFile, data) {
		// save reference to original FS file
		this._file = fsFile || new defiant.File();

		console.log( this._file );

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
