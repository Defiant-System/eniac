
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
			tabEl = this._spawn.tabs.add(file.base, tId),
			bodyEl = this._template.clone(),
			data = "file: "+ tId; // file.data;

		// add element to DOM + append file contents
		bodyEl.attr({ "data-id": tId }).html(data);
		bodyEl = this._content.append(bodyEl);
		// save reference to tab
		this._stack[tId] = { tId, tabEl, bodyEl, history, file };
		// focus on file
		this.focus(tId);
	}

	merge(ref) {
		
	}

	remove(tId) {
		this._stack[tId] = false;
		delete this._stack[tId];
	}

	focus(tId) {
		if (this._active) {
			// hide blurred body
			this._active.bodyEl.addClass("hidden");
		}
		// reference to active tab
		this._active = this._stack[tId];
		// UI update
		this.update();
	}

	update() {
		let active = this._active;
		// unhide focused body
		active.bodyEl.removeClass("hidden");

		// update spawn window title
		this._spawn.title = active.file.base;
		
	}
}
