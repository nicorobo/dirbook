#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const chalk = require('chalk');
const StorageManager = require('./StorageManager');

const sm = new StorageManager(`${__dirname}/directories.json`)

if(process.argv.length < 3) sm.list({})

program
	.version('0.0.1')
program.command('open')
	.description('Opens the selected directory.')
	.option('-t, --tag <tag>', 'Filter results by tags')
	.action(sm.open)
program.command('add')
	.description('Add current directory to dirbook.')
	.action(sm.add)
program.command('copy')
	.description('Allows you to select directory to copy.')
	.option('-t, --tag <tag>', 'Filter results by tags')
	.action(sm.copy)
program.command('select')
	.description('Allows you to select directories and perform actions.')
	.option('-t, --tag <tag>', 'Filter results by tags')
	.action(sm.select)
program.command('ls')
	.description('List all the things.')
	.option('-t, --tag <tag>', 'Filter results by tags')
	.action(sm.list)
program.command('reset')
	.description('Wipes dirbook\'s memory.')
	.action(sm.reset)
program.parse(process.argv);