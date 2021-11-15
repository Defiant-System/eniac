
class $election {

	constructor(className) {
		this._selection = document.getSelection();

		let root = this._selection.anchorNode;
		if (!root) return;
		// climb to root node
		while (root.nodeType !== Node.ELEMENT_NODE || !root.classList.contains(className)) {
			root = root.parentNode;
		}
		this._root = root;

		let tmp = this.getOnlyTextNodes(root);
		console.log(tmp);
	}

	expand(unit) {
		let range = document.createRange(),
			anchorNode = this._selection.anchorNode,
			anchorOffset = this._selection.anchorOffset,
			endNode,
			endOffset,
			goLeft = (sNode, stopChar) => {
				return node;
			},
			goRight = (node, stopChar) => {
				return node;
			},
			str,
			rx;
		switch (unit) {
			case "word":
				// let { node, offset } = goLeft(anchorNode, anchorOffset, " ");
				// console.log( node, offset );

				// find word start offset
				str = anchorNode.nodeValue.slice(0, anchorOffset);
				anchorOffset = str.lastIndexOf(" ") + 1;

				endNode = goRight(anchorNode, " ");
				
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

	getOnlyTextNodes(pNode) {
		let arr = [];
		pNode.childNodes.map(node => {
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
