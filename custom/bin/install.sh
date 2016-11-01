if [ $1 ]
	then 
		PLUGIN=$1;
	else 
		echo -e "enter Plugin name:\n ";
		read PLUGIN;
fi

files=`ls -alr custom/$PLUGIN/*`;

cd ./custom/$PLUGIN;
if [[ "$files" =~ [a-z] ]] 
	then 
		echo -e "\nFound:\n************\n$files\n\n";
	else
		echo -e "\n*** Error: *** Could not find custom package: $PLUGIN *** \n$!\n"
fi

