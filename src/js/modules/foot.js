
// eniac.foot

{
	init() {
		// fast references
		this.els = {
			root: window.find("content > .foot"),
			layout: window.find("layout"),
		};

		// temp
		// let data = {
		// 		type: "text",
		// 		value: "Some string 123",
		// 	};
		// this.dispatch({ type: "render-data", data });
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
				console.log(Self.els.layout);
				break;
			case "transform-data":
				str = `<i type="${event.data.type}"><![CDATA[${event.data.value}]]></i>`;
				return $.nodeFromString(str);
			case "render-data":
				// transform data to XML
				data = Self.dispatch({ type: "transform-data", data: event.data });
				// render data to HTML
				window.render({
					template: "footer",
					target: Self.els.root,
					data,
				});
				// show footer
				Self.els.layout.addClass("show-footer");
				break;
		}
	}
}
