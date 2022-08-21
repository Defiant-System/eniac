
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


		let APP = eniac.spawn,
			Body = APP.els.body;
		// trigger first mousedown
		setTimeout(() => Body.trigger("mousedown").trigger("mouseup"), 10);

		// auto show sidebar
		// if (!APP.els.tools.sidebar.hasClass("tool-active_")) {
		// 	APP.els.tools.sidebar.trigger("click");
		// }

		// temp
		// setTimeout(() => Body.find(".tbl-body > div:nth(1) td:nth(14)").trigger("mousedown").trigger("mouseup"), 300);
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
				// keep track of active sheet name
				name = event.name || this.activeSheet;
				this._activeSheet = name;
				// render & append "sheet-body"
				str = this.sheet(name);
				this._el.html(str);
				// make sure elements have "z-index"
				spawn.data.tabs._active.bodyEl.find(Guides.selector).map((item, i) => {
					let el = $(item),
						zIndex = parseInt(el.css("z-index"), 10);
					if (isNaN(zIndex)) el.css({ zIndex: i+1 });
				});
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

	set bodyEl(el) {
		this._el = el;
	}

	getCellValue(coord) {
		let v = this._file.workbook.selectSingleNode(`.//C[@id="${coord}"]`).textContent;
		return +v;
	}

	sheet(name) {
		let sheet;
		switch (this._file.kind) {
			case "xlsx":
			case "csv":
			case "xml":
				// add cell coords as ID to cell node
				this._file.workbook.selectNodes(`/Workbook/Sheet/Table`).map(xTable => {
					if (!xTable.selectSingleNode(`./R[1]/C[1][@id]`)) {
						xTable.selectNodes(`./R`).map((xRow, rI) => {
							xRow.selectNodes(`./C`).map((xCell, cI) => {
								var col = cI + 1,
									s = "";
								for (; col; col=((col - 1) / 26) | 0) {
									s = String.fromCharCode(((col - 1) % 26) + 65) + s;
								}
								xCell.setAttribute("id", s+(rI+1));
							});
						});
					}
					// execute formulas before render
					xTable.selectNodes(`.//C[@f]`).map(xCell => {
						let formula = xCell.getAttribute("f"),
							value = XLSX.utils.evalFormula(formula, this.getCellValue.bind(this));
						xCell.appendChild($.cDataFromString(value));
					});
				});
				// make sure Text nodes are cleared from "text nodes"
				this._file.workbook.selectNodes(`/Workbook/Sheet/Text`).map(xText =>
					xText.childNodes.map(n => (n.nodeType === Node.TEXT_NODE) ? xText.removeChild(n) : null));
				// render
				sheet = window.render({
					data: this._file.workbook,
					match: `/Workbook/Sheet[@name="${name}"]`,
					template: "xl-file",
					vdom: true,
				});
				return sheet;
		}
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
