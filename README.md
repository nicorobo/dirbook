# dirbook
Dirbook is a small CLI created to help index directories/projects.

## Adding a directory
To add a directory to the index, visit it in your terminal and run `dirbook add`.
*dirbook* will ask you a few questions (name, description, tags), and then index the directory.

## Copying a directory
To copy an indexed directory, visit the directory you'd like the copy to end up in, and run `dirbook copy`.
*dirbook* will list all indexed directories. Choose the one you'd like to copy, name it, and hit enter.

## Editing, Removing, and Adding Tags
Using `dirbook select`, you'll be able to select multiple directories. If more than one is chosen, you will have the option
to remove them from the index, or add tags to them. If just one is chosen, you will also have the option to edit it. 


I most commonly use it to scaffold new projects by using the `copy` feature.
I have a directory full of starting-off points for projects, and I add them to dirbook,
making them easy to copy anywhere I am in the terminal.

	Usage: dirbook [options] [command]


	  Commands:

	    open [options]     Opens the selected directory.
	    add                Add current directory to dirbook.
	    copy [options]     Allows you to select directory to copy.
	    select [options]   Allows you to select directories and perform actions.
	    ls [options]       List all the things.
	    reset              Wipes dirbook's memory.

	  Options:

	    -h, --help     output usage information
	    -V, --version  output the version number