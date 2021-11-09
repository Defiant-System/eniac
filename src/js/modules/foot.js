
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
		// console.log( XLSX.utils.evalFormula("SUM(B1:B3)", data) );
		// console.log( XLSX.utils.evalFormula("CONCAT(\"hello\"; 123)") );

		setTimeout(() => {
			// parent.els.el.find(".sidebar-table input#table-clip").trigger("click");
			eniac.tools.table.table.select({
				anchor: { y: 0, x: 1 },
				yNum: [0,1,2,3],
				xNum: [1],
			});

			this.dispatch({ type: "render-cells" });
		}, 300);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.foot,
			Table = APP.tools.table,
			Selection = Table.table.selected,
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
			case "render-cells":
				value = [];
				// accumulate selected cell & values
				Table.table._el.find(".selected").map(cell => {
					let el = $(cell),
						t = el.attr("t"),
						v = el.text();
					value.push(`<i type="${t}"><![CDATA[${v}]]></i>`);
				});
				str = `<i type="selection">${value.join("")}</i>`;
				data = $.nodeFromString(str);
				// render cell data
				Self.dispatch({ type: "render-data", data });
				break;
			case "render-cell":
				if (Selection.yNum.length > 1 || Selection.xNum.length > 1) {
					return Self.dispatch({ type: "render-cells" });
				}
				type = Anchor.attr("t") || "s";
				value = `<![CDATA[${Anchor.text()}]]>`;
				formula = Anchor.attr("f");
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
					out.push(`<t type="${token.subtype}" value="${token.value}"/>`);
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
