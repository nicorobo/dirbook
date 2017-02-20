const chalk = require('chalk');

module.exports = {
	add: (defaults={}) => [
		{type: 'input', name: 'name', message: 'Choose a name...', default: defaults.name || dirname},
		{type: 'input', name: 'desc', message: 'Give a little description...', default: defaults.desc || null},
		{type: 'input', name: 'tags', message: 'Tags '+ chalk.dim('(seperated by commas)'), default: defaults.tags || null},
		{type: 'confirm', name: 'confirm', message: 'Is this all good?'}
	],
	copy: data => [
		{
			type: 'list',
			name: 'path',
			message: 'Pick your poison...',
			choices: data.map(d => ({name: `${chalk.cyan(d.name)} ${chalk.italic.dim(d.desc)}`, value: d.path, short: d.name}))
		},
		{type: 'input', name: 'name', message: 'Now name it...'},
		{type: 'confirm', name: 'confirm', message: 'Is this all good?'}
	],
	open: data => [
		{
			type: 'list',
			name: 'path',
			message: 'What do you want to open?',
			choices: data.map(d => ({name: `${chalk.cyan(d.name)} ${chalk.italic.dim(d.desc)}`, value: d.path, short: d.name}))
		}
	],
	select: data => [
		{
			type: 'checkbox',
			name: 'selected',
			message: 'Select directories...',
			choices: data.map(d => ({name: `${chalk.cyan(d.name)} ${chalk.italic.dim(d.desc)}`, value: d.path, short: d.name}))
		},
		{
			type: 'list',
			name: 'action',
			message: 'Choose action...',
			choices: ans => {
				let choices = [
					{name: 'Remove', value: 'remove'},
					{name: 'Add Tag(s)', value: 'add-tags'},
				];
				if(ans.selected.length === 1) {
					choices = [].concat(choices, [
						{name: 'Edit', value: 'edit'},
					]);
				}
				return choices;
			}
		}
	],
	reset: () => [
		{type: 'confirm', name: 'confirm', message: `This will wipe ${chalk.magenta('dirbook\'s')} memory. Are you sure?`}
	],
	remove: (length) => [
		{type: 'confirm', name: 'confirm', message: `Are sure you want to delete these ${chalk.magenta(length)} items?`}
	],
	addTags: () => [
		{type: 'input', name: 'tags', message: 'Tags '+ chalk.dim('(seperated by commas)')},
		{type: 'confirm', name: 'confirm', message: 'Is this all good?'}
	],

}