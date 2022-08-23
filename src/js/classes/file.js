
class File {

	constructor(fsFile, data) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "xml" });
		
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
				if (!this._file.data) {
					let xStr = `<Workbook><Sheet name="Sheet 1" /></Workbook>`;
					this._file.data = $.xmlFromString(xStr).documentElement;
				}
				this._file.workbook = this._file.data;
				break;
		}

		// render workbook
		this._activeSheet = this.sheetNames[0];

		// let APP = eniac.spawn,
		// 	Body = APP.els.body;
		// // trigger first mousedown
		// setTimeout(() => Body.trigger("mousedown").trigger("mouseup"), 10);

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
				this.sheetNames.reverse().map(name => APP.spawn.head.dispatch({ type: "add-sheet", spawn, name }));
				APP.spawn.head.dispatch({ type: "make-active", name: this._activeSheet, spawn });
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
			case "close-file":
				// clean up sheet names
				APP.spawn.head.dispatch({ type: "clear-all-sheet" });
				// clean up workarea
				APP.spawn.els.body.find(".guide-lines").nextAll("*").remove();
				break;
			case "select-sheet":
				this._activeSheet = event.name || this._activeSheet;
				break;
			case "create-new-sheet":
				let i = 0,
					xSiblings = this._file.workbook.selectNodes("//Sheet"),
					xReference = xSiblings[event.index];
				do {
					i++;
				} while (this._file.workbook.selectSingleNode(`//Sheet[@name="Sheet ${i}"]`));
				// add new sheet node to workbook
				xSheet = $.nodeFromString(`<Sheet name="Sheet ${i}"/>`);
				xReference.parentNode.insertBefore(xSheet, xReference.nextSibling);
				// return name of new sheet
				return xSheet.getAttribute("name");
			case "duplicate-active-sheet":
				xSheet = this._file.workbook.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				xClone = xSheet.cloneNode(true);
				xClone.setAttribute("name", event.name);
				xSheet.parentNode.insertBefore(xClone, xSheet.nextSibling);
				break;
			case "delete-active-sheet":
				xSheet = this._file.workbook.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				xSheet.parentNode.removeChild(xSheet);
				break;
			case "update-sheet-name":
				// update XML
				xSheet = this._file.workbook.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				xSheet.setAttribute("name", event.value);
				// internal reference to active sheet
				this._activeSheet = event.value;
				break;
			case "update-sheet-background":
				// update XML
				xSheet = this._file.workbook.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				xSheet.setAttribute("background", event.value);
				break;
			case "get-sheet-background":
				// update XML
				xSheet = this._file.workbook.selectSingleNode(`//Sheet[@name="${this._activeSheet}"]`);
				return xSheet.getAttribute("background");
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
