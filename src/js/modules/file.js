
class File {

	constructor(fsFile, data) {
		// save reference to original FS file
		this._file = fsFile || new defiant.File();

		let html;
		if (data) {
			// attach reference to book
			this._file.book = XLSX.read(data, { type: "array", cellStyles: true });
		} else {
			/* barebone-table   */
			/* gray-table-1     */
			/* blue-table-1     */
			/* green-table-1    */
			/* blue-table-2     */
			/* orange-table-1   */
			/* white-table-1    */
			// html = window.render({ template: "barebone-table" });
			// html += window.render({ template: "gray-table-1" });
			// html += window.render({ template: "white-table-1" });

			html = window.render({ template: "sheet", match: `//Sheet[@id="barebone"]` });
			html += window.render({ template: "sheet", match: `//Sheet[@id="temp-1"]` });
			html += window.render({ template: "sheet", match: `//Sheet[@id="temp-2"]` });
			html += window.render({ template: "sheet", match: `//Sheet[@id="temp-3"]` });

			html = html.replace(/\t|\n/g, "");
		}
		// render workbook
		Render.workbook(this._file.book, html);

		// temp
		// window.find(".white-table-1 .tbl-col-head > div table").html("");
		// window.find(".white-table-1 .tbl-col-foot > div table").html("");
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
