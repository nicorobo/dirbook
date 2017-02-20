#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const chalk = require('chalk');
const lib = require('./lib');

// If no commands are given, default to the list command
if(process.argv.length < 3) lib.list({})

// Uses commander to configure the "program", which encapsulates all of the command logic, and populates the help command
program
	.version('0.0.1')
program.command('open')
	.description('Opens the selected directory.')
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
program.command('reset')
	.description('Wipes dirbook\'s memory.')
	.action(lib.reset)
program.parse(process.argv);