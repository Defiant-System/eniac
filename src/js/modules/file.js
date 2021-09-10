
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
			// html += window.render({ template: "sheet", match: `//Sheet[@id="temp-1"]` });
			// html += window.render({ template: "sheet", match: `//Sheet[@id="temp-2"]` });
			// html += window.render({ template: "sheet", match: `//Sheet[@id="temp-3"]` });

			html += `
<div class="shape"><svg id="shape-rounded" viewBox="0 0 100 100">
	<style type="text/css">
		.st3{
			fill: #ff9900;
			stroke: #333333;
			stroke-width: 3px;
			stroke: #f00;
			stroke-dasharray: 3,3;
		}
	</style>
	<path class="st3" d="M19.1,3h61.8C89.8,3,97,10.2,97,19.1v61.8C97,89.8,89.8,97,80.9,97H19.1C10.2,97,3,89.8,3,80.9V19.1C3,10.2,10.2,3,19.1,3z"/>
</svg></div>

<div class="shape"><svg id="shape-rectangle" viewBox="0 0 100 100">
	<style type="text/css">
		.st0{
			fill: url(#SVG-GR-1);
			stroke: #111111;
			stroke-width: 2px;
		}
	</style>
	<linearGradient id="SVG-GR-1" x1=".5" y1=".1" x2=".5" y2=".9">
		<stop offset="0%" stop-color="#5555bb" />
		<stop offset="45%" stop-color="#eeeeff" />
		<stop offset="54%" stop-color="#555555" />
		<stop offset="100%" stop-color="#dddddd" />
	</linearGradient>
	<rect class="st0" x="3" y="3" width="94" height="94"/>
</svg></div>

<div class="shape"><svg id="shape-disc" viewBox="0 0 100 100">
	<style type="text/css">
		.st1{
			fill: url(#SVG-GR-2);
			strok1e: #333333;
			stroke-width: 3px;
			filter: drop-shadow(0 7px 5px rgba(0,0,0,.35));
		}
	</style>
	<radialGradient id="SVG-GR-2" cx="0.25" cy="0.25" r="0.75">
        <stop offset="0%" stop-color="#aaddff"/>
        <stop offset="100%" stop-color="#336699"/>
      </radialGradient>
	<circle class="st1" cx="50" cy="50" r="47"/>
</svg></div>

<div class="shape"><svg id="shape-triangle" viewBox="0 0 100 100">
	<style type="text/css">
		.st2{
			fill: #ea261f;
			stroke: #333333;
			stroke-width: 2px;
			stroke: #000000;
			stroke-dasharray: 4,2;
		}
	</style>
	<polygon class="st2" points="97,97 50,3.6 3,97 "/>
</svg></div>`;

			html = html.replace(/\t|\n/g, "");
		}
		// render workbook
		Render.workbook(this._file.book, html);
		
		setTimeout(() => {
			window.find(`.shape:nth(2)`).trigger("mousedown").trigger("mouseup")
		}, 150);
		
		// temp
		// window.find(`.toolbar-tool_[data-arg="shape"]`).trigger("click");
		// window.find(".white-table-1 .tbl-col-head > div table").html("");
		// window.find(".white-table-1 .tbl-col-foot > div table").html("");

		// auto focus on first cell
		// let anchor = window.find(".sheet:nth(0) table").get(3).find("td").get(6);
		// setTimeout(() => Cursor.dispatch({ type: "focus-cell", anchor }), 100);
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
