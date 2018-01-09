Ensure that your .bashrc file has the following lines added to the bottom:

alias nodeinstall='./custom/bin/install.sh'
alias nodeuninstall='./custom/bin/uninstall.sh'
alias package='cat ./custom/installed'

To toggle between customized packages, simply type (from the project root directory): 
>nodeinstall <package> [-f]


To uninstall a package (system will be reverted to the 'init' package) simply type:
>nodeuninstall <package> [-f]

to check which package is installed, simply type:
>package

The contents of the customization package should be in the standard format (see init package) consisting of the directories:

models/
controllers/
styles/
js/
images/
data/
views/
	customize
	<package>

