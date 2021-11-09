
// eniac.foot

{
	init() {
		// fast references
		this.els = {
			root: window.find("content > .foot"),
			layout: window.find("layout"),
		};
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.foot,
			Selection = APP.tools.table.table.selected,
			data,
			type,
			sel,
			str,
			el;
		switch (event.type) {
			case "hide":
				Self.els.layout.removeClass("show-footer");
				break;
			case "render-cell":
				type = Selection.anchor.el.attr("t") || "s";
				console.log(type);
				str = `<i type="${type}"><![CDATA[${Selection.anchor.el.text()}]]></i>`;
				data = $.nodeFromString(str);
				// render cell data
				Self.dispatch({ type: "render-data", data });
				break;
			case "render-data":
				// render data to HTML
				window.render({
					template: "footer",
					target: Self.els.root,
					data: event.data,
				});
				// show footer
				Self.els.layout.addClass("show-footer");
				break;
		}
	}
}
