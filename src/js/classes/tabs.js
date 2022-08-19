
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
			data = ""; // file.data;

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

	update() {
		let spawn = this._spawn,
			active = this._active;
		// unhide focused body
		active.bodyEl.removeClass("hidden");

		// update spawn window title
		spawn.title = active.file.base;
		
		active.file.dispatch({ type: "render-sheet-names", spawn });
	}
}
