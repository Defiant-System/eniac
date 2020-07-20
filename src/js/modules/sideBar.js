
let numbers;
let contentView;

let sideBar = {
	init(_numbers, _contentView) {
		// fast and direct references
		numbers = _numbers;
		contentView = _contentView;

		this.el = window.find("sidebar");

		// temp
		//this.el.find(".head span:nth-child(4)").trigger("click");
	},
	async dispatch(event) {
		let el,
			pEl,
			isOn;
		switch (event.type) {
			case "sidebar-toggle-view":
				isOn = sideBar.el.hasClass("hidden");
				sideBar.el.toggleClass("hidden", isOn);
				return isOn ? "active" : "";
			case "sidebar-select-tab":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				
				pEl = event.el.parent();
				pEl.find(".body.active").removeClass("active");
				pEl.find(".body").get(el.index()).addClass("active");
				break;
		}
	}
};

export default sideBar;
