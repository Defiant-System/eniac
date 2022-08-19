
// eniac.spawn.sidebar.functions

{
	init(parent) {
		// fast references
		this.parent = parent;
		this.els = {
			root: window.find(".sidebar-functions"),
			matchList: window.find(".sidebar-functions .search-matches"),
		}

		// render sidebar function list
		window.render({
			template: "functions-list",
			target: this.els.matchList,
		});

		// temp
		setTimeout(() => {
			this.els.matchList.find("li:nth-child(1)").trigger("click");
		});
	},
	dispatch(event) {
		let APP = eniac,
			Self = APP.spawn.sidebar.functions,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "populate-functions-values":
				// tab: Functions
				break;
			case "see-also":
			case "show-function":
				el = $(event.target);
				name = el.text();
				// indicate active element
				el.parent().find(".active").removeClass("active");
				el.addClass("active");
				// function header
				Self.els.root.find(".fn-head h2 span").html(name);
				// render sidebar contents
				window.render({
					template: "function-body",
					match: `//Functions/i[@name="${name}"]`,
					target: Self.els.root.find(".fn-body"),
				});
				break;
		}
	},
	move(event) {
		
	}
}
