
// eniac.spawn.foot

{
	init() {
		// temp
		// let func = coord => {
		// 	let data = {
		// 			"B1": { v: 213 },
		// 			"B2": { v: 27 },
		// 			"B3": { v: "" },
		// 		};
		// 	return data[coord];
		// };
		// console.log( XLSX.utils.evalFormula("AVERAGE(B1:B3)", func) );
		// console.log( XLSX.utils.evalFormula(`IF(B1>=1; "Nonnegative"; "Negative")`, data) );

		// setTimeout(() => {
		// 	eniac.spawn.tools.table.table.select({
		// 		anchor: { y: 0, x: 1 },
		// 		yNum: [0,1,2,3],
		// 		xNum: [1],
		// 	});
		// 	this.dispatch({ type: "render-cells" });
		// }, 300);
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.spawn.foot,
			Table = APP.spawn.tools.table,
			Selection = Table.table ? Table.table.selected : false,
			Anchor = Selection ? Selection.anchor.el : false,
			Spawn = event.spawn,
			formula,
			value,
			type,
			data,
			sel,
			str,
			el;
		// console.log( event );
		switch (event.type) {
			// system events
			case "spawn.blur":
				// reset fast references
				Self.els = {};
				break;
			case "spawn.focus":
				// fast references
				Self.els = {
					root: Spawn.find("content > .foot"),
					layout: Spawn.find("layout"),
				};
				break;
			// custom events
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
			switch (token.type) {
				case "function":
					if (token.subtype === "start") out.push(`<g func="${token.value}">`);
					else if (token.subtype === "stop") out.push(`</g>`);
					else console.log("TODO 1: ", token);
					break;
				case "operand":
					out.push(`<t type="${token.subtype}" value="${token.value.escapeHtml()}"/>`);
					break;
				case "argument":
				case "operator-infix":
					out.push(`<i value="${token.value.escapeHtml()}"/>`);
					break;
				default:
					console.log("TODO 2: ", tokens);
			}
		});

		return out;
	}
}
