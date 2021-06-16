
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
			data,
			sel,
			str,
			el;
		switch (event.type) {
			case "hide":
				Self.els.layout.removeClass("show-footer");
				break;
			case "render-cells":
				sel = [];
				Parser.table.find("td.selected").map(cell => {
					let t = cell.getAttribute("t"),
						v = cell.getAttribute("v");
					sel.push(`<i type="${t}"><![CDATA[${v}]]></i>`);
				});

				if (sel.length === 1) {
					return Self.dispatch({
						type: "render-cell",
						anchor: Parser.table.find("td.selected"),
					});
				}
				
				str = `<i type="selection">${sel.join("")}</i>`
				data = $.nodeFromString(str);
				Self.dispatch({ type: "render-data", data });
				break;
			case "render-cell":
				// transform data to XML
				sel = event.anchor;
				str = `<i type="${sel.attr("t")}"><![CDATA[${sel.attr("v")}]]></i>`;
				data = $.nodeFromString(str);
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
