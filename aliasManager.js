// aliasManager.js is where we keep the code that manages aliases...
// It is here that we read/write from the specified file, and then reset/add aliases
// For simplicity, each time update is called, the area of the file beginning with <start> and ending with <end>
// is removed from the file. Then, if an array pof directories as been provided, we add them back. 
// Currently, aliases are always added to the beginning of the file, but it wouldn't be too difficult to keep them in one spot, 
// and even easier to write them to the end.

const fs = require('fs');
const start = '# dirbook-aliases-start\n'
const end = '# dirbook-aliases-end\n'
const prefix = 'dirbook-';

// Finds the start / end of the saved aliases. If there is a start, we assume theres an end (dangerous?)
// deleting all of the text inbetween (inclusive)
// If there is no start, we don't do anything.
function reset (data) {
	let iStart = data.indexOf(start);
	let iEnd = data.indexOf(end);
	if (iStart >= 0) {
		return data.slice(0, iStart) + data.slice(iEnd + end.length, data.length);
	}
	return data
}

// Here we concatenate the aliases together, and then smack it onto the beginning of the file and return. 
function add (data, dirs) {
	let s = start
	dirs.forEach( i => s += `\talias ${prefix+i.name}=\'cd ${i.path}\'\n`)
	s += end
	return s + data;
}

// This is where the file is read/written to. 
// If there are no dirs, only call reset.
// Otherwise, call reset then add.
function update(path, dirs) {
	fs.readFile(path, 'utf-8', (err, data) => {
		if(err) return console.error(err);
		data = reset(data);
		if(dirs) data = add(data, dirs);
		fs.writeFile(path, data, (err) => {
			if(err) return console.error(err);
		})
	})
}

module.exports = {
	update
}