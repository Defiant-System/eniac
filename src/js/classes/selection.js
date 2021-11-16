
class $election {

	constructor(node, startOffset, endOffset) {
		this._selection = document.getSelection();
		// select if provided
		if (node && startOffset) this.select(...arguments);
		// reference to root node
		this._root = this.getRoot();
	}

	expand(unit) {
		switch (unit) {
			case "word":
				// remember
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
		if (this.collapsed) return;
		node = node || this._anchorNode;
		offset = offset || this._anchorOffset;
		this._selection.collapse(node, offset);
	}

	toString() {
		return this._selection.toString();
	}

	save() {
		let textNodes = this.getOnlyTextNodes(this._root),
			anchorNode = this._selection.anchorNode,
			anchorOffset = this._selection.anchorOffset,
			len = textNodes.indexOf(anchorNode) + 1,
			offset = 0,
			str;
		while (len--) {
			str = textNodes[len].nodeValue.toString();
			if (textNodes[len] === anchorNode) {
				str = str.slice(0, anchorOffset);
			}
			offset += str.length;
		}
		this._startOffset = offset;
		this._endOffset = this._selection.toString().length;
	}

	restore() {
		if (!this._root) return;
		// console.log(this._root, this._startOffset, this._endOffset);
		this.select(this._root, this._startOffset, this._endOffset);
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
			if (anchorNode === focusNode) focusOffset += anchorOffset;
			// else focusOffset += 1;
		} else {
			focusNode = anchorNode;
			focusOffset = anchorOffset;
		}
		// console.log(anchorNode, anchorOffset);
		// console.log(focusNode, focusOffset);
		range.setStart(anchorNode, anchorOffset);
		range.setEnd(focusNode, focusOffset);
		this._selection.removeAllRanges();
		this._selection.addRange(range);
	}

	getOnlyTextNodes(node) {
		let arr = [];
		// get all text nodes with in node
		node.childNodes.map(node => {
			// console.log(node);
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

	getRoot() {
		let node = this._selection.baseNode;
		if (!node) return;
		// climb to root node
		while (node.nodeType !== Node.ELEMENT_NODE || !node.getAttribute("contenteditable")) {
			node = node.parentNode;
		}
		return node;
	}

}
