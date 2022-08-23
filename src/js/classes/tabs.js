
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

	get sidebar() {
		return this._active.sidebar;
	}

	set sidebar(value) {
		this._active.sidebar = !value;
	}

	setFocusElement(el) {
		// focus element
		this._active.focusEl = el;
	}

	add(fItem) {
		// let file = fItem || new File();
		let file = fItem || { base: "Blank" },
			tId = "f"+ Date.now(),
			tName = file ? file.base : "Blank",
			tabEl = this._spawn.tabs.add(tName, tId),
			bodyEl = this._template.clone(),
			history = new window.History,
			sidebar = false;

		// add element to DOM + append file contents
		bodyEl.attr({ "data-id": tId });
		bodyEl = this._content.append(bodyEl);

		if (file._file) file.bodyEl = bodyEl;

		// save reference to tab
		this._stack[tId] = { tId, tabEl, bodyEl, history, file, sidebar };
		// focus on file
		this.focus(tId);
		
		if (file._file) {
			// default renders
			file.dispatch({ type: "render-sheet", spawn: this._spawn });
		}
	}

	merge(ref) {
		let tId = ref.tId,
			file = ref.file,
			history = ref.history,
			sidebar = ref.sidebar,
			bodyEl = ref.bodyEl.clone(true).addClass("hidden"),
			tabEl = this._spawn.tabs.add(file.base, tId, true);
		// clone & append original bodyEl
		bodyEl = this._content.append(bodyEl);
		// save reference to this spawns stack
		this._stack[tId] = { tId, tabEl, bodyEl, history, file, sidebar };
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
			if (active.file._file) {
				// reset sheetnames
				active.file.dispatch({ type: "reset-sheet-names", spawn });
			}
			// hide blurred body
			active.bodyEl.addClass("hidden");
		}
		// reference to active tab
		this._active = this._stack[tId];
		// UI update
		this.update();

		this._parent.sidebar.dispatch({
			type: "toggle-sidebar",
			isOn: !this._active.sidebar,
		});

		if (this._active.file._file) {
			// hide blank view
			this._parent.els.layout.removeClass("show-blank-view");
			// enable toolbar
			this._parent.dispatch({ type: "toggle-toolbars", value: true });
		} else {
			setTimeout(() => {
				// show blank view
				this._parent.els.layout.addClass("show-blank-view");
				// disable toolbar
				this._parent.dispatch({ type: "toggle-toolbars", value: null });
			}, 10);
		}
	}

	update() {
		let spawn = this._spawn,
			active = this._active,
			focusEl = active.focusEl || active.bodyEl;
		// unhide focused body
		active.bodyEl.removeClass("hidden");
		// update spawn window title
		spawn.title = active.file.base;
		
		if (active.file._file) {
			// default renders
			active.file.dispatch({ type: "render-sheet-names", spawn });
			// focus element
			focusEl.trigger("mousedown").trigger("mouseup");
		}
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
