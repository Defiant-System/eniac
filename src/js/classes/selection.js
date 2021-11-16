
class $election {

	constructor() {
		this._selection = document.getSelection();
	}

	expand(unit) {
		switch (unit) {
			case "word":
				// remember
				this._anchorNode = this._selection.anchorNode;
				this._anchorOffset = this._selection.anchorOffset;

				this._selection.collapseToStart();
				this._selection.modify("move", "backward", "word");
				this._selection.modify("extend", "forward", "word");
				break;
			case "node":
				break;
		}
	}

	get container() {
		let el = this._selection.getRangeAt(0).commonAncestorContainer;
		if (el.nodeType == Node.TEXT_NODE) el = el.parentNode;
		return el;
	}

	get collapsed() {
		return this._selection.getRangeAt(0).collapsed;
	}

	get type() {
		return this._selection.type;
	}

	collapse(node, offset) {
		node = node || this._anchorNode;
		offset = offset || this._anchorOffset;
		this._selection.collapse(node, offset);
	}

	toString() {
		return this._selection.toString();
	}

}
