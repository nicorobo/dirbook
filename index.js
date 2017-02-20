#!/usr/bin/env node

// index.js is the root script of dirbook. It uses commander to configure a CLI with commands available to the user
// Commander also generates the help section of the program, accessed with 'dirbook -h --help'

const program = require('commander');
const chalk = require('chalk');
const lib = require('./lib');

// If no commands are given, default to the list command
if(process.argv.length < 3) lib.list({})

program
	.version('0.0.1')
program.command('open')
	.description('Open the selected directory in Finder/File Explorer.')
	.option('-t, --tag <tag>', 'Filter results by tags')
	.action(lib.open)
program.command('add')
	.description('Add current directory to dirbook.')
	.action(lib.add)
program.command('copy')
	.description('Allows you to select directory to copy.')
	.option('-t, --tag <tag>', 'Filter results by tags')
	.action(lib.copy)
program.command('select')
	.description('Allows you to select directories and perform actions.')
	.option('-t, --tag <tag>', 'Filter results by tags')
	.action(lib.select)
program.command('ls')
	.description('List all the things.')
	.option('-t, --tag <tag>', 'Filter results by tags')
	.action(lib.list)
program.command('alias')
	.description('List options for configuring alias settings.')
	.option('-a, --active <active>', 'Turn alias editing on or off')
	.option('-p, --path <path>', 'Change path of where aliases will be written')
	.action(lib.aliasSettings)
program.command('reset')
	.description('Wipes dirbook\'s memory.')
	.action(lib.reset)
program.parse(process.argv);