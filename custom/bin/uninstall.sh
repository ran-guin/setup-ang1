if [ $1 ]
	then 
		PLUGIN=$1;
	else 
		echo -e "enter Plugin name to uninstall:\n ";
		read PLUGIN;
fi

if [[ ! "$PLUGIN" =~ [a-z] ]]
	then 
		echo -e "Error ... no package defined to uninstall \n";
		exit 0;
fi

files=`ls -al custom/$PLUGIN/*`;

cd ./custom/$PLUGIN;
if [[ "$files" =~ [a-z] ]] 
	then 
		echo -e "\nFound:\n************\n$files\n\n";

		rm -fR ./../../views/$PLUGIN/*;
		rmdir ./../../views/$PLUGIN;

		rm -fR ./../../assets/images/$PLUGIN/*;
		rmdir ./../../assets/images/$PLUGIN;

		rm -fR ./../../assets/js/$PLUGIN/*;
		rmdir ./../../assets/js/$PLUGIN;


	else
		echo -e "\n*** Error: *** Could not find custom package: $PLUGIN *** \n$!\n"
fi

