if [ $1 ]
	then 
		PLUGIN=$1;
	else 
		echo -e "enter Plugin name:\n ";
		read PLUGIN;
fi

files=`ls -alr custom/$PLUGIN/*`;
installed = `cat custom/installed`;

if [[ ! "$installed" =~ [a-z] ]] 
	then echo -e "\nNo installed file found ???\n";
fi

if [[ "$installed"=="$PLUGIN" ]]
	then 
		echo -e "\n$PLUGIN already installed\n";
	else
		echo -e "\nREPLACING $installed with $PLUGIN\n";
fi


echo -e "installing $PLUGIN\n" > ./custom/installed

cd ./custom/$PLUGIN;
if [[ "$files" =~ [a-z] ]] 
	then 
		echo -e "\nFound:\n************\n$files\n\n";
	else
		echo -e "\n*** Error: *** Could not find custom package: $PLUGIN *** \n$!\n"
		exit 1;
fi

`cp -R ./views/$PLUGIN ./../../views/$PLUGIN`;
`cp -R ./images ./../../assets/images/$PLUGIN`;
`cp -R ./js ./../../assets/js/$PLUGIN`;
`cp -R ./styles ./../../assets/styles/$PLUGIN`;

if [[ $2 =~ \-f ]]
	then 
	    `cp -R ./config/*.js ./../../config/`;
	    `cp -R ./models/*.js ./../../api/models/`;
	    `cp -R ./controllers/*.js ./../../api/controllers/`;
	    `cp -R ./views/customize/*.jade ./../../views/customize/`;
	else 
	    `cp -Ri ./config/*.js ./../../config/`;
	    `cp -Ri ./models/*.js ./../../api/models/`;
	    `cp -Ri ./controllers/*.js ./../../api/controllers/`;
	    `cp -Ri ./views/customize/*.jade ./../../views/customize/`;
	    `cp -Ri ./views/customize/$PLUGIN/*.jade ./../../views/customize/$PLUGIN/`;
fi

cd -;
echo -e "$PLUGIN\n" > ./custom/installed
