
import sideBar from "./modules/sideBar"
import contentView from "./modules/contentView"

const numbers = {
	init() {
		sideBar.init(numbers, contentView);
		contentView.init(numbers, sideBar);
	},
	async dispatch(event) {
		let data;
		switch (event.type) {
			case "open.file":
				break;
			case "content-toggle-lights":
				return contentView.dispatch(data || event);
			case "sidebar-toggle-view":
			case "sidebar-select-tab":
				return sideBar.dispatch(event);
		}
	}
};

window.exports = numbers;
