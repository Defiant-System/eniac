
class Tabs {
	constructor(parent, spawn) {
		this._parent = parent;
		this._spawn = spawn;
		this._stack = {};
		this._active = null;

		// sheet template
		let template = spawn.find(`.sheet-tables .sheet-template`);
		this._content = spawn.find(".sheet-tables");
		this._template = template.clone(true).removeClass("sheet-template").addClass("file-sheet");
		template.remove();
	}

	get file() {
		return this._active.file;
	}

	get length() {
		return Object.keys(this._stack).length;
	}

	add(file) {
		let tId = "f"+ Date.now(),
			history = new window.History,
			spawn = this._spawn,
			tabEl = spawn.tabs.add(file.base, tId),
			bodyEl = this._template.clone();

		// add element to DOM + append file contents
		bodyEl.attr({ "data-id": tId });
		bodyEl = this._content.append(bodyEl);

		file.bodyEl = bodyEl;

		// save reference to tab
		this._stack[tId] = { tId, tabEl, bodyEl, history, file };
		// focus on file
		this.focus(tId);
		
		// default renders
		file.dispatch({ type: "render-sheet-names", spawn });
		file.dispatch({ type: "render-sheet", spawn });
	}

	merge(ref) {
		
	}

	remove(tId) {
		// remove element from DOM tree
		this._stack[tId].bodyEl.remove();
		// delete references
		this._stack[tId] = false;
		delete this._stack[tId];
	}

	focus(tId) {
		let spawn = this._spawn,
			active = this._active;
		if (active) {
			// reset sheetnames
			active.file.dispatch({ type: "reset-sheet-names", spawn });
			// hide blurred body
			active.bodyEl.addClass("hidden");
		}
		// reference to active tab
		this._active = this._stack[tId];
		// UI update
		this.update();
	}

	setFocusElement(el) {
		// focus element
		this._active.focusEl = el;
	}

	update() {
		let spawn = this._spawn,
			active = this._active,
			focusEl = active.focusEl || active.bodyEl;
		// unhide focused body
		active.bodyEl.removeClass("hidden");
		// update spawn window title
		spawn.title = active.file.base;
		// focus element
		focusEl.trigger("mousedown").trigger("mouseup");
	}

	openLocal(url) {
		let parts = url.slice(url.lastIndexOf("/") + 1),
			[ name, kind ] = parts.split("."),
			file = new karaqu.File({ name, kind });
		// return promise
		return new Promise((resolve, reject) => {
			// fetch image and transform it to a "fake" file
			fetch(url)
				.then(resp => resp.blob())
				.then(blob => {
					// here the image is a blob
					file.blob = blob;
					if (blob.type === "application/xml") {
						let reader = new FileReader();

						reader.addEventListener("load", () => {
							// this will then display a text file
							file.data = $.xmlFromString(reader.result);
							resolve(file);
						}, false);

						reader.readAsText(blob);

					} else {
						resolve(file);
					}
				})
				.catch(err => reject(err));
		});
	}
}
