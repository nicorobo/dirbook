const fs = require('fs');
const exec = require('child_process').exec;
const start = '# dirbook-aliases-start\n'
const end = '# dirbook-aliases-end\n'
const prefix = 'dirbook-';

function reset (data) {
	let iStart = data.indexOf(start);
	let iEnd = data.indexOf(end);
	if (iStart >= 0) {
		return data.slice(0, iStart) + data.slice(iEnd + end.length, data.length);
	}
	return data
}
function add (data, dirs) {
	let s = start
	dirs.forEach( i => s += `\talias ${prefix+i.name}=\'cd ${i.path}\'\n`)
	s += end
	return s + data;
}

function update(path, dirs) {
	fs.readFile(path, 'utf-8', (err, data) => {
		if(err) return console.error(err);
		data = reset(data);
		if(dirs) data = add(data, dirs);
		fs.writeFile(path, data, (err) => {
			if(err) return console.error(err);
			exec(`source ${path}`);
		})
	})
}

module.exports = {update}