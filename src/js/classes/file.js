
class File {

	constructor(fsFile, data) {
		// save reference to original FS file
		this._file = fsFile || new defiant.File();

		let html = "";
		if (data) {
			// attach reference to book
			this._file.book = XLSX.read(data, { type: "array", cellStyles: true });
		} else {
			// html += window.render({ template: "xl-table", match: `//Table[@id="barebone"]` });
			// html += window.render({ template: "xl-table", match: `//Table[@id="temp-1"]` });
			// html += window.render({ template: "xl-table", match: `//Table[@id="temp-2"]` });
			// html += window.render({ template: "xl-table", match: `//Table[@id="temp-3"]` });

			// html += window.render({ template: "xl-text", match: `//Text` });
			// html += window.render({ template: "xl-image", match: `//Image` });

			html += window.render({ template: "xl-shape", match: `//Shape` });

			// svg's
			window.find("svg > svg").map(svg => {
				let [t, l, w, h] = svg.getAttribute("viewBox").split(" ");
				svg.setAttribute("style", `width: ${w}px; height: ${h}px;`);
				html += svg.xml;
			});

			// setTimeout(() => window.find(`.xl-table:nth(0) td:nth(11)`).trigger("mousedown").trigger("mouseup"), 150);
			// setTimeout(() => window.find(`.xl-shape:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
			// setTimeout(() => window.find(`.xl-text:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);
			setTimeout(() => window.find(`.xl-image:nth(0)`).trigger("mousedown").trigger("mouseup"), 150);

			// temp: paste
			// setTimeout(() => {
			// 	let rows = [["11","136","57","167","blue","3"],["123","149","142","140","blue","3"],["257","149","70","140","blue","3"],["325","165","158","110","blue","3"],["481","149","158","143","blue","3"],["661","134","63","171","blue","3"]];
			// 	eniac.tools.table.table.paste(rows);
			// }, 200);
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
