const fs = require('fs');

function readBashProfile(path) {
	fs.readFile(path, 'utf8', (err, data) => {
		if(err) return console.error(err);
		fs.writeFile(path, data+'\n# Dirbook Aliases (don\'t touch)\n', err => {
			if(err) return console.error(err);
			console.log('It saved!');
		})
	})
}

readBashProfile('/Users/nickroberts404/.bash_profile');