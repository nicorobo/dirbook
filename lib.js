// lib.js is where the actions invoked by the CLI live.
// It appears a little monolithic, but it's nice to have the methods in one place as long as there aren't too many.
// The methods are seperated into two sections, actions and helpers.
// Most actions will need user input, received by using inquirer with the appropriate 'questions'

const path = require('path');
const inq = require('inquirer');
const chalk = require('chalk');
const questions = require('./questions');
const exec = require('child_process').exec;
const am = require('./aliasManager');

// Creates the db object using db.json found in the modules directory
const db = require('lowdb')(path.join(__dirname, 'db.json'));

const defaults = {directories: [], alias: {active: false, path: '', prefix: 'dirbook-'}}
// Sets db's defaults if empty
db.defaults(defaults)
    .write();

//
// Action Methods
//

// Prints out all saved directories, filtering by tag if a tag was given
function list(filter) {
    const dirs = getFilteredDirs(filter);
    if(!dirs) return false;
    dirs.forEach(d => console.log(`${chalk.cyan(d.name)} ${chalk.dim(d.desc)} ${chalk.magenta(deserializeTags(d.tags))}`))
}

// Adds directory with given path to the db, querying user for any details
function add() {
    const pathname = process.cwd();
    const dirname = path.basename(pathname);
    
    if (exists(pathname)) return console.log(`${chalk.magenta.dim(dirname)} has already been added!`);

    inq.prompt(questions.add({name: dirname})).then(ans => {
        const {name, desc, confirm, tags} = ans;
        if (!confirm) return false;
        db.get('directories')
            .push({path: pathname, name, desc, tags: serializeTags(tags)})
            .write()
        updateAliases()
    });
}

// Shows a list of saved directories, allowing user to select one and copy its contents,
// along with a new name, to the current directory
function copy(filter) {
    const pathname = process.cwd();
    const dirs = getFilteredDirs(filter);
    if(!dirs) return false;
    inq.prompt(questions.copy(dirs)).then(ans => {
        const {path, name, confirm} = ans;
        if (!confirm) return false;
        exec(`cp -r ${path} ${pathname}/${name}`);
    });
}

// Opens the chosen directory in Finder (probably something else in Windows/Linux)
function open(filter) {
    const dirs = getFilteredDirs(filter);
    if(!dirs) return false;
    inq.prompt(questions.open(dirs)).then(ans => {
        exec(`cd ${ans.path} && open .`);
    });
}

// Displays list of directories, allowing user to select one or many, and then choose an action to perform
// If only one directory is chosen, edit is an option. remove and add-tags are options regardless
function select(filter) {
    const dirs = getFilteredDirs(filter);
    if(!dirs) return false;
    inq.prompt(questions.select(dirs)).then(ans => {
        let {selected, action} = ans;
        if(selected.length <= 0) return false;
        if(action === 'edit') edit(selected[0]);
        else if(action === 'remove') remove(selected);
        else if(action === 'add-tags') addTags(selected);
    });
}

// Used to drop the db. Confirms with user first.
function reset() {
    inq.prompt(questions.reset()).then(ans => {
        if(ans.confirm) {
            db.setState(defaults);
            updateAliases();
        }
    });
}

function aliasSettings({active, off, prefix, path}) {
    if (active) handleAliasOn();
    if (off) handleAliasOff();
    if (prefix) handleAliasPrefix(prefix);
    if (path) handleAliasPath(path);
    printAliasSettings();
}

//
// Semi-Action Methods
//

// (Only called by select()) Adds tag(s) to selected directories
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

// (Only called by select()) Remove selected directories from the db
function remove(selected) {
    inq.prompt(questions.remove(selected.length)).then(ans => {
        if(!ans.confirm) return false;
        db.get('directories')
            .remove(i => selected.includes(i.path))
            .write()
        updateAliases()
    })
}

// (Only called by select()) Fetches data for given directory, then asks user what they'd like to change, writing the results
function edit(path) {
    const f = db.get('directories').find({path}).value();
    const defaults = {name: f.name, desc: f.desc, tags: f.tags.join(', ')}
    inq.prompt(questions.add(defaults)).then(ans => {
        const {name, desc, confirm, tags} = ans;
        if (!confirm) return false;
        db.get('directories')
            .find({path})
            .assign({name, desc, tags: serializeTags(tags)})
            .write()
        updateAliases()
    });
}

function handleAliasOn() {
    db.get('alias').assign({active: true}).write();
    updateAliases();
}

function handleAliasOff() {
    db.get('alias').assign({active: false}).write();
    clearAliases();
}

function handleAliasPrefix(prefix) {
    db.get('alias').assign({prefix}).write();
    updateAliases();
}

// If aliases were saved somewhere else previously, remove them before updating the path.
function handleAliasPath(path) {
    const curPath = db.get('alias').get('path').value()
    if(curPath !== path) clearAliases();
    db.get('alias').assign({path}).write();
    updateAliases();
}

//
// Helper Methods
//

function updateAliases() {
    const {active, prefix, path} = db.get('alias').value();
    if(!active) return false;
    if (!path) return console.log('No bash profile path set')
    am.update(path, db.get('directories').value(), prefix)
}

function clearAliases() {
    const {active, path} = db.get('alias').value();
    if (!path) return console.log('No bash profile path set')
    am.update(path)
}

// Returns true if an element with this path is already stored, false if it doesn't
function exists(path) {
    return !!db.get('directories').find({path}).value()
}

// Returns a list of saved directories, filtered by any filter given. If the resulting list is empty, return false
function getFilteredDirs({tag}) {
    let dirs;
    if (tag) dirs = db.get('directories').filter(i => i.tags.includes(tag)).value();
    else dirs = db.get('directories').value();
    if (dirs.length < 1) {
        if (tag) tagAlert();
        else emptyAlert();
        return false;
    }
    else return dirs
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

function printAliasSettings() {
    const { active, prefix, path } = db.get('alias').value();
    return console.log(chalk.yellow(`Alias status: ${active ? 'on' : 'off'}\nAlias path: ${path}\nAlias prefix: ${prefix}`));
}

module.exports = {
    list,
    add,
    copy,
    open,
    select,
    aliasSettings,
    reset
}
