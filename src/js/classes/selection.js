
class $election {

	constructor(className) {
		this._selection = document.getSelection();
		this._root = this.getParent(this._selection.anchorNode, className);
	}

	expand(unit) {
		let range = document.createRange(),
			startNode = this._selection.anchorNode,
			startOffset = this._selection.anchorOffset,
			anchorNode,
			anchorOffset,
			focusNode, focusOffset,
			parentNode,
			textNodes,
			str;
		switch (unit) {
			case "word":
				parentNode = this.getParent(startNode);
				textNodes = this.getOnlyTextNodes(parentNode);
				
				let index = textNodes.indexOf(startNode) + 1;
				while (index--) {
					anchorNode = textNodes[index];
					str = anchorNode.nodeValue;
					if (startNode === anchorNode) {
						str = str.slice(0, startOffset);
					}
					anchorOffset = str.lastIndexOf(" ");
					if (anchorOffset > -1) {
						anchorOffset += 1;
						break;
					}
				}
				// find focusNode + focusOffset
				for (let i=textNodes.indexOf(startNode), il=textNodes.length; i<il; i++) {
					focusNode = textNodes[i];
					str = focusNode.nodeValue;
					if (startNode === focusNode) {
						str = str.slice(startOffset);
					}
					focusOffset = str.indexOf(" ");
					if (focusOffset > -1) {
						if (anchorNode === focusNode) focusOffset += startOffset;
						break;
					}
				}
				// // create range
				range.setStart(anchorNode, anchorOffset);
				range.setEnd(focusNode, focusOffset);
				this._selection.removeAllRanges();
				this._selection.addRange(range);
				break;
			case "node":
				break;
		}
	}

	getParent(node, className) {
		if (node) {
			// climb to root node
			while (node.nodeType !== Node.ELEMENT_NODE || (className ? !node.classList.contains(className) : node.nodeName !== "P")) {
				node = node.parentNode;
			}
		}
		return node;
	}

	getOnlyTextNodes(node) {
		let stayWithIn = node || this._root,
			arr = [];
		// get all text nodes with in node
		stayWithIn.childNodes.map(node => {
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
