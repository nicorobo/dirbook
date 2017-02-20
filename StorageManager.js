const fs = require('fs');
const path = require('path');
const inq = require('inquirer');
const chalk = require('chalk');
const questions = require('./questions');
const exec = require('child_process').exec;

module.exports = class StorageManager {
    constructor(path) {
        this.path = path;
        this.data = this.getData();
        this.add = this.add.bind(this);
        this.copy = this.copy.bind(this);
        this.open = this.open.bind(this);
        this.select = this.select.bind(this);
        this.list = this.list.bind(this);
        this.reset = this.reset.bind(this);
    }

    getData() {
        try { return require(this.path) || [] } 
        catch (e) { return [] }
    }

    exists(path) {
        return this.data.some(dir => dir.path === path)
    }

    get(path) {
        return this.data.filter(d => d.path === path)[0];
    }

    list({tag}) {
        let {data} = this;
        if(data.length <= 0) return this.emptyAlert();
        if (tag) {
            data = data.filter(d => d.tags.includes(tag))
            if (data.length <= 0) return this.tagAlert();
        }
        data.forEach(d => console.log(`${chalk.cyan(d.name)} ${chalk.dim(d.desc)} ${chalk.magenta(d.tags.map(t => '['+t+']').join(''))}`))
    }

    add() {
        const pathname = process.cwd();
        const dirname = path.basename(pathname);
        
        if (this.exists(pathname)) return console.log(`${chalk.magenta.dim(dirname)} has already been added!`);

        inq.prompt(questions.add({name: dirname})).then(ans => {
            const {name, desc, confirm, tags} = ans;
            if (!confirm) return false;
            const tagsArray = tags.split(',').map(t => t.trim());
            this.data = [].concat(this.data, [{path: pathname, name, desc, tags: tagsArray}]);
            this.writeData();
        });
    }

    copy({tag}) {
        let {data} = this;
        const pathname = process.cwd();
        if (data.length <= 0) return this.emptyAlert();
        if (tag) {
            data = data.filter(d => d.tags.includes(tag))
            if (data.length <= 0) return this.tagAlert();
        }
        inq.prompt(questions.copy(data)).then(ans => {
            const {path, name, confirm} = ans;
            if (!confirm) return false;
            exec(`cp -r ${path} ${pathname+'/'+name}`);
        });
    }

   open({tag}) {
        let {data} = this;
        if (data.length <= 0) return this.emptyAlert();
        if (tag) {
            data = data.filter(d => d.tags.includes(tag))
            if (data.length <= 0) return this.tagAlert();
        }
        inq.prompt(questions.open(data)).then(ans => {
            const {path} = ans;
            exec(`cd ${path} && open .`);
        });
    }

    select({tag}) {
        let {data} = this;
        if(data.length <= 0) return this.emptyAlert();
        if (tag) {
            data = data.filter(d => d.tags.includes(tag))
            if (data.length <= 0) return this.tagAlert();
        }
        inq.prompt(questions.select(data)).then(ans => {
            let {selected, action} = ans;
            if(selected.length <= 0) return false;
            if(selected.length === 1) selected = selected[0];

            if(action === 'edit') this.edit(selected);
            if(action === 'remove') this.remove(selected);
            if(action === 'add-tags') this.addTags(selected);
        });
    }

    addTags(selected) {
        inq.prompt(questions.addTags()).then(ans => {
            const {tags, confirm} = ans;
            if (!confirm) return false;
            const tagsArray = tags.split(',').map(t => t.trim());
            this.data = this.data.map(d => selected.includes(d.path) ? Object.assign({}, d, {tags: d.tags.concat(tagsArray)}) : d);
            this.writeData();
        });
    }

    remove(selected) {
        inq.prompt(questions.remove(Array.isArray(selected) ? selected.length : 1)).then(ans => {
            if(!ans.confirm) return false;
            this.data = this.data.filter(d => selected.indexOf(d.path) < 0)
            this.writeData();
        })
    }

    edit(path) {
        const file = this.get(path);
        const defaults = {name: file.name, desc: file.desc, tags: file.tags.join(', ')}
        inq.prompt(questions.add(defaults)).then(ans => {
            const {name, desc, confirm, tags} = ans;
            if (!confirm) return false;
            const tagsArray = tags.split(',').map(t => t.trim());
            this.data = this.data.map(d => d.path !== file.path ? d : {path: d.path, name, desc, tags:tagsArray});
            this.writeData();
        });
    }

    emptyAlert() {
        return console.log(chalk.yellow('There is nothing saved in dirbook!'));
    }

    tagAlert() {
        return console.log(chalk.yellow('There is nothing saved in dirbook with that tag!'));
    }

    reset() {
        inq.prompt(questions.reset()).then(ans => {
            if(ans.confirm) {
                this.data = [];
                this.writeData();
            }
        });
    }

    writeData() {
        const {path, data} = this;
        fs.writeFile(path, JSON.stringify(data), err => err ? console.err(err) : true)
    }

 }