
class Edit {

	constructor(options) {
		this._el = options.el;
		this._keys = {
				bold: "bold",
				italic: "italic",
				underline: "underline",
				strikeThrough: "strikeThrough",
				left: "justifyLeft",
				center: "justifyCenter",
				right: "justifyRight",
				justify: "justifyFull",
			};
		// default formatting style
		this.format("styleWithCSS", true);
	}
	
	format(key, value) {
		let name = this._keys[key] || key,
			sel = new $election(),
			isCollapsed;
		// if selection, save current range
		if (sel._root) {
			sel.save();
			// expand to word, if selection is collapsed
			if (sel.collapsed) sel.expand("word");
		}
		switch (name) {
			case "font-family":
				name = "fontName";
				break;
			case "font-color":
				name = "ForeColor";
				break;
			case "font-size":
				value = `<span style="font-size: ${value}px;">${sel.toString()}</span>`;
				name = "insertHTML";
				break;
		}
		document.execCommand(name, false, value || null);
		// restore range
		if (sel._root) sel.restore();
	}

	state() {
		let El = this._el,
			sel = new $election,
			el = $(sel.container),
			value,
			color = Color.rgbToHex(document.queryCommandValue("ForeColor")).slice(0,-2),
			fontFamily = el.css("font-family"),
			fontSize = parseInt(el.css("font-size"), 10),
			lineHeight = parseInt(el.css("line-height"), 10);
		// set value of font color
		El.find(`.color-preset_[data-change="set-text-color"]`).css({ "--preset-color": color });
		// font family
		if (fontFamily.startsWith('"') && fontFamily.endsWith('"')) {
			fontFamily = fontFamily.slice(1,-1);
		}
		El.find(`selectbox[data-change="set-text-font-family"]`).val(fontFamily);
		// font size
		El.find(`input[name="text-font-size"]`).val(fontSize);
		// line height
		value = (lineHeight / fontSize).toFixed(1).toString();
		El.find(`selectbox[data-menu="text-line-height"]`).val(value);
		// iterate
		Object.keys(this._keys).map(key => {
			let name = this._keys[key],
				value = document.queryCommandState(name);
			El.find(`[data-name="${key}"]`).toggleClass("active_", !value);
		});
	}

}
