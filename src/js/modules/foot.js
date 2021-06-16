
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
			str,
			el;
		switch (event.type) {
			case "hide":
				Self.els.layout.removeClass("show-footer");
				break;
			case "render-cell":
				data = {
					id: event.anchor.attr("id"),
					v: event.anchor.attr("v"),
					t: event.anchor.attr("t"),
				};
				// transform data to XML
				str = `<i type="${data.t}"><![CDATA[${data.v}]]></i>`;
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
