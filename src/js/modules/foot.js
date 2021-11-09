
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
		// 	"B1": { v: 213 },
		// 	"B2": { v: 27 },
		// 	"B3": { v: 3 },
		// };
		// console.log( XLSX.utils.evalFormula("SUM(B1;B3)", data) );
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.foot,
			Selection = APP.tools.table.table.selected,
			Anchor = Selection ? Selection.anchor.el : false,
			formula,
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
				formula = Anchor.attr("f"); //.replace(/;/g, ",");
				if (formula) {
					type = "f";
					value = Self.strToFormula(formula).flat(1e2).join("");
				}
				str = `<i type="${type}">${value}</i>`;
				data = $.nodeFromString(str);
				// console.log( data );
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
	strToFormula(str) {
		let out = [],
			{ tree, tokens } = XLSX.utils.parseFormula(str);

		tokens.map(token => {
			// console.log(token);
			switch (token.type) {
				case "function":
					if (token.subtype === "start") out.push(`<g func="${token.value}">`);
					else if (token.subtype === "stop") out.push(`</g>`);
					else console.log("TODO 1: ", token);
					break;
				case "operand":
					out.push(`<t value="${token.value}"/>`);
					break;
				case "argument":
				case "operator-infix":
					out.push(`<i value="${token.value}"/>`);
					break;
				default:
					console.log("TODO 2: ", tokens);
			}
		});

		return out;
	}
}
