# dirbook
Dirbook is a small CLI created to help index directories/projects.

* Index directories, giving them names, short descriptions, and tags
* Copy an indexed directory to the current directory, giving it a new name (great for small starter-projects)
* Open an indexed directory in Finder/File Explorer
* Use tags to organize and filter directories
* Turn on aliasing to have dirbook manage a small subsection of your .bash\_profile or .bash\_rc, keeping aliases to cd into directories.

### `add`
`dirbook add` will index the current working directory, after asking you a few questions (name, description, tags).

### `copy [-t --tag <tag>]`
`dirbook copy` displays a list of all indexed directories. After selecting one and giving your new directory a name, a copy will be made in your current working directory.

### `open [-t --tag <tag>]`
`dirbook open` displays a list of all indexed directories. After selecting one, the directory will be opened in the default file browsing app.

### `select [-t --tag <tag>]`
`dirbook select` displays a list of all indexed directories. After selecting one or many, you will be given a few options. If more than one is chosen, their tags may be updated, or they may be deleted from dirbook. If only one is chosen, it may also be updated.

### `ls [-t --tag <tag>]`
`dirbook ls` and `dirbook` prints all indexed directories. This is the default behavior.

### `alias [-o --active, -f --off, -x --prefix <prefix>, -p --path <path>]`
Just calling `dirbook alias` will print out the current alias settings (on/off, path to write to, prefix for alias).

Aliasing is off by default, and may be turned on by running `dirbook alias -o`. 

For aliasing to work, you will also need to give it the absolute path of the file you'd like to add aliases to. For most this will be **.bash_profile** or **.bashrc**.

Aliases will be given a prefix of `dirbook-` by default to avoid overriding other command, but can be changed using `dirbook alias -x <prefix>`

Turning aliasing **on** will add an alias for ever indexed directory, using the form `alias <prefix><name> = 'cd <path>'`
Turning aliasing off will remove all aliases from *<path>*

*(Aliases will only be available after restarting the terminal, or after calling `source <path>`.)*

### `reset`
`dirbook reset` will clear dirbook and remove aliases.


	Usage: dirbook [options] [command]


	  Commands:

	    open [options]     Open the selected directory in Finder/File Explorer.
	    add                Add current directory to dirbook.
	    copy [options]     Allows you to select directory to copy.
	    select [options]   Allows you to select directories and perform actions.
	    ls [options]       List all the things.
	    alias [options]    Configure alias settings
	    reset              Wipes dirbook's memory.

	  Options:

	    -h, --help     output usage information
	    -V, --version  output the version number
