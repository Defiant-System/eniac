
class $election {

	constructor() {
		this._selection = document.getSelection();
	}

	expand(unit) {
		let anchorNode = this._selection.anchorNode,
			anchorOffset = this._selection.anchorOffset,
			endNode,
			endOffset,
			range = document.createRange();
		switch (unit) {
			case "word":
				anchorOffset = 0;
				endNode = anchorNode;
				endOffset = 5;

				range.setStart(anchorNode, anchorOffset);
				range.setEnd(endNode, endOffset);

				this._selection.removeAllRanges();
				this._selection.addRange(range);
				break;
			case "sentence":
				break;
			case "paragraph":
				break;
		}
	}

	get container() {
		this._selection.getRangeAt(0).commonAncestorContainer;
	}

	get collapsed() {
		this._selection.getRangeAt(0).collapsed;
	}

	get type() {
		return this._selection.type;
	}

	collapse(node, offset) {
		this._selection.collapse(node, offset);
	}

	toString() {
		return this._selection.toString();
	}

}
