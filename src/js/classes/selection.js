
class $election {

	constructor(node, startOffset, endOffset) {
		this._selection = document.getSelection();
		
		if (node && startOffset && endOffset) {
			this.select(node, startOffset, endOffset);
		}
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

	select(node, startOffset, endOffset) {
		let range = document.createRange(),
			textNodes = this.getOnlyTextNodes(node),
			anchorNode,
			anchorOffset = startOffset,
			focusNode,
			focusOffset = endOffset,
			il = textNodes.length,
			i = 0,
			str;
		for (; i<il; i++) {
			anchorNode = textNodes[i];
			if (anchorNode.nodeValue.length >= anchorOffset) break;
			anchorOffset -= anchorNode.nodeValue.length;
		}
		if (endOffset) {
			for (; i<il; i++) {
				focusNode = textNodes[i];
				str = focusNode.nodeValue;
				if (focusNode === anchorNode) str = str.slice(anchorOffset);
				if (str.length >= focusOffset) break;
				focusOffset -= str.length;
			}
			focusOffset += 1;
		} else {
			focusNode = focusNode || anchorNode;
			focusOffset = focusOffset || anchorOffset;
		}
		range.setStart(anchorNode, anchorOffset);
		range.setEnd(focusNode, focusOffset);
		this._selection.removeAllRanges();
		this._selection.addRange(range);
	}

	getOnlyTextNodes(node) {
		let arr = [];
		// get all text nodes with in node
		node.childNodes.map(node => {
			switch (node.nodeType) {
				case Node.TEXT_NODE:
					arr.push(node);
					break;
				case Node.ELEMENT_NODE:
					arr.push(...this.getOnlyTextNodes(node));
					break;
			}
		});
		return arr;
	}

}
