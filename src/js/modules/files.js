
const Files = {
	init() {
		// file stack
		this.stack = [];
		this.activeFile = null;
	},
	open(fsFile, opt) {
		// create file
		let file = new File(fsFile, opt);
		let xNode = file._file.xNode;
		let fileId = file._file.id;

		// add to stack
		this.stack.push(file);

		// select newly added file
		this.select(fileId);
	},
	openLocal(url) {
		let parts = url.slice(url.lastIndexOf("/") + 1),
			[ name, kind ] = parts.split("."),
			file = new defiant.File({ name, kind });
		// return promise
		return new Promise((resolve, reject) => {
			// fetch image and transform it to a "fake" file
			fetch(url)
				.then(resp => resp.blob())
				.then(blob => {
					// here the image is a blob
					file.blob = blob;
					if (blob.type === "application/xml") {
						let reader = new FileReader();

						reader.addEventListener("load", () => {
							// this will then display a text file
							file.data = $.xmlFromString(reader.result);
							resolve(file);
						}, false);

						reader.readAsText(blob);

					} else {
						resolve(file);
					}
				})
				.catch(err => reject(err));
		});
	},
	close(id) {
		
	},
	select(id) {
		// reference to active file
		this.activeFile = this.stack.find(f => f._file.id === id);
	}
};

Files.init();
