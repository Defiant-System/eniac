
class Table {
	constructor(el) {
		this._el = el;
	}

	get rows() {}
	get cells() {}

	get width() {}
	get height() {}
	get dimension() {}

	getRow(y) {}
	getRowCells(y) {}
	getCoordCell(x, y) {}
	getCoordRow(y) {}
	getCoordCol(y) {}
	getCoord(td) {}
	getOffset(td) {}
}
