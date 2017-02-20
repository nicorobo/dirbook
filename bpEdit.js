const fs = require('fs');
const start = '# dirbook-aliases-start\n'
const end = '# dirbook-aliases-end\n'
const prefix = 'dirbook-';

function update(dirs, path) {
	fs.readFile(path, 'utf-8', (err, data) => {
		if(err) return console.error(err);
		let iStart = data.indexOf(start);
		let iEnd = data.indexOf(end);
		if (iStart >= 0) {
			data = data.slice(0, iStart) + data.slice(iEnd + end.length, data.length);
		} else {
			iStart = 0
		}
		let s = start
		dirs.forEach( i => s += `\talias ${prefix+i.name}=\'cd ${i.path}\'\n`)
		s += end
		data = data.slice(0, iStart) + s + data.slice(iStart, data.length);
		fs.writeFile(path, data, (err) => {
			if(err) return console.error(err);
			console.log('Bash Profile Updated');
		})
	})
	
}

module.exports = {update}