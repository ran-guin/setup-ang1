if [ $1 ]
	then 
		PLUGIN=$1;
	else 
		echo -e "enter Plugin name:\n ";
		read PLUGIN;
fi

echo -e "installing $PLUGIN...\n";

files=`ls -alr custom/$PLUGIN/*`;

installed=`cat ./custom/installed`;

echo -e "($installed currently installed)\n";

if [[ ! "$installed" =~ [a-z] ]] 
	then echo -e "\nNo installed file found ???\n";
fi

if [[ "$installed" =~ ^"$PLUGIN"$ ]]
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

rm -fR ./../views/$PLUGIN;
cp -R ./views ./../../views/$PLUGIN;

rm -fR ./../../assets/images/$PLUGIN;
cp -R ./images ./../../assets/images/$PLUGIN;

rm -fR ./../assets/js/dependencies/$PLUGIN;
cp -R ./js/dependencies ./../../assets/js/dependencies/$PLUGIN;

rm -fR ./../../assets/js/private/$PLUGIN;
cp -R ./js/private ./../../assets/js/private/$PLUGIN;

rm -fR ./../../assets/styles/$PLUGIN;
cp -R ./styles ./../../assets/styles/$PLUGIN;

if [[ $2 =~ \-f ]]
	then 
	    cp -R ./config/*.js ./../../config/;
	    cp -R ./models/*.js ./../../api/models/;
	    cp -R ./controllers/*.js ./../../api/controllers/;
	    cp -R ./views/customize/*.jade ./../../views/customize/;
	    cp -R ./views/$PLUGIN/*.jade ./../../views/$PLUGIN/;
	else 
	    cp -Ri ./config/*.js ./../../config/;
	    cp -Ri ./models/*.js ./../../api/models/;
	    cp -Ri ./controllers/*.js ./../../api/controllers/;
	    cp -Ri ./views/customize/*.jade ./../../views/customize/;
	    cp -Ri ./views/$PLUGIN/*.jade ./../../views/$PLUGIN/;
fi

cd -;
echo -e "$PLUGIN\n" > ./custom/installed
