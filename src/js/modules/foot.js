
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
			Anchor = Selection ? Selection.anchor.el : false,
			value,
			type,
			data,
			sel,
			str,
			el;
		switch (event.type) {
			case "hide":
				Self.els.layout.removeClass("show-footer");
				break;
			case "render-cell":
				type = Anchor.attr("t") || "s";
				value = `<![CDATA[${Anchor.text()}]]>`;
				if (type === "f") {
					value = Self.strToFormula(Anchor.attr("f")).flat(1e2).join("");
				}
				str = `<i type="${type}">${value}</i>`;
				data = $.nodeFromString(str);
				console.log( data );
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
	},
	strToFormula(s) {
		let out = [];
		// console.log( s );
		// s = SUM(B2:B3)

		out.push(`<g func="sum">`);
		out.push(`  <t value="D1:D15"/>`);
		out.push(`</g>`);

		return out;
	}
}
