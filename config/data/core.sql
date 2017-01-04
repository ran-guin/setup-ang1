REATE TABLE `DBTable` (   `DBTable_ID` int(11) NOT NULL AUTO_INCREMENT,   `DBTable_Name` varchar(80) NOT NULL DEFAULT '',   `DBTable_Description` text,   `DBTable_Status` text,   `Status_Last_Updated` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',   `DBTable_Type` enum('General','Lab Object','Lab Process','Object Detail','Settings','Dynamic','DB Management','Application Specific','Class','Subclass','Lookup','Join','Imported','Manual Join','Recursive Lookup') DEFAULT NULL,   `DBTable_Title` varchar(80) NOT NULL DEFAULT '',   `Scope` enum('Core','Lab','Plugin','Option','Custom') DEFAULT NULL,   `Package_Name` varchar(40) DEFAULT NULL,   `Records` int(11) NOT NULL DEFAULT '0',   `FK_Package__ID` int(11) NOT NULL DEFAULT '0',   PRIMARY KEY (`DBTable_ID`),   UNIQUE KEY `DBTable_Name` (`DBTable_Name`),   UNIQUE KEY `name` (`DBTable_Name`),   KEY `package` (`FK_Package__ID`) ) ENGINE=InnoDB AUTO_INCREMENT=504 DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `DBField`;
CREATE TABLE `DBField` (
  `DBField_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Field_Description` text NOT NULL,
  `Field_Table` text NOT NULL,
  `Prompt` varchar(255) NOT NULL DEFAULT '',
  `Field_Alias` varchar(255) NOT NULL DEFAULT '',
  `Field_Options` set('Hidden','Mandatory','Primary','Unique','NewLink','ViewLink','ListLink','Searchable','Obsolete','ReadOnly','Required','Removed') DEFAULT NULL,
  `Field_Reference` varchar(255) NOT NULL DEFAULT '',
  `Field_Order` int(11) NOT NULL DEFAULT '0',
  `Field_Name` varchar(255) NOT NULL DEFAULT '',
  `Field_Type` text NOT NULL,
  `Field_Index` varchar(255) NOT NULL DEFAULT '',
  `NULL_ok` enum('NO','YES') NOT NULL DEFAULT 'YES',
  `Field_Default` varchar(255) NOT NULL DEFAULT '',
  `Field_Size` tinyint(4) DEFAULT '20',
  `Field_Format` varchar(80) DEFAULT NULL,
  `FK_DBTable__ID` int(11) DEFAULT NULL,
  `Foreign_Key` varchar(255) DEFAULT NULL,
  `DBField_Notes` text,
  `Editable` enum('yes','admin','no') DEFAULT 'yes',
  `Tracked` enum('yes','no') DEFAULT 'no',
  `Field_Scope` enum('Core','Optional','Custom') DEFAULT 'Custom',
  `FK_Package__ID` int(11) DEFAULT NULL,
  `List_Condition` varchar(255) DEFAULT NULL,
  `FKParent_DBField__ID` int(11) DEFAULT NULL,
  `Parent_Value` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`DBField_ID`),
  UNIQUE KEY `tblfld` (`FK_DBTable__ID`,`Field_Name`),
  UNIQUE KEY `field_name` (`Field_Name`,`FK_DBTable__ID`),
  KEY `fld` (`Field_Name`),
  KEY `package` (`FK_Package__ID`),
  KEY `Parent_DBField` (`FKParent_DBField__ID`)
) ENGINE=InnoDB AUTO_INCREMENT=4929 DEFAULT CHARSET=latin1;

CREATE TABLE `Change_History` (   `Change_History_ID` int(11) NOT NULL AUTO_INCREMENT,   `FK_DBField__ID` int(11) NOT NULL DEFAULT '0',   `Old_Value` varchar(255) DEFAULT NULL,   `New_Value` varchar(255) DEFAULT NULL,   `FK_Employee__ID` int(11) NOT NULL DEFAULT '0',   `Modified_Date` datetime NOT NULL DEFAULT '1000-01-01',
`Record_ID` varchar(40) NOT NULL DEFAULT '',
  `Comment` text,
  PRIMARY KEY (`Change_History_ID`),
  KEY `FK_DBField__ID` (`FK_DBField__ID`),
  KEY `FK_Employee__ID` (`FK_Employee__ID`),
  KEY `record` (`Record_ID`),
  KEY `date` (`Modified_Date`)
) ENGINE=InnoDB AUTO_INCREMENT=3340391 DEFAULT CHARSET=latin1;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
