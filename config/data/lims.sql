CREATE TABLE `Barcode_Label` (
  `Barcode_Label_ID` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`Barcode_Label_ID`)
)

CREATE TABLE `Attribute` (
  `Attribute_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Attribute_Name` varchar(40) DEFAULT NULL,
  `Attribute_Description` text,
  `Attribute_Format` text,
  `Attribute_Type` varchar(255) DEFAULT NULL,
  `FK_Grp__ID` int(11) NOT NULL DEFAULT '0',
  `Inherited` enum('Yes','No') NOT NULL DEFAULT 'No',
  `Attribute_Class` varchar(40) DEFAULT NULL,
  `Attribute_Access` enum('Editable','NonEditable','ReadOnly') DEFAULT 'Editable',
  PRIMARY KEY (`Attribute_ID`),
  UNIQUE KEY `Attribute_Key` (`Attribute_Name`,`Attribute_Class`),
  KEY `grp` (`FK_Grp__ID`)
)

CREATE TABLE `Stock_Catalog` (
  `Stock_Catalog_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Stock_Catalog_Name` varchar(80) NOT NULL DEFAULT '',
  `Stock_Catalog_Description` text,
  `Stock_Catalog_Number` varchar(80) DEFAULT NULL,
  `Stock_Type` enum('Box','Buffer','Equipment','Kit','Matrix','Microarray','Primer','Reagent','Solution','Service_Contract','Computer_Equip','Misc_Item','Untracked') DEFAULT NULL,
  `Stock_Source` enum('Box','Order','Sample','Made in House') DEFAULT NULL,
  `Stock_Status` enum('Active','Inactive') DEFAULT 'Active',
  `Stock_Size` float DEFAULT NULL,
  `Stock_Size_Units` enum('mL','uL','litres','mg','grams','kg','pcs','boxes','tubes','rxns','nmoles','nL','n/a') DEFAULT NULL,
  `FK_Organization__ID` int(11) DEFAULT NULL,
  `FKVendor_Organization__ID` int(11) DEFAULT NULL,
  `Model` varchar(20) DEFAULT NULL,
  `FK_Equipment_Category__ID` int(11) DEFAULT '0',
  PRIMARY KEY (`Stock_Catalog_ID`),
  KEY `category_id` (`FK_Equipment_Category__ID`),
  KEY `Catalog_Name` (`Stock_Catalog_Name`),
  KEY `Catalog_Number` (`Stock_Catalog_Number`),
  KEY `FK_Organization__ID` (`FK_Organization__ID`),
  KEY `type` (`Stock_Type`),
  KEY `source` (`Stock_Source`),
  KEY `size` (`Stock_Size`,`Stock_Size_Units`),
  KEY `FKVendor_Organization__ID` (`FKVendor_Organization__ID`)
)

CREATE TABLE `Plate` (
  `Plate_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Plate_Size` enum('1-well','8-well','16-well','32-well','48-well','64-well','80-well','96-well','384-well','1.5 ml','50 ml','15 ml','5 ml','2 ml','0.5 ml','0.2 ml') DEFAULT NULL,
  `Plate_Created` datetime DEFAULT '1000-01-01 00:00:00',
  `FK_Library__Name` varchar(40) DEFAULT NULL,
  `FK_Rack__ID` int(11) DEFAULT NULL,
  `Plate_Number` int(4) NOT NULL DEFAULT '0',
  `FK_Employee__ID` int(11) DEFAULT NULL,
  `FKParent_Plate__ID` int(11) DEFAULT NULL,
  `Plate_Comments` text NOT NULL,
  `Plate_Status` enum('Active','Pre-Printed','Reserved','Temporary','Failed','Thrown Out','Exported','Archived','On Hold') DEFAULT NULL,
  `Plate_Test_Status` enum('Test','Production') DEFAULT 'Production',
  `FK_Plate_Format__ID` int(11) DEFAULT NULL,
  `Plate_Type` enum('Library_Plate','Tube','Array') DEFAULT NULL,
  `FKOriginal_Plate__ID` int(10) unsigned DEFAULT NULL,
  `Current_Volume` float DEFAULT NULL,
  `Current_Volume_Units` enum('pl','nl','ul','ml','l','g','mg','ug','ng','pg','n/a') NOT NULL DEFAULT 'ul',
  `Parent_Quadrant` enum('','a','b','c','d') NOT NULL DEFAULT '',
  `Plate_Parent_Well` char(3) NOT NULL DEFAULT '',
  `QC_Status` enum('N/A','Pending','Failed','Re-Test','Passed') DEFAULT 'N/A',
  `FK_Branch__Code` varchar(5) NOT NULL DEFAULT '',
  `FK_Pipeline__ID` int(11) NOT NULL DEFAULT '0',
  `Plate_Label` varchar(40) DEFAULT NULL,
  `FKLast_Prep__ID` int(11) DEFAULT NULL,
  `FK_Sample_Type__ID` int(11) NOT NULL DEFAULT '0',
  `FK_Work_Request__ID` int(11) DEFAULT NULL,
  `Plate_Class` enum('Standard','Extraction','ReArray','Oligo') DEFAULT 'Standard',
  PRIMARY KEY (`Plate_ID`),
  KEY `lib` (`FK_Library__Name`),
  KEY `user` (`FK_Employee__ID`),
  KEY `made` (`Plate_Created`),
  KEY `number` (`Plate_Number`),
  KEY `orderlist` (`FK_Library__Name`,`Plate_Number`),
  KEY `parent` (`FKParent_Plate__ID`),
  KEY `format` (`FK_Plate_Format__ID`),
  KEY `FK_Rack__ID` (`FK_Rack__ID`),
  KEY `FKOriginal_Plate__ID` (`FKOriginal_Plate__ID`),
  KEY `FKOriginal_Plate__ID_2` (`FKOriginal_Plate__ID`),
  KEY `Plate_Status` (`Plate_Status`),
  KEY `FKLast_Prep__ID` (`FKLast_Prep__ID`),
  KEY `label` (`Plate_Label`),
  KEY `FK_Pipeline__ID` (`FK_Pipeline__ID`),
  KEY `FK_Branch__Code` (`FK_Branch__Code`),
  KEY `FK_Work_Request__ID` (`FK_Work_Request__ID`),
  KEY `sample_type` (`FK_Sample_Type__ID`)
)

CREATE TABLE `Plate_Format` (
  `Plate_Format_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Plate_Format_Type` char(40) DEFAULT NULL,
  `Plate_Format_Status` enum('Active','Inactive') DEFAULT NULL,
  `FK_Barcode_Label__ID` int(11) DEFAULT NULL,
  `Max_Row` char(2) DEFAULT NULL,
  `Max_Col` tinyint(4) DEFAULT NULL,
  `Plate_Format_Style` enum('Plate','Tube','Array','Gel') DEFAULT NULL,
  `Well_Capacity_mL` float DEFAULT NULL,
  `Capacity_Units` char(4) DEFAULT NULL,
  `Wells` smallint(6) NOT NULL DEFAULT '1',
  `Well_Lookup_Key` enum('Plate_384','Plate_96','Gel_121_Standard','Gel_121_Custom','Tube') DEFAULT NULL,
  `Empty_Container_Weight_in_g` decimal(10,0) DEFAULT NULL,
  `Transferrable` enum('Y','N') NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`Plate_Format_ID`),
  UNIQUE KEY `name` (`Plate_Format_Type`),
  KEY `FK_Barcode_Label__ID` (`FK_Barcode_Label__ID`)
) 

CREATE TABLE `Employee` (
  `Employee_ID` int(4) NOT NULL AUTO_INCREMENT,
  `Employee_Name` varchar(80) DEFAULT NULL,
  `Employee_Start_Date` date DEFAULT NULL,
  `Initials` varchar(4) DEFAULT NULL,
  `Email_Address` varchar(80) DEFAULT NULL,
  `Employee_FullName` varchar(80) DEFAULT NULL,
  `Position` text,
  `Employee_Status` enum('Active','Inactive','Old') DEFAULT NULL,
  `Permissions` set('R','W','U','D','S','P','A') DEFAULT NULL,
  `IP_Address` text,
  `Password` varchar(80) DEFAULT '78a302dd267f6044',
  `Machine_Name` varchar(20) DEFAULT NULL,
  `FK_Department__ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`Employee_ID`),
  UNIQUE KEY `initials` (`Initials`),
  UNIQUE KEY `name` (`Employee_Name`),
  KEY `FK_Department__ID` (`FK_Department__ID`),
  KEY `email` (`Email_Address`),
  KEY `fullname` (`Employee_FullName`)
)

CREATE TABLE `Equipment` (
  `Equipment_ID` int(4) NOT NULL AUTO_INCREMENT,
  `Equipment_Name` varchar(40) DEFAULT NULL,
  `Equipment_Comments` text,
  `Serial_Number` varchar(80) DEFAULT NULL,
  `Equipment_Number` int(11) DEFAULT NULL,
  `Equipment_Number_in_Batch` int(11) DEFAULT NULL,
  `FK_Stock__ID` int(11) DEFAULT NULL,
  `Equipment_Status` enum('In Use','Inactive - Removed','Inactive - In Repair','Inactive - Hold','Sold','Unknown','Returned to Vendor (RTV)','In Transit') DEFAULT NULL,
  `FK_Location__ID` int(11) NOT NULL DEFAULT '0',
  `Old_Equipment_Name` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`Equipment_ID`),
  UNIQUE KEY `equip` (`Equipment_Name`),
  KEY `FK_Stock__ID` (`FK_Stock__ID`),
  KEY `serial` (`Serial_Number`),
  KEY `location` (`FK_Location__ID`)
) 

CREATE TABLE `Defined_Plate_Set` (
  `Defined_Plate_Set_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Plate_Set_Defined` datetime DEFAULT NULL,
  `FK_Employee__ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`Defined_Plate_Set_ID`),
  KEY `employee` (`FK_Employee__ID`)
)

CREATE TABLE `Plate_Set` (
  `Plate_Set_ID` int(4) NOT NULL AUTO_INCREMENT,
  `FK_Plate__ID` int(11) DEFAULT NULL,
  `Plate_Set_Number` int(11) DEFAULT NULL,
  `FKParent_Plate_Set__Number` int(11) DEFAULT NULL,
  PRIMARY KEY (`Plate_Set_ID`),
  KEY `num` (`Plate_Set_Number`),
  KEY `FK_Plate__ID` (`FK_Plate__ID`),
  KEY `parent_set` (`FKParent_Plate_Set__Number`)
)

CREATE TABLE `Plate_Prep` (
  `Plate_Prep_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FK_Plate__ID` int(11) DEFAULT NULL,
  `FK_Prep__ID` int(11) DEFAULT NULL,
  `FK_Plate_Set__Number` int(11) DEFAULT NULL,
  `FK_Equipment__ID` int(11) DEFAULT NULL,
  `FK_Solution__ID` int(11) DEFAULT NULL,
  `Solution_Quantity` float DEFAULT NULL,
  `Solution_Quantity_Units` enum('pl','nl','ul','ml','l') DEFAULT NULL,
  `Transfer_Quantity` float DEFAULT NULL,
  `Transfer_Quantity_Units` enum('pl','nl','ul','ml','l','g','mg','ug','ng','pg') DEFAULT NULL,
  PRIMARY KEY (`Plate_Prep_ID`),
  KEY `plate` (`FK_Plate__ID`),
  KEY `plate_set` (`FK_Plate_Set__Number`),
  KEY `prep` (`FK_Prep__ID`),
  KEY `FK_Equipment__ID` (`FK_Equipment__ID`),
  KEY `FK_Solution__ID` (`FK_Solution__ID`)
) 
CREATE TABLE `Prep` (
  `Prep_Name` varchar(80) DEFAULT NULL,
  `FK_Employee__ID` int(11) DEFAULT NULL,
  `Prep_DateTime` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Prep_Time` text,
  `Prep_Conditions` text,
  `Prep_Comments` text,
  `Prep_Failure_Date` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Prep_Action` enum('Completed','Failed','Skipped') DEFAULT NULL,
  `FK_Lab_Protocol__ID` int(11) DEFAULT NULL,
  `Prep_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FK_FailureReason__ID` int(11) DEFAULT NULL,
  `Attr_temp` text,
  PRIMARY KEY (`Prep_ID`),
  KEY `protocol` (`FK_Lab_Protocol__ID`,`Prep_Name`),
  KEY `timestamp` (`Prep_DateTime`),
  KEY `FK_Employee__ID` (`FK_Employee__ID`),
  KEY `FK_FailureReason__ID` (`FK_FailureReason__ID`)
) 

CREATE TABLE `Printer_Group` (
  `Printer_Group_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Printer_Group_Name` varchar(40) NOT NULL DEFAULT '',
  `FK_Site__ID` int(11) NOT NULL DEFAULT '0',
  `Printer_Group_Status` enum('Active','Inactive') DEFAULT 'Active',
  PRIMARY KEY (`Printer_Group_ID`),
  KEY `Site` (`FK_Site__ID`)
)

CREATE TABLE `Rack` (
  `Rack_ID` int(4) NOT NULL AUTO_INCREMENT,
  `FK_Equipment__ID` int(11) DEFAULT NULL,
  `Rack_Type` enum('Shelf','Rack','Box','Slot') DEFAULT NULL,
  `Rack_Name` varchar(80) DEFAULT NULL,
  `Movable` enum('Y','N') NOT NULL DEFAULT 'Y',
  `Rack_Alias` varchar(80) DEFAULT NULL,
  `FKParent_Rack__ID` int(11) DEFAULT NULL,
  `Capacity` enum('1','9x9','8x12') DEFAULT NULL,
  `Rack_Full` enum('Y','N') NOT NULL DEFAULT 'N',
  PRIMARY KEY (`Rack_ID`),
  UNIQUE KEY `alias` (`Rack_Alias`),
  KEY `Equipment_FK` (`FK_Equipment__ID`),
  KEY `type` (`Rack_Type`),
  KEY `name` (`Rack_Name`),
  KEY `parent_rack_id` (`FKParent_Rack__ID`)
)

CREATE TABLE `Sample_Type` (
  `Sample_Type_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Sample_Type` varchar(40) DEFAULT NULL,
  `FKParent_Sample_Type__ID` int(11) DEFAULT NULL,
  `Sample_Type_Alias` varchar(255) NOT NULL,
  PRIMARY KEY (`Sample_Type_ID`),
  UNIQUE KEY `Sample_Type` (`Sample_Type`),
  KEY `Parent_Sample_Type` (`FKParent_Sample_Type__ID`)
)

CREATE TABLE `Shipment` (
  `Shipment_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Shipment_Sent` datetime NOT NULL DEFAULT '2000-01-01 00:00:00',
  `Shipment_Received` datetime NOT NULL DEFAULT '2000-01-01 00:00:00',
  `FKSupplier_Organization__ID` int(11) NOT NULL DEFAULT '0',
  `Shipping_Container` enum('Bag','Cryoport','Styrofoam Box') DEFAULT NULL,
  `FKRecipient_Employee__ID` int(11) NOT NULL DEFAULT '0',
  `Waybill_Number` varchar(255) DEFAULT NULL,
  `Shipping_Conditions` enum('Ambient Temperature','Cooled','Frozen') DEFAULT NULL,
  `Package_Conditions` enum('refrigerated - on ice','refrigerated - wet ice','refrigerated - cold water','refrigerated - warm water','room temp - cool','room temp - ok','room temp - warm','frozen - sufficient dry ice','frozen - cryoport temp ok','frozen - little dry ice','frozen - no dry ice') DEFAULT NULL,
  `Shipment_Comments` text,
  `Sent_at_Temp` int(11) DEFAULT NULL,
  `Received_at_Temp` int(11) DEFAULT NULL,
  `Container_Status` enum('Locked','Unlocked') DEFAULT NULL,
  `Shipment_Reference` varchar(255) NOT NULL DEFAULT '',
  `Shipment_Status` enum('Sent','Received','Lost','Exported') DEFAULT NULL,
  `Shipment_Type` enum('Internal','Import','Export','Roundtrip') DEFAULT NULL,
  `FKFrom_Grp__ID` int(11) DEFAULT NULL,
  `FKTarget_Grp__ID` int(11) DEFAULT NULL,
  `FKSender_Employee__ID` int(11) DEFAULT NULL,
  `FK_Contact__ID` int(11) DEFAULT NULL,
  `FKTransport_Rack__ID` int(11) DEFAULT NULL,
  `FKFrom_Site__ID` int(11) DEFAULT NULL,
  `FKTarget_Site__ID` int(11) DEFAULT NULL,
  `Addressee` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Shipment_ID`),
  KEY `Supplier_Organization` (`FKSupplier_Organization__ID`),
  KEY `Recipient_Employee` (`FKRecipient_Employee__ID`),
  KEY `From_Grp` (`FKFrom_Grp__ID`),
  KEY `Target_Grp` (`FKTarget_Grp__ID`),
  KEY `Sender_Employee` (`FKSender_Employee__ID`),
  KEY `Contact` (`FK_Contact__ID`),
  KEY `Transport_Rack` (`FKTransport_Rack__ID`),
  KEY `From_Site` (`FKFrom_Site__ID`),
  KEY `Target_Site` (`FKTarget_Site__ID`)
) 

CREATE TABLE `Shipped_Object` (
  `Shipped_Object_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FK_Shipment__ID` int(11) NOT NULL DEFAULT '0',
  `FK_Object_Class__ID` int(11) NOT NULL DEFAULT '0',
  `Object_ID` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Shipped_Object_ID`),
  KEY `Shipment` (`FK_Shipment__ID`),
  KEY `Object_Class` (`FK_Object_Class__ID`)
) 

CREATE TABLE `Solution` (
  `Solution_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Solution_Started` datetime DEFAULT NULL,
  `Solution_Quantity` float DEFAULT NULL,
  `Solution_Expiry` date DEFAULT NULL,
  `Quantity_Used` float DEFAULT '0',
  `FK_Rack__ID` int(11) DEFAULT NULL,
  `Solution_Finished` date DEFAULT NULL,
  `Solution_Type` enum('Reagent','Solution','Primer','Buffer','Matrix') DEFAULT NULL,
  `Solution_Status` enum('Unopened','Open','Finished','Temporary','Expired') DEFAULT 'Unopened',
  `FK_Stock__ID` int(11) DEFAULT NULL,
  `FK_Solution_Info__ID` int(11) DEFAULT NULL,
  `Solution_Number` int(11) DEFAULT NULL,
  `Solution_Number_in_Batch` int(11) DEFAULT NULL,
  `Solution_Notes` text,
  `QC_Status` enum('N/A','Pending','Failed','Re-Test','Passed') DEFAULT 'N/A',
  `Solution_Label` varchar(40) DEFAULT NULL,
  `Solution_Quantity_Units` enum('l','ml','ul','g','mg','ug') DEFAULT NULL,
  PRIMARY KEY (`Solution_ID`),
  KEY `stock` (`FK_Stock__ID`),
  KEY `FK_Solution_Info__ID` (`FK_Solution_Info__ID`),
  KEY `FK_Rack__ID` (`FK_Rack__ID`),
  KEY `label` (`Solution_Label`)
)


