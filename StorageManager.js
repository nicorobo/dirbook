const path = require('path');
const inq = require('inquirer');
const chalk = require('chalk');
const questions = require('./questions');
const exec = require('child_process').exec;
const db = require('lowdb')(path.join(__dirname, 'db.json'));

// Sets db's defaults if empty
db.defaults({directories: [], profilePath: ""})
    .write();


// Returns true if an element with this path is already stored, false if it doesn't
function exists(path) {
    return !!db.get('directories').find({path}).value()
}

// Prints out all saved directories, filtering by tag if a tag was given
function list({tag}) {
    let dirs;
    if (tag) dirs = db.get('directories').filter(i => i.tags.includes(tag)).value();
    else dirs = db.get('directories').value();
    if (dirs.length < 1) {
        tagAlert()
        return false;
    }
    dirs.forEach(d => console.log(`${chalk.cyan(d.name)} ${chalk.dim(d.desc)} ${chalk.magenta(deserializeTags(d.tags))}`))
}

// Adds directory with given path to the db, querying user for any details
function add() {
    const pathname = process.cwd();
    const dirname = path.basename(pathname);
    
    if (exists(pathname)) return console.log(`${chalk.magenta.dim(dirname)} has already been added!`);

    inq.prompt(questions.add({name: dirname}))
        .then(ans => {
            const {name, desc, confirm, tags} = ans;
            if (!confirm) return false;
            db.get('directories')
                .push({path: pathname, name, desc, tags: serializeTags(tags)})
                .write()
        });
}

// Shows a list of saved directories, allowing user to select one and copy its contents,
// along with a new name, to the current directory.
function copy({tag}) {
    const pathname = process.cwd();
    let dirs;
    if (tag) dirs = db.get('directories').filter(i => i.tags.includes(tag)).value();
    else dirs = db.get('directories').value();
    if (dirs.length < 1) {
        tagAlert()
        return false;
    }
    inq.prompt(questions.copy(dirs))
        .then(ans => {
            const {path, name, confirm} = ans;
            if (!confirm) return false;
            exec(`cp -r ${path} ${pathname}/${name}`);
        });
}

function open({tag}) {
    let dirs;
    if (tag) dirs = db.get('directories').filter(i => i.tags.includes(tag)).value();
    else dirs = db.get('directories').value();
    if (dirs.length < 1) {
        tagAlert()
        return false;
    }
    inq.prompt(questions.open(dirs)).then(ans => {
        exec(`cd ${ans.path} && open .`);
    });
}

function select({tag}) {
    let dirs;
    if (tag) dirs = db.get('directories').filter(i => i.tags.includes(tag)).value();
    else dirs = db.get('directories').value();
    if (dirs.length < 1) {
        tagAlert()
        return false;
    }
    inq.prompt(questions.select(dirs)).then(ans => {
        let {selected, action} = ans;
        if(selected.length <= 0) return false;
        if(action === 'edit') edit(selected[0]);
        else if(action === 'remove') remove(selected);
        else if(action === 'add-tags') addTags(selected);
    });
}

function addTags(selected) {
    inq.prompt(questions.addTags()).then(ans => {
        const {tags, confirm} = ans;
        if (!confirm) return false;
        const tagsArray = serializeTags(tags);
        db.get('directories')
            .filter(i => selected.includes(i.path))
            .each(i => Object.assign(i, {tags: i.tags.concat(tagsArray)}))
            .write()
    });
}

function remove(selected) {
    inq.prompt(questions.remove(selected.length)).then(ans => {
        if(!ans.confirm) return false;
        db.get('directories')
            .remove(i => selected.includes(i.path))
            .write()
    })
}

// Fetches data for given directory, then asks user what they'd like to change, writing the results
function edit(path) {
    const f = db.get('directories').find({path}).value();
    const defaults = {name: f.name, desc: f.desc, tags: f.tags.join(', ')}
    inq.prompt(questions.add(defaults))
        .then(ans => {
            const {name, desc, confirm, tags} = ans;
            if (!confirm) return false;
            db.get('directories')
                .find({path})
                .assign({name, desc, tags: serializeTags(tags)})
                .write()
        });
}

// Receives a string "node, react, template" and returns an array ["node","react","template"]
function serializeTags(tags) {
    return tags.trim() === "" 
        ? []
        : tags.split(',').map(t => t.trim());
}

// Receives an array ["node","react","template"] and returns a string "[node][react][template]"
function deserializeTags(tags) {
    return tags.length < 1
        ? ''
        : tags.map(t => '['+t+']').join('');
}

// Alerts user that there are no directories saved
function emptyAlert() {
    return console.log(chalk.yellow('There is nothing saved in dirbook!'));
}

// Alerts user that there are no directories with the tag they are filtering with
function tagAlert() {
    return console.log(chalk.yellow('There is nothing saved in dirbook with that tag!'));
}

// Used to drop the db. Confirms with user first.
function reset() {
    inq.prompt(questions.reset()).then(ans => {
        if(ans.confirm) {
            db.setState({});
        }
    });
}

module.exports = {
    list,
    add,
    copy,
    open,
    select,
    reset
}
