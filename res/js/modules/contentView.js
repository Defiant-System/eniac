
let numbers;
let sidebar;

let contentView = {
	init(_numbers, _sidebar) {
		// fast and direct references
		numbers = _numbers;
		sidebar = _sidebar;

		this.el = window.find("content > .markdown-body");
	},
	async dispatch(event) {
		switch (event.type) {
			case "load-markdown-file":
				break;
		}
	}
};

export default contentView;
