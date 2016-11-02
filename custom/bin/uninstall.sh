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

installed=`cat ./custom/installed`;

if [[ "$installed" =~ ^"$PLUGIN"$ ]]
        then
                echo -e "\nuninstalling $PLUGIN ...\n";
        else
                echo -e "\n$PLUGIN is not installed ($installed is installed)\n";
		exit 1;
fi


files=`ls -al custom/$PLUGIN/*`;

echo -e "uninstalling $PLUGIN\n" > ./custom/installed

INIT=init;

cd ./custom/$PLUGIN;
if [[ "$files" =~ [a-z] ]] 
	then 
		rm -fR ./../../assets/images/$PLUGIN/*;
		rmdir ./../../assets/images/$PLUGIN;

		rm -fR ./../../assets/js/dependencies/$PLUGIN/*;
		rm -fR ./../../assets/js/private/$PLUGIN/*;
		rm -fR ./../../assets/js/templates/$PLUGIN/*;
	
		rmdir ./../../assets/js/dependencies/$PLUGIN;
		rmdir ./../../assets/js/private/$PLUGIN;
		rmdir ./../../assets/js/templates/$PLUGIN;

		rm -fR ./../../views/$PLUGIN/*;
		rmdir ./../../views/$PLUGIN;
	
		rm -fR ./../../config/*.js;
		rm -fR ./../../api/models/*.js;
		rm -fR ./../../api/controllers/*.js;
		rm -fR ./../../views/customize/*.jade;

                cp -Ri ./../$INIT/config/*.js ./../../config/;
                cp -Ri ./../$INIT/models/*.js ./../../api/models/;
                cp -Ri ./../$INIT/controllers/*.js ./../../api/controllers/;
                cp -Ri ./../$INIT/views/customize/*.jade ./../../views/customize/;

		echo -e `pwd`;
	else
		echo -e "\n*** Error: *** Could not find custom package: $PLUGIN *** \n$!\n"
fi

cd -;
echo -e "$INIT\n" > ./custom/installed
