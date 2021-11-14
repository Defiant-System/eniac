
class $election {

	constructor() {
		this._selection = document.getSelection();
	}

	expand(unit) {
		let range = document.createRange(),
			anchorNode = this._selection.anchorNode,
			anchorOffset = this._selection.anchorOffset,
			endNode,
			endOffset,
			nextNode = node => {
				return node;
			},
			prevNode = node => {

			},
			str,
			rx;
		switch (unit) {
			case "word":
				// find word start offset
				str = anchorNode.nodeValue.slice(0, anchorOffset);
				anchorOffset = str.lastIndexOf(" ") + 1;

				endNode = nextNode(anchorNode);
				
				str = anchorNode.nodeValue.slice(anchorOffset);
				endOffset = anchorOffset + str.indexOf(" ");

				range.setStart(anchorNode, anchorOffset);
				range.setEnd(endNode, endOffset);

				this._selection.removeAllRanges();
				this._selection.addRange(range);
				break;
			case "node":
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
