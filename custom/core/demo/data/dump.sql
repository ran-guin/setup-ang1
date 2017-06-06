-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: localhost    Database: litmusdev
-- ------------------------------------------------------
-- Server version	5.7.17

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Attribute`
--

DROP TABLE IF EXISTS `Attribute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Attribute`
--

LOCK TABLES `Attribute` WRITE;
/*!40000 ALTER TABLE `Attribute` DISABLE KEYS */;
INSERT INTO `Attribute` VALUES (1,'Minutes_Clotted',NULL,'','Int',3,'No','Prep','Editable'),(2,'Max_Transit_Temp_in_C',NULL,'','Int',3,'No','Prep','Editable'),(3,'Min_Transit_Temp_in_C',NULL,'','Int',3,'No','Prep','Editable'),(4,'Waybill_Number',NULL,'','Int',3,'No','Prep','Editable'),(5,'Data_Logger_Serial_No',NULL,'','Int',3,'No','Prep','Editable'),(6,'Shipping_Temp_in_C',NULL,'','Int',3,'No','Prep','Editable'),(7,'Shipper',NULL,'','Int',3,'No','Prep','Editable'),(10,'collection_time',NULL,'','DateTime',2,'No','Source','Editable'),(11,'first_stored',NULL,'','DateTime',2,'Yes','Plate','Editable'),(12,'initial_time_to_freeze',NULL,'','Decimal',2,'Yes','Plate','Editable'),(13,'Tube_Full',NULL,'','ENUM(\'Yes\',\'No\')',2,'No','Source','Editable'),(14,'Turbidity_Observed',NULL,'','ENUM(\'Yes\',\'No\')',2,'Yes','Plate','Editable'),(15,'Hematuria_Observed',NULL,'','ENUM(\'Yes\',\'No\')',3,'Yes','Plate','Editable'),(16,'Hemolysis_Observed',NULL,'','ENUM(\'Yes\',\'No\')',2,'Yes','Plate','Editable'),(17,'Lipedemia_Observed',NULL,'','ENUM(\'Yes\',\'No\')',2,'Yes','Plate','Editable'),(18,'Contamination_During_Pipetting',NULL,'','ENUM(\'Yes\',\'No\')',3,'Yes','Plate','Editable'),(19,'Contamination_Type',NULL,'','Text',3,'Yes','Plate','Editable'),(20,'Process_Note',NULL,'','Text',3,'Yes','Plate','Editable'),(21,'Clotting_Observed',NULL,'','ENUM(\'Yes\',\'No\')',3,'Yes','Plate','Editable'),(23,'Post_CENT_Fibrin_Clot_Obs',NULL,'','ENUM(\'Yes\',\'No\')',3,'Yes','Plate','Editable'),(24,'Patient_Service_Centre',NULL,'','FK_Service_Centre__ID',2,'Yes','Source','Editable'),(25,'Replacement_Source_Status',NULL,'','ENUM(\'Requested\',\'Received\',\'Replacement\')',2,'No','Source','ReadOnly'),(26,'Replacement_for_Source',NULL,'','FKReplacing_Source__ID',2,'No','Source','ReadOnly'),(27,'Thaw_Count',NULL,'','Count',3,'Yes','Plate','Editable'),(28,'Thaw_Count',NULL,'','Int',3,'Yes','Source','Editable'),(29,'Tube Weight_Empty',NULL,'','Decimal',1,'No','Plate','Editable'),(30,'Sample_Weight_Calc',NULL,'','Decimal',1,'No','Plate','Editable'),(31,'Saliva_Collection_Device_Model',NULL,'','Varchar',3,'No','Source','Editable'),(32,'Saliva_Collection_Device_Lot',NULL,'','Varchar',3,'No','Source','Editable'),(33,'Patient_Name',NULL,'','varchar',8,'No','Patient','Editable'),(34,'Offsite_Original_Tubes',NULL,'','int',8,'No','Source','Editable'),(35,'Freezer_Date',NULL,'','DateTime',8,'No','Source','Editable'),(41,'GENIC_Subject_Code',NULL,'','VARCHAR(3)',8,'Yes','Source','NonEditable'),(42,'CDG_Batch_Identifier',NULL,'','text',23,'No','Submission','Editable'),(43,'Tube_Weight_in_g','This attribute can be used to calculate accurate volumes. If this attribute is entered and Plate_Format.Wells = 1 and Container Format has defined Empty_Container_Weight_g, the following calculation will be performed: 1. Subtract empty tube weight from entered (measured) weight. 2. convert grams to ml (assuming water density)',NULL,'Decimal',23,'No','Plate','Editable'),(48,'Sex_Test_Result',NULL,'','ENUM(\'M\',\'F\',\'U\')',8,'Yes','Plate','Editable'),(50,'Qiagen_Lot_Number',NULL,'','varchar',3,'Yes','Prep','Editable'),(51,'DNA_Wash_Cycles','','','Int',3,'Yes','Plate','Editable'),(52,'DNA_230','','','Decimal',3,'Yes','Plate','Editable'),(53,'DNA_260','','','Decimal',3,'Yes','Plate','Editable'),(54,'DNA_280','','','Decimal',3,'Yes','Plate','Editable'),(55,'DNA_320','','','Decimal',3,'Yes','Plate','Editable'),(56,'DNA_260_280','','','Decimal',3,'Yes','Plate','Editable'),(57,'DNA_Conc_UV','','','Decimal',3,'Yes','Plate','Editable'),(58,'DNA_UV_Batch','','','Text',3,'Yes','Plate','Editable'),(59,'DNA_Conc_Picogreen','','','Decimal',3,'Yes','Plate','Editable'),(60,'DNA_Conc_PG_Batch','','','Text',3,'Yes','Plate','Editable'),(61,'DNA_BGLOBIN_Batch','','','Text',3,'Yes','Plate','Editable'),(62,'DNA_PCR_BGLOBIN','','','Int',3,'Yes','Plate','Editable'),(63,'Thaw_Temp','','','Int',3,'Yes','Prep','Editable'),(64,'Untracked_Thaw_Count','','','Int',3,'Yes','Source','Editable'),(65,'Untracked_Thaw_Count','','','Int',3,'Yes','Plate','Editable'),(66,'Matrix_Barcode','','','Int',3,'Yes','Plate','Editable'),(67,'DNA_260_280_Adj','','','Decimal',3,'Yes','Plate','Editable'),(68,'DNA_260_230_Adj','','','Decimal',3,'Yes','Plate','Editable');
/*!40000 ALTER TABLE `Attribute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Change_History`
--

DROP TABLE IF EXISTS `Change_History`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Change_History` (
  `Change_History_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FK_DBField__ID` int(11) NOT NULL DEFAULT '0',
  `Old_Value` varchar(255) DEFAULT NULL,
  `New_Value` varchar(255) DEFAULT NULL,
  `FK_Employee__ID` int(11) NOT NULL DEFAULT '0',
  `Modified_Date` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `Record_ID` varchar(40) NOT NULL DEFAULT '',
  `Comment` text,
  PRIMARY KEY (`Change_History_ID`),
  KEY `FK_DBField__ID` (`FK_DBField__ID`),
  KEY `FK_Employee__ID` (`FK_Employee__ID`),
  KEY `record` (`Record_ID`),
  KEY `date` (`Modified_Date`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Change_History`
--

LOCK TABLES `Change_History` WRITE;
/*!40000 ALTER TABLE `Change_History` DISABLE KEYS */;
INSERT INTO `Change_History` VALUES (1,9,NULL,'102',1,'2017-01-12 22:36:59','436',NULL),(2,9,NULL,'103',1,'2017-01-12 22:37:16','437',NULL),(3,9,NULL,'104',1,'2017-01-12 22:37:16','438',NULL),(4,167,NULL,'111',1,'2017-01-24 08:55:28','439',NULL),(5,167,NULL,'111',1,'2017-01-24 08:57:28','440',NULL),(6,167,NULL,'123',1,'2017-01-24 09:47:28','441',NULL),(7,167,NULL,'123',1,'2017-01-24 09:49:28','442',NULL),(8,167,NULL,'135',1,'2017-01-24 09:52:33','443',NULL),(9,167,NULL,'147',1,'2017-01-24 17:47:55','444',NULL),(10,167,NULL,'159',1,'2017-01-24 18:59:36','445',NULL),(11,167,NULL,'171',1,'2017-01-24 19:08:29','446',NULL),(12,167,NULL,'112',1,'2017-01-24 19:10:47','447',NULL),(13,167,NULL,'124',1,'2017-01-24 19:15:28','448',NULL),(14,167,NULL,'136',1,'2017-01-24 19:20:26','449',NULL),(15,167,NULL,'148',1,'2017-01-24 19:23:06','450',NULL),(16,167,NULL,'160',1,'2017-01-25 09:51:54','451',NULL),(17,167,NULL,'172',1,'2017-01-25 09:51:54','452',NULL),(18,167,NULL,'113',1,'2017-02-05 13:42:36','453',NULL),(19,167,NULL,'125',1,'2017-03-29 15:44:11','454',NULL),(20,167,NULL,'137',1,'2017-03-29 15:49:34','455',NULL),(21,167,'87','183',1,'2017-03-29 15:52:51','1',NULL),(22,167,NULL,'149',1,'2017-03-29 15:52:51','456',NULL),(23,167,NULL,'161',1,'2017-03-29 16:24:05','457',NULL),(24,167,'87',NULL,1,'2017-03-29 16:28:06','1',NULL),(25,167,NULL,'173',1,'2017-03-29 16:28:06','458',NULL),(26,167,'87','183',1,'2017-03-29 16:42:11','1',NULL),(27,167,NULL,'114',1,'2017-03-29 16:42:11','459',NULL),(28,167,NULL,'126',1,'2017-03-29 20:18:25','460',NULL),(29,167,NULL,'138',1,'2017-03-29 20:18:25','461',NULL),(30,167,NULL,'150',1,'2017-03-29 20:18:25','462',NULL),(31,167,NULL,'162',1,'2017-03-29 20:18:25','463',NULL),(32,167,NULL,'174',1,'2017-03-29 20:18:25','464',NULL),(33,167,NULL,'115',1,'2017-03-29 20:18:25','465',NULL),(34,167,NULL,'127',1,'2017-03-29 20:18:25','466',NULL),(35,167,NULL,'139',1,'2017-03-29 20:18:25','467',NULL),(36,167,'89','183',1,'2017-03-29 20:20:38','419',NULL),(37,167,'90','183',1,'2017-03-29 20:20:38','420',NULL),(38,167,NULL,'105',1,'2017-03-29 20:20:38','468',NULL),(39,167,NULL,'106',1,'2017-03-29 20:20:38','469',NULL),(40,167,NULL,'89',1,'2017-03-29 20:21:41','470',NULL),(41,167,NULL,'90',1,'2017-03-29 20:21:41','471',NULL),(42,167,NULL,'107',1,'2017-03-29 20:24:57','472',NULL),(43,167,NULL,'108',1,'2017-03-29 20:24:57','473',NULL),(44,167,'89.00','183.0',1,'2017-03-30 15:02:11','419.0',NULL),(45,167,'90.00','183.0',1,'2017-03-30 15:02:11','420.0',NULL),(46,167,NULL,'117.0',1,'2017-03-30 15:02:11','474.0',NULL),(47,167,NULL,'129.0',1,'2017-03-30 15:02:11','475.0',NULL),(48,167,NULL,'118.0',1,'2017-03-30 15:02:11','476.0',NULL),(49,167,NULL,'130.0',1,'2017-03-30 15:02:11','477.0',NULL),(50,167,NULL,'119.0',1,'2017-03-30 15:02:11','478.0',NULL),(51,167,NULL,'131.0',1,'2017-03-30 15:02:11','479.0',NULL),(52,167,NULL,'120.0',1,'2017-03-30 15:02:11','480.0',NULL),(53,167,NULL,'132.0',1,'2017-03-30 15:02:11','481.0',NULL),(54,167,'89','183',1,'2017-03-31 16:14:48','419',NULL),(55,167,'88','183',1,'2017-03-31 16:14:48','420',NULL),(56,167,NULL,'151',1,'2017-03-31 16:14:48','482',NULL),(57,167,NULL,'163',1,'2017-03-31 16:14:48','483',NULL),(58,167,NULL,'116',1,'2017-03-31 16:14:48','484',NULL),(59,167,NULL,'128',1,'2017-03-31 16:14:48','485',NULL),(60,167,NULL,'152',1,'2017-03-31 16:14:48','486',NULL),(61,167,NULL,'164',1,'2017-03-31 16:14:48','487',NULL),(62,167,'89','183',1,'2017-03-31 16:29:18','419',NULL),(63,167,'90','183',1,'2017-03-31 16:29:18','420',NULL),(64,167,NULL,'175',1,'2017-03-31 16:29:18','488',NULL),(65,167,NULL,'140',1,'2017-03-31 16:29:18','489',NULL),(66,167,NULL,'154',1,'2017-03-31 16:29:18','490',NULL),(67,167,NULL,'166',1,'2017-03-31 16:29:18','491',NULL),(68,167,NULL,'156',1,'2017-03-31 16:29:18','492',NULL),(69,167,NULL,'168',1,'2017-03-31 16:29:18','493',NULL),(70,167,NULL,'169',1,'2017-03-31 16:29:18','494',NULL),(71,167,NULL,'181',1,'2017-03-31 16:29:18','495',NULL),(72,167,NULL,'176',1,'2017-03-31 16:32:47','496',NULL),(73,167,NULL,'141',1,'2017-03-31 16:32:47','497',NULL),(74,167,NULL,'177',1,'2017-03-31 16:32:47','498',NULL),(75,167,NULL,'143',1,'2017-03-31 16:32:47','499',NULL),(76,167,NULL,'179',1,'2017-03-31 16:32:47','500',NULL),(77,167,NULL,'144',1,'2017-03-31 16:32:47','501',NULL),(78,167,'185','183',1,'2017-04-08 10:37:10','1',NULL),(79,167,NULL,'194',1,'2017-04-08 10:37:10','502',NULL),(80,167,NULL,'185',1,'2017-04-08 10:43:11','503',NULL),(81,167,NULL,'203',1,'2017-04-08 11:31:00','504',NULL),(82,167,'89','183',1,'2017-04-11 18:03:11','419',NULL),(83,167,'90','183',1,'2017-04-11 18:03:11','420',NULL),(84,167,NULL,'153',1,'2017-04-11 18:03:11','505',NULL),(85,167,NULL,'165',1,'2017-04-11 18:03:11','506',NULL),(86,167,NULL,'109',1,'2017-04-11 18:10:25','507',NULL),(87,167,NULL,'110',1,'2017-04-11 18:10:25','508',NULL);
/*!40000 ALTER TABLE `Change_History` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DBField`
--

DROP TABLE IF EXISTS `DBField`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DBField` (
  `DBField_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Field_Description` text,
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
  `Field_Default` varchar(255) DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=200 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DBField`
--

LOCK TABLES `DBField` WRITE;
/*!40000 ALTER TABLE `DBField` DISABLE KEYS */;
INSERT INTO `DBField` VALUES (120,NULL,'Equipment','Equipment_ID','',NULL,'',0,'Equipment_ID','int(4)','','YES',NULL,20,NULL,53,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(121,NULL,'Stock','Stock_ID','',NULL,'',0,'Stock_ID','int(11)','','YES',NULL,20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(122,NULL,'Stock','FK_Employee__ID','',NULL,'',0,'FK_Employee__ID','int(11)','','YES',NULL,20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(123,NULL,'Stock','Stock_Lot_Number','',NULL,'',0,'Stock_Lot_Number','varchar(80)','','YES',NULL,20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(124,NULL,'Stock','FK_Orders__ID','',NULL,'',0,'FK_Orders__ID','int(11)','','YES',NULL,20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(125,NULL,'Stock','Stock_Received','',NULL,'',0,'Stock_Received','date','','YES',NULL,20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(126,NULL,'Stock','FK_Box__ID','',NULL,'',0,'FK_Box__ID','int(11)','','YES',NULL,20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(127,NULL,'Stock','Stock_Number_in_Batch','',NULL,'',0,'Stock_Number_in_Batch','int(11)','','YES',NULL,20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(128,NULL,'Stock','Stock_Cost','',NULL,'',0,'Stock_Cost','float','','YES',NULL,20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(129,NULL,'Stock','Identifier_Number','',NULL,'',0,'Identifier_Number','varchar(80)','','YES',NULL,20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(130,NULL,'Stock','FK_Barcode_Label__ID','',NULL,'',0,'FK_Barcode_Label__ID','int(11)','','YES',NULL,20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(131,NULL,'Stock','FK_Grp__ID','',NULL,'',0,'FK_Grp__ID','int(11)','','YES','0',20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(132,NULL,'Stock','Identifier_Number_Type','',NULL,'',0,'Identifier_Number_Type','enum(\'Component Number\',\'Reference ID\')','','YES',NULL,20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(133,NULL,'Stock','FK_Stock_Catalog__ID','',NULL,'',0,'FK_Stock_Catalog__ID','int(11)','','YES','0',20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(134,NULL,'Stock','Stock_Notes','',NULL,'',0,'Stock_Notes','text','','YES',NULL,20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(135,NULL,'Stock','PO_Number','',NULL,'',0,'PO_Number','varchar(20)','','YES',NULL,20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(136,NULL,'Stock','Requisition_Number','',NULL,'',0,'Requisition_Number','varchar(20)','','YES',NULL,20,NULL,54,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(137,NULL,'Stock','Stock_ID','',NULL,'',0,'Stock_ID','int(11)','','YES',NULL,20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(138,NULL,'Stock','Identifier_Number','',NULL,'',0,'Identifier_Number','varchar(80)','','YES',NULL,20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(139,NULL,'Stock','FK_Employee__ID','',NULL,'',0,'FK_Employee__ID','int(11)','','YES',NULL,20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(140,NULL,'Stock','Stock_Lot_Number','',NULL,'',0,'Stock_Lot_Number','varchar(80)','','YES',NULL,20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(141,NULL,'Stock','Stock_Received','',NULL,'',0,'Stock_Received','date','','YES',NULL,20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(142,NULL,'Stock','FK_Orders__ID','',NULL,'',0,'FK_Orders__ID','int(11)','','YES',NULL,20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(143,NULL,'Stock','FK_Box__ID','',NULL,'',0,'FK_Box__ID','int(11)','','YES',NULL,20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(144,NULL,'Stock','Stock_Number_in_Batch','',NULL,'',0,'Stock_Number_in_Batch','int(11)','','YES',NULL,20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(145,NULL,'Stock','FK_Grp__ID','',NULL,'',0,'FK_Grp__ID','int(11)','','YES','0',20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(146,NULL,'Stock','Stock_Cost','',NULL,'',0,'Stock_Cost','float','','YES',NULL,20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(147,NULL,'Stock','FK_Barcode_Label__ID','',NULL,'',0,'FK_Barcode_Label__ID','int(11)','','YES',NULL,20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(148,NULL,'Stock','Identifier_Number_Type','',NULL,'',0,'Identifier_Number_Type','enum(\'Component Number\',\'Reference ID\')','','YES',NULL,20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(149,NULL,'Stock','FK_Stock_Catalog__ID','',NULL,'',0,'FK_Stock_Catalog__ID','int(11)','','YES','0',20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(150,NULL,'Stock','Stock_Notes','',NULL,'',0,'Stock_Notes','text','','YES',NULL,20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(151,NULL,'Stock','PO_Number','',NULL,'',0,'PO_Number','varchar(20)','','YES',NULL,20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(152,NULL,'Stock','Requisition_Number','',NULL,'',0,'Requisition_Number','varchar(20)','','YES',NULL,20,NULL,55,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(153,NULL,'Plate_Prep','Plate_Prep_ID','',NULL,'',0,'Plate_Prep_ID','int(11)','','YES',NULL,20,NULL,56,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(154,NULL,'Plate_Prep','FK_Plate__ID','',NULL,'',0,'FK_Plate__ID','int(11)','','YES',NULL,20,NULL,56,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(155,NULL,'Plate_Prep','FK_Prep__ID','',NULL,'',0,'FK_Prep__ID','int(11)','','YES',NULL,20,NULL,56,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(156,NULL,'Plate_Prep','FK_Plate_Set__Number','',NULL,'',0,'FK_Plate_Set__Number','int(11)','','YES',NULL,20,NULL,56,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(157,NULL,'Plate_Prep','FK_Equipment__ID','',NULL,'',0,'FK_Equipment__ID','int(11)','','YES',NULL,20,NULL,56,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(158,NULL,'Plate_Prep','Solution_Quantity','',NULL,'',0,'Solution_Quantity','float','','YES',NULL,20,NULL,56,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(159,NULL,'Plate_Prep','FK_Solution__ID','',NULL,'',0,'FK_Solution__ID','int(11)','','YES',NULL,20,NULL,56,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(160,NULL,'Plate_Prep','Solution_Quantity_Units','',NULL,'',0,'Solution_Quantity_Units','enum(\'pl\',\'nl\',\'ul\',\'ml\',\'l\')','','YES',NULL,20,NULL,56,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(161,NULL,'Plate_Prep','Transfer_Quantity','',NULL,'',0,'Transfer_Quantity','float','','YES',NULL,20,NULL,56,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(162,NULL,'Plate_Prep','Transfer_Quantity_Units','',NULL,'',0,'Transfer_Quantity_Units','enum(\'pl\',\'nl\',\'ul\',\'ml\',\'l\',\'g\',\'mg\',\'ug\',\'ng\',\'pg\')','','YES',NULL,20,NULL,56,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(163,NULL,'Plate','Plate_ID','',NULL,'',0,'Plate_ID','int(11)','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(164,NULL,'Plate','Plate_Size','',NULL,'',0,'Plate_Size','enum(\'1-well\',\'8-well\',\'16-well\',\'32-well\',\'48-well\',\'64-well\',\'80-well\',\'96-well\',\'384-well\',\'1.5 ml\',\'50 ml\',\'15 ml\',\'5 ml\',\'2 ml\',\'0.5 ml\',\'0.2 ml\')','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(165,NULL,'Plate','Plate_Created','',NULL,'',0,'Plate_Created','datetime','','YES','1000-01-01 00:00:00',20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(166,NULL,'Plate','FK_Library__Name','',NULL,'',0,'FK_Library__Name','varchar(40)','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(167,NULL,'Plate','FK_Rack__ID','',NULL,'',0,'FK_Rack__ID','int(11)','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(168,NULL,'Plate','FK_Employee__ID','',NULL,'',0,'FK_Employee__ID','int(11)','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(169,NULL,'Plate','Plate_Number','',NULL,'',0,'Plate_Number','int(4)','','YES','0',20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(170,NULL,'Plate','Plate_Comments','',NULL,'',0,'Plate_Comments','text','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(171,NULL,'Plate','FKParent_Plate__ID','',NULL,'',0,'FKParent_Plate__ID','int(11)','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(172,NULL,'Plate','Plate_Test_Status','',NULL,'',0,'Plate_Test_Status','enum(\'Test\',\'Production\')','','YES','Production',20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(173,NULL,'Plate','Plate_Status','',NULL,'',0,'Plate_Status','enum(\'Active\',\'Pre-Printed\',\'Reserved\',\'Temporary\',\'Failed\',\'Thrown Out\',\'Exported\',\'Archived\',\'On Hold\')','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(174,NULL,'Plate','FK_Plate_Format__ID','',NULL,'',0,'FK_Plate_Format__ID','int(11)','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(175,NULL,'Plate','Plate_Type','',NULL,'',0,'Plate_Type','enum(\'Library_Plate\',\'Tube\',\'Array\')','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(176,NULL,'Plate','FKOriginal_Plate__ID','',NULL,'',0,'FKOriginal_Plate__ID','int(10) unsigned','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(177,NULL,'Plate','Current_Volume','',NULL,'',0,'Current_Volume','float','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(178,NULL,'Plate','Current_Volume_Units','',NULL,'',0,'Current_Volume_Units','enum(\'pl\',\'nl\',\'ul\',\'ml\',\'l\',\'g\',\'mg\',\'ug\',\'ng\',\'pg\',\'n/a\')','','YES','ul',20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(179,NULL,'Plate','Parent_Quadrant','',NULL,'',0,'Parent_Quadrant','enum(\'\',\'a\',\'b\',\'c\',\'d\')','','YES','',20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(180,NULL,'Plate','Plate_Parent_Well','',NULL,'',0,'Plate_Parent_Well','char(3)','','YES','',20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(181,NULL,'Plate','QC_Status','',NULL,'',0,'QC_Status','enum(\'N/A\',\'Pending\',\'Failed\',\'Re-Test\',\'Passed\')','','YES','N/A',20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(182,NULL,'Plate','FK_Branch__Code','',NULL,'',0,'FK_Branch__Code','varchar(5)','','YES','',20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(183,NULL,'Plate','FK_Pipeline__ID','',NULL,'',0,'FK_Pipeline__ID','int(11)','','YES','0',20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(184,NULL,'Plate','Plate_Label','',NULL,'',0,'Plate_Label','varchar(40)','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(185,NULL,'Plate','FKLast_Prep__ID','',NULL,'',0,'FKLast_Prep__ID','int(11)','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(186,NULL,'Plate','FK_Sample_Type__ID','',NULL,'',0,'FK_Sample_Type__ID','int(11)','','YES','0',20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(187,NULL,'Plate','FK_Work_Request__ID','',NULL,'',0,'FK_Work_Request__ID','int(11)','','YES',NULL,20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(188,NULL,'Plate','Plate_Class','',NULL,'',0,'Plate_Class','enum(\'Standard\',\'Extraction\',\'ReArray\',\'Oligo\')','','YES','Standard',20,NULL,57,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(189,NULL,'user','name','',NULL,'',0,'name','varchar(255)','','YES',NULL,20,NULL,58,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(190,NULL,'user','FK_Employee__ID','',NULL,'',0,'FK_Employee__ID','varchar(255)','','YES',NULL,20,NULL,58,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(191,NULL,'user','access','',NULL,'',0,'access','enum(\'public\',\'lab\',\'research\',\'lab admin\',\'admin\')','','YES','lab',20,NULL,58,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(192,NULL,'user','email','',NULL,'',0,'email','varchar(255)','','YES',NULL,20,NULL,58,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(193,NULL,'user','encryptedPassword','',NULL,'',0,'encryptedPassword','varchar(255)','','YES',NULL,20,NULL,58,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(194,NULL,'user','updatedAt','',NULL,'',0,'updatedAt','datetime','','YES',NULL,20,NULL,58,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(195,NULL,'user','lastLoggedIn','',NULL,'',0,'lastLoggedIn','date','','YES',NULL,20,NULL,58,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(196,NULL,'user','status','',NULL,'',0,'status','enum(\'inactive\',\'pending\',\'active\')','','YES','pending',20,NULL,58,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(197,NULL,'user','gravatarUrl','',NULL,'',0,'gravatarUrl','varchar(255)','','YES',NULL,20,NULL,58,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(198,NULL,'user','id','',NULL,'',0,'id','int(10) unsigned','','YES',NULL,20,NULL,58,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL),(199,NULL,'user','createdAt','',NULL,'',0,'createdAt','datetime','','YES',NULL,20,NULL,58,NULL,NULL,'yes','no','Custom',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `DBField` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DBTable`
--

DROP TABLE IF EXISTS `DBTable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DBTable` (
  `DBTable_ID` int(11) NOT NULL AUTO_INCREMENT,
  `DBTable_Name` varchar(80) NOT NULL DEFAULT '',
  `DBTable_Description` text,
  `DBTable_Status` text,
  `Status_Last_Updated` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  `DBTable_Type` enum('General','Lab Object','Lab Process','Object Detail','Settings','Dynamic','DB Management','Application Specific','Class','Subclass','Lookup','Join','Imported','Manual Join','Recursive Lookup') DEFAULT NULL,
  `DBTable_Title` varchar(80) NOT NULL DEFAULT '',
  `Scope` enum('Core','Lab','Plugin','Option','Custom') DEFAULT NULL,
  `Package_Name` varchar(40) DEFAULT NULL,
  `Records` int(11) NOT NULL DEFAULT '0',
  `FK_Package__ID` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`DBTable_ID`),
  UNIQUE KEY `DBTable_Name` (`DBTable_Name`),
  UNIQUE KEY `name` (`DBTable_Name`),
  KEY `package` (`FK_Package__ID`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DBTable`
--

LOCK TABLES `DBTable` WRITE;
/*!40000 ALTER TABLE `DBTable` DISABLE KEYS */;
INSERT INTO `DBTable` VALUES (55,'Stock',NULL,NULL,'1000-01-01 00:00:00',NULL,'',NULL,NULL,0,0),(56,'Plate_Prep',NULL,NULL,'1000-01-01 00:00:00',NULL,'',NULL,NULL,0,0),(57,'Plate',NULL,NULL,'1000-01-01 00:00:00',NULL,'',NULL,NULL,0,0),(58,'user',NULL,NULL,'1000-01-01 00:00:00',NULL,'',NULL,NULL,0,0),(59,'Tube',NULL,NULL,'1000-01-01 00:00:00',NULL,'',NULL,NULL,0,0);
/*!40000 ALTER TABLE `DBTable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Defined_Plate_Set`
--

DROP TABLE IF EXISTS `Defined_Plate_Set`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Defined_Plate_Set` (
  `Defined_Plate_Set_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Plate_Set_Defined` datetime DEFAULT NULL,
  `FK_Employee__ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`Defined_Plate_Set_ID`),
  KEY `employee` (`FK_Employee__ID`)
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Defined_Plate_Set`
--

LOCK TABLES `Defined_Plate_Set` WRITE;
/*!40000 ALTER TABLE `Defined_Plate_Set` DISABLE KEYS */;
INSERT INTO `Defined_Plate_Set` VALUES (1,'2017-01-01 19:35:51',1),(2,'2017-01-03 14:14:57',1),(3,'2017-01-03 14:16:05',1),(4,'2017-01-03 14:54:03',1),(5,'2017-01-03 14:56:41',1),(6,'2017-01-04 14:21:22',1),(7,'2017-01-12 15:49:24',1),(8,'2017-01-12 16:08:48',1),(9,'2017-01-12 16:09:57',1),(10,'2017-01-12 16:16:04',1),(11,'2017-01-12 16:22:56',1),(12,'2017-01-12 16:24:18',1),(13,'2017-01-12 16:33:41',1),(14,'2017-01-12 22:15:36',1),(15,'2017-01-12 22:26:33',1),(16,'2017-01-12 22:36:59',1),(17,'2017-01-12 22:37:16',1),(18,'2017-01-24 08:50:23',1),(19,'2017-01-24 08:54:55',1),(20,'2017-01-24 09:52:34',1),(21,'2017-01-24 17:09:27',1),(22,'2017-01-24 17:34:52',1),(23,'2017-01-24 17:44:31',1),(24,'2017-01-24 17:46:47',1),(25,'2017-01-24 17:47:55',1),(26,'2017-01-24 18:51:42',1),(27,'2017-01-24 18:53:02',1),(28,'2017-01-24 18:54:02',1),(29,'2017-01-24 18:54:37',1),(30,'2017-01-24 18:58:03',1),(31,'2017-01-24 18:59:36',1),(32,'2017-01-24 19:02:30',1),(33,'2017-01-24 19:03:13',1),(34,'2017-01-24 19:03:32',1),(35,'2017-01-24 19:05:27',1),(36,'2017-01-24 19:07:03',1),(37,'2017-01-24 19:08:16',1),(38,'2017-01-24 19:08:29',1),(39,'2017-01-24 19:10:18',1),(40,'2017-01-24 19:10:47',1),(41,'2017-01-24 19:14:47',1),(42,'2017-01-24 19:15:28',1),(43,'2017-01-24 19:20:26',1),(44,'2017-01-24 19:21:51',1),(45,'2017-01-24 19:22:45',1),(46,'2017-01-24 19:23:06',1),(47,'2017-01-25 09:48:18',1),(48,'2017-01-25 09:51:15',1),(49,'2017-01-25 09:51:54',1),(50,'2017-01-25 09:56:30',1),(51,'2017-02-05 13:40:57',1),(52,'2017-02-05 13:42:18',1),(53,'2017-02-05 13:42:36',1),(54,'2017-02-08 20:17:20',1),(55,'2017-03-29 15:31:57',1),(56,'2017-03-29 15:34:47',1),(57,'2017-03-29 15:35:23',1),(58,'2017-03-29 15:35:49',1),(59,'2017-03-29 15:36:17',1),(60,'2017-03-29 15:37:17',1),(61,'2017-03-29 15:37:37',1),(62,'2017-03-29 15:40:53',1),(63,'2017-03-29 15:42:20',1),(64,'2017-03-29 15:42:51',1),(65,'2017-03-29 15:44:11',1),(66,'2017-03-29 15:48:53',1),(67,'2017-03-29 15:49:34',1),(68,'2017-03-29 15:52:03',1),(69,'2017-03-29 15:52:51',1),(70,'2017-03-29 16:23:47',1),(71,'2017-03-29 16:24:05',1),(72,'2017-03-29 16:27:46',1),(73,'2017-03-29 16:28:07',1),(74,'2017-03-29 16:42:01',1),(75,'2017-03-29 16:42:11',1),(76,'2017-03-29 20:18:25',1),(77,'2017-03-29 20:20:38',1),(78,'2017-03-29 20:21:41',1),(79,'2017-03-29 20:24:57',1),(80,'2017-03-30 15:02:12',1),(81,'2017-03-31 16:14:48',1),(82,'2017-03-31 16:29:18',1),(83,'2017-03-31 16:32:47',1),(84,'2017-04-08 10:34:00',1),(85,'2017-04-08 10:37:10',1),(86,'2017-04-08 10:42:13',1),(87,'2017-04-08 10:43:12',1),(88,'2017-04-08 11:27:02',1),(89,'2017-04-08 11:29:36',1),(90,'2017-04-08 11:30:31',1),(91,'2017-04-08 11:31:00',1),(92,'2017-04-11 16:11:17',1),(93,'2017-04-11 16:30:35',1),(94,'2017-04-11 16:36:13',1),(95,'2017-04-11 16:41:59',1),(96,'2017-04-11 16:44:43',1),(97,'2017-04-11 16:46:00',1),(98,'2017-04-11 17:02:52',1),(99,'2017-04-11 17:04:29',1),(100,'2017-04-11 17:05:09',1),(101,'2017-04-11 17:05:55',1),(102,'2017-04-11 17:07:25',1),(103,'2017-04-11 17:11:06',1),(104,'2017-04-11 17:16:11',1),(105,'2017-04-11 17:19:51',1),(106,'2017-04-11 17:22:00',1),(107,'2017-04-11 17:23:59',1),(108,'2017-04-11 17:28:37',1),(109,'2017-04-11 17:41:16',1),(110,'2017-04-11 17:43:07',1),(111,'2017-04-11 17:44:42',1),(112,'2017-04-11 17:49:41',1),(113,'2017-04-11 17:50:27',1),(114,'2017-04-11 17:51:06',1),(115,'2017-04-11 17:54:48',1),(116,'2017-04-11 17:56:06',1),(117,'2017-04-11 18:00:57',1),(118,'2017-04-11 18:03:11',1),(119,'2017-04-11 18:10:02',1),(120,'2017-04-11 18:10:25',1),(121,'2017-04-11 18:10:46',1);
/*!40000 ALTER TABLE `Defined_Plate_Set` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Employee`
--

DROP TABLE IF EXISTS `Employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Employee`
--

LOCK TABLES `Employee` WRITE;
/*!40000 ALTER TABLE `Employee` DISABLE KEYS */;
INSERT INTO `Employee` VALUES (1,'Ran',NULL,NULL,'ran.guin@gmail.com',NULL,NULL,NULL,NULL,NULL,'78a302dd267f6044',NULL,2);
/*!40000 ALTER TABLE `Employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Equipment`
--

DROP TABLE IF EXISTS `Equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Equipment`
--

LOCK TABLES `Equipment` WRITE;
/*!40000 ALTER TABLE `Equipment` DISABLE KEYS */;
INSERT INTO `Equipment` VALUES (1,'F80-1',NULL,NULL,1,2,11,NULL,0,NULL),(2,'F80-3',NULL,NULL,2,2,11,NULL,0,NULL),(5,'F80-4',NULL,NULL,1,1,16,'In Use',0,NULL),(10,'F80-5',NULL,'abc',1,2,22,'In Use',0,NULL),(11,'F80-6',NULL,'def',2,2,22,'In Use',0,NULL);
/*!40000 ALTER TABLE `Equipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Equipment_Category`
--

DROP TABLE IF EXISTS `Equipment_Category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Equipment_Category` (
  `Equipment_Category_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Prefix` varchar(10) NOT NULL DEFAULT '',
  `Sub_Category` varchar(40) DEFAULT 'N/A',
  `Category` varchar(40) NOT NULL DEFAULT '',
  `Category_Description` text,
  PRIMARY KEY (`Equipment_Category_ID`),
  KEY `category` (`Category`),
  KEY `sub_category` (`Sub_Category`)
) ENGINE=MyISAM AUTO_INCREMENT=90 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Equipment_Category`
--

LOCK TABLES `Equipment_Category` WRITE;
/*!40000 ALTER TABLE `Equipment_Category` DISABLE KEYS */;
INSERT INTO `Equipment_Category` VALUES (86,'F80','N/A','Freezer (-80 degrees)',NULL),(87,'F40','N/A','Freezer (-40 degrees)',NULL),(88,'F4','N/A','Fridge (-4 degrees)',NULL),(89,'F20','N/A','Freezer (-20 degrees)',NULL);
/*!40000 ALTER TABLE `Equipment_Category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Pipeline`
--

DROP TABLE IF EXISTS `Pipeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Pipeline` (
  `Pipeline_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Pipeline_Name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Pipeline_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Pipeline`
--

LOCK TABLES `Pipeline` WRITE;
/*!40000 ALTER TABLE `Pipeline` DISABLE KEYS */;
INSERT INTO `Pipeline` VALUES (1,'Standard');
/*!40000 ALTER TABLE `Pipeline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Plate`
--

DROP TABLE IF EXISTS `Plate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=509 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Plate`
--

LOCK TABLES `Plate` WRITE;
/*!40000 ALTER TABLE `Plate` DISABLE KEYS */;
INSERT INTO `Plate` VALUES (1,NULL,'2016-09-01 00:00:00','TestLib',183,1,1,NULL,'.. to garbage','Thrown Out','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',46,5,NULL,'Standard'),(2,NULL,'2017-01-01 13:23:57','TestLib',85,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(3,NULL,'2017-01-01 13:23:57','TestLib',85,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(4,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(5,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(6,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(7,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(8,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(9,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(10,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(11,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(12,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(13,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(14,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(15,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(16,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(17,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(18,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(19,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(20,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(21,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(22,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(23,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(24,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(25,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(26,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(27,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(28,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(29,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(30,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(31,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(32,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(33,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(34,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(35,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(36,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(37,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(38,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(39,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(40,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(41,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(42,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(43,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(44,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(45,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(46,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(47,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(48,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(49,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(50,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(51,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(52,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(53,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(54,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(55,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(56,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(57,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(58,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(59,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(60,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(61,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(62,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(63,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(64,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(65,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(66,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(67,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(68,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(69,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(70,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(71,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(72,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(73,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(74,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(75,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(76,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(77,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(78,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(79,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(80,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(81,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(82,NULL,'2017-01-01 13:23:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(83,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(84,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(85,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(86,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(87,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(88,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(89,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(90,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(91,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(92,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(93,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(94,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(95,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(96,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(97,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(98,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(99,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(100,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(101,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(102,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(103,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(104,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(105,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(106,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(107,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(108,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(109,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(110,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(111,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(112,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(113,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(114,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(115,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(116,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(117,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(118,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(119,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(120,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(121,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(122,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(123,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(124,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(125,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(126,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(127,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(128,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(129,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(130,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(131,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(132,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(133,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(134,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(135,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(136,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(137,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(138,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(139,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(140,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(141,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(142,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(143,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(144,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(145,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(146,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(147,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(148,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(149,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(150,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(151,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(152,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(153,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(154,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(155,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(156,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(157,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(158,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(159,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(160,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(161,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(162,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(163,NULL,'2017-01-01 13:24:20','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(164,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(165,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(166,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(167,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(168,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(169,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(170,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(171,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(172,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(173,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(174,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(175,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(176,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(177,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(178,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(179,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(180,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(181,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(182,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(183,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(184,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(185,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(186,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(187,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(188,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(189,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(190,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(191,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(192,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(193,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(194,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(195,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(196,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(197,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(198,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(199,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(200,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(201,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(202,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(203,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(204,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(205,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(206,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(207,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(208,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(209,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(210,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(211,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(212,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(213,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(214,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(215,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(216,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(217,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(218,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(219,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(220,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(221,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(222,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(223,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(224,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(225,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(226,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(227,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(228,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(229,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(230,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(231,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(232,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(233,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(234,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(235,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(236,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(237,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(238,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(239,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(240,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(241,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(242,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(243,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(244,NULL,'2017-01-01 13:25:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(245,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(246,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(247,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(248,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(249,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,1,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(250,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(251,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(252,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(253,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(254,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(255,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(256,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(257,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(258,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(259,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(260,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(261,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(262,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(263,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(264,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(265,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(266,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(267,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(268,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(269,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(270,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(271,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(272,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(273,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(274,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(275,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(276,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(277,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(278,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(279,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(280,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(281,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(282,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(283,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(284,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(285,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(286,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(287,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(288,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(289,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(290,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(291,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(292,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(293,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(294,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(295,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(296,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(297,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(298,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(299,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(300,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(301,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(302,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(303,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(304,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(305,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(306,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(307,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(308,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(309,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(310,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(311,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(312,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(313,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(314,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(315,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(316,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(317,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(318,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(319,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(320,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(321,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(322,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(323,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(324,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(325,NULL,'2017-01-01 13:26:19','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(326,NULL,'2017-01-01 19:35:51','TestLib',4,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(327,NULL,'2017-01-01 19:35:51','TestLib',5,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(328,NULL,'2017-01-01 19:35:51','TestLib',6,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(329,NULL,'2017-01-01 19:35:51','TestLib',7,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(330,NULL,'2017-01-01 19:35:51','TestLib',8,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(331,NULL,'2017-01-01 19:35:51','TestLib',9,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(332,NULL,'2017-01-01 19:35:51','TestLib',10,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(333,NULL,'2017-01-01 19:35:51','TestLib',11,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(334,NULL,'2017-01-01 19:35:51','TestLib',12,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(335,NULL,'2017-01-01 19:35:51','TestLib',13,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(336,NULL,'2017-01-01 19:35:51','TestLib',14,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(337,NULL,'2017-01-01 19:35:51','TestLib',15,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(338,NULL,'2017-01-01 19:35:51','TestLib',16,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(339,NULL,'2017-01-01 19:35:51','TestLib',17,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(340,NULL,'2017-01-01 19:35:51','TestLib',18,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(341,NULL,'2017-01-01 19:35:51','TestLib',19,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(342,NULL,'2017-01-01 19:35:51','TestLib',20,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(343,NULL,'2017-01-01 19:35:51','TestLib',21,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(344,NULL,'2017-01-01 19:35:51','TestLib',22,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(345,NULL,'2017-01-01 19:35:51','TestLib',23,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(346,NULL,'2017-01-01 19:35:51','TestLib',24,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(347,NULL,'2017-01-01 19:35:51','TestLib',25,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(348,NULL,'2017-01-01 19:35:51','TestLib',26,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(349,NULL,'2017-01-01 19:35:51','TestLib',27,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(350,NULL,'2017-01-01 19:35:51','TestLib',28,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(351,NULL,'2017-01-01 19:35:51','TestLib',29,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(352,NULL,'2017-01-01 19:35:51','TestLib',30,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(353,NULL,'2017-01-01 19:35:51','TestLib',31,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(354,NULL,'2017-01-01 19:35:51','TestLib',32,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(355,NULL,'2017-01-01 19:35:51','TestLib',33,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(356,NULL,'2017-01-01 19:35:51','TestLib',34,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(357,NULL,'2017-01-01 19:35:51','TestLib',35,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(358,NULL,'2017-01-01 19:35:51','TestLib',36,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(359,NULL,'2017-01-01 19:35:51','TestLib',37,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(360,NULL,'2017-01-01 19:35:51','TestLib',38,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(361,NULL,'2017-01-01 19:35:51','TestLib',39,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(362,NULL,'2017-01-01 19:35:51','TestLib',40,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(363,NULL,'2017-01-01 19:35:51','TestLib',41,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(364,NULL,'2017-01-01 19:35:51','TestLib',42,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(365,NULL,'2017-01-01 19:35:51','TestLib',43,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(366,NULL,'2017-01-01 19:35:51','TestLib',44,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(367,NULL,'2017-01-01 19:35:51','TestLib',45,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(368,NULL,'2017-01-01 19:35:51','TestLib',46,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(369,NULL,'2017-01-01 19:35:51','TestLib',47,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(370,NULL,'2017-01-01 19:35:51','TestLib',48,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(371,NULL,'2017-01-01 19:35:51','TestLib',49,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(372,NULL,'2017-01-01 19:35:51','TestLib',50,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(373,NULL,'2017-01-01 19:35:51','TestLib',51,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(374,NULL,'2017-01-01 19:35:51','TestLib',52,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(375,NULL,'2017-01-01 19:35:51','TestLib',53,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(376,NULL,'2017-01-01 19:35:51','TestLib',54,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(377,NULL,'2017-01-01 19:35:51','TestLib',55,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(378,NULL,'2017-01-01 19:35:51','TestLib',56,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(379,NULL,'2017-01-01 19:35:51','TestLib',57,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(380,NULL,'2017-01-01 19:35:51','TestLib',58,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(381,NULL,'2017-01-01 19:35:51','TestLib',59,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(382,NULL,'2017-01-01 19:35:51','TestLib',60,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(383,NULL,'2017-01-01 19:35:51','TestLib',61,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(384,NULL,'2017-01-01 19:35:51','TestLib',62,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(385,NULL,'2017-01-01 19:35:51','TestLib',63,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(386,NULL,'2017-01-01 19:35:51','TestLib',64,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(387,NULL,'2017-01-01 19:35:51','TestLib',65,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(388,NULL,'2017-01-01 19:35:51','TestLib',66,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(389,NULL,'2017-01-01 19:35:51','TestLib',67,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(390,NULL,'2017-01-01 19:35:51','TestLib',68,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(391,NULL,'2017-01-01 19:35:51','TestLib',69,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(392,NULL,'2017-01-01 19:35:51','TestLib',70,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(393,NULL,'2017-01-01 19:35:51','TestLib',71,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(394,NULL,'2017-01-01 19:35:51','TestLib',72,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(395,NULL,'2017-01-01 19:35:51','TestLib',73,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(396,NULL,'2017-01-01 19:35:51','TestLib',74,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(397,NULL,'2017-01-01 19:35:51','TestLib',75,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(398,NULL,'2017-01-01 19:35:51','TestLib',76,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(399,NULL,'2017-01-01 19:35:51','TestLib',77,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(400,NULL,'2017-01-01 19:35:51','TestLib',78,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(401,NULL,'2017-01-01 19:35:51','TestLib',79,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(402,NULL,'2017-01-01 19:35:51','TestLib',80,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(403,NULL,'2017-01-01 19:35:51','TestLib',81,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(404,NULL,'2017-01-01 19:35:51','TestLib',82,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(405,NULL,'2017-01-01 19:35:51','TestLib',83,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(406,NULL,'2017-01-01 19:35:51','TestLib',84,1,1,1,'','Active','Test',5,'Tube',NULL,25,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(407,NULL,'2017-01-03 14:14:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(408,NULL,'2017-01-03 14:16:05','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(409,NULL,'2017-01-03 14:23:32','TestLib',NULL,1,1,1,'','Active','Test',4,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(410,NULL,'2017-01-03 14:25:32','TestLib',NULL,1,1,1,'','Active','Test',4,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(411,NULL,'2017-01-03 14:45:39','TestLib',NULL,1,1,1,'','Active','Test',4,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(412,NULL,'2017-01-03 14:47:39','TestLib',NULL,1,1,1,'','Active','Test',4,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(413,NULL,'2017-01-03 14:48:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(414,NULL,'2017-01-03 14:50:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(415,NULL,'2017-01-03 14:51:59','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(416,NULL,'2017-01-03 14:54:03','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(417,NULL,'2017-01-03 14:56:40','TestLib',87,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(418,NULL,'2017-01-04 14:21:22','TestLib',88,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(419,NULL,'2017-01-12 15:49:23','TestLib',183,1,1,1,'','Thrown Out','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',58,5,NULL,'Standard'),(420,NULL,'2017-01-12 15:49:23','TestLib',183,1,1,1,'','Thrown Out','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',58,5,NULL,'Standard'),(421,NULL,'2017-01-12 16:08:48','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(422,NULL,'2017-01-12 16:09:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(423,NULL,'2017-01-12 16:09:57','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(424,NULL,'2017-01-12 16:16:03','TestLib',91,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(425,NULL,'2017-01-12 16:16:03','TestLib',92,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(426,NULL,'2017-01-12 16:22:56','TestLib',NULL,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(427,NULL,'2017-01-12 16:24:18','TestLib',93,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(428,NULL,'2017-01-12 16:24:18','TestLib',94,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(429,NULL,'2017-01-12 16:33:41','TestLib',95,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(430,NULL,'2017-01-12 16:33:41','TestLib',96,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(431,NULL,'2017-01-12 22:15:36','TestLib',97,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(432,NULL,'2017-01-12 22:15:36','TestLib',98,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(433,NULL,'2017-01-12 22:15:36','TestLib',99,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(434,NULL,'2017-01-12 22:26:32','TestLib',100,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(435,NULL,'2017-01-12 22:26:32','TestLib',101,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(436,NULL,'2017-01-12 22:36:59','TestLib',102,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(437,NULL,'2017-01-12 22:37:16','TestLib',103,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(438,NULL,'2017-01-12 22:37:16','TestLib',104,1,1,1,'','Active','Test',5,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(439,NULL,'2017-01-24 08:55:28','TestLib',111,1,1,1,'','Active','Test',27,'Tube',NULL,2,'ml','','',NULL,'',1,'label1',2,11,NULL,'Standard'),(440,NULL,'2017-01-24 08:57:28','TestLib',111,1,1,1,'','Active','Test',27,'Tube',NULL,2,'ml','','',NULL,'',1,'label1',4,11,NULL,'Standard'),(441,NULL,'2017-01-24 09:47:28','TestLib',123,1,1,1,'','Active','Test',27,'Tube',NULL,2,'ml','','',NULL,'',1,'label1',6,11,NULL,'Standard'),(442,NULL,'2017-01-24 09:49:28','TestLib',123,1,1,1,'','Active','Test',27,'Tube',NULL,2,'ml','','',NULL,'',1,'label1',8,11,NULL,'Standard'),(443,NULL,'2017-01-24 09:52:33','TestLib',135,1,1,1,'','Thrown Out','Test',27,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',16,11,NULL,'Standard'),(444,NULL,'2017-01-24 17:47:54','TestLib',147,1,1,443,'','Active','Test',27,'Tube',NULL,123,'ml','','',NULL,'',1,'label1',11,11,NULL,'Standard'),(445,NULL,'2017-01-24 18:59:36','TestLib',159,1,1,443,'','Active','Test',27,'Tube',NULL,123,'ml','','',NULL,'',1,'label1',14,11,NULL,'Standard'),(446,NULL,'2017-01-24 19:08:29','TestLib',171,1,1,443,'','Thrown Out','Test',27,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',18,11,NULL,'Standard'),(447,NULL,'2017-01-24 19:10:47','TestLib',112,1,1,446,'','Active','Test',27,'Tube',NULL,456,'ml','','',NULL,'',1,'label1',18,11,NULL,'Standard'),(448,NULL,'2017-01-24 19:15:28','TestLib',124,1,1,1,'','Thrown Out','Test',27,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',22,11,NULL,'Standard'),(449,NULL,'2017-01-24 19:20:26','TestLib',136,1,1,448,'','Thrown Out','Test',27,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',26,11,NULL,'Standard'),(450,NULL,'2017-01-24 19:23:06','TestLib',148,1,1,449,'','Thrown Out','Test',27,'Tube',NULL,0.343,'ml','','',NULL,'',1,'label1',26,11,NULL,'Standard'),(451,NULL,'2017-01-25 09:51:54','TestLib',160,1,1,449,'','Active','Test',27,'Tube',NULL,0.246,'ml','','',NULL,'',1,'label1',26,11,NULL,'Standard'),(452,NULL,'2017-01-25 09:51:54','TestLib',172,1,1,450,'','Active','Test',27,'Tube',NULL,0.246,'ml','','',NULL,'',1,'label1',26,11,NULL,'Standard'),(453,NULL,'2017-02-05 13:42:36','TestLib',113,1,1,1,'','Active','Test',27,'Tube',NULL,0.268,'ml','','',NULL,'',1,'label1',28,11,NULL,'Standard'),(454,NULL,'2017-03-29 15:44:11','TestLib',125,1,1,1,'','Active','Test',27,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',28,11,NULL,'Standard'),(455,NULL,'2017-03-29 15:49:34','TestLib',137,1,1,1,'','Active','Test',27,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',32,11,NULL,'Standard'),(456,NULL,'2017-03-29 15:52:51','TestLib',149,1,1,1,'','Active','Test',27,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',34,11,NULL,'Standard'),(457,NULL,'2017-03-29 16:24:04','TestLib',161,1,1,1,'','Active','Test',27,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',36,11,NULL,'Standard'),(458,NULL,'2017-03-29 16:28:06','TestLib',173,1,1,1,'','Active','Test',27,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',38,11,NULL,'Standard'),(459,NULL,'2017-03-29 16:42:11','TestLib',114,1,1,1,'.. to garbage','Active','Test',27,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',40,11,NULL,'Standard'),(460,NULL,'2017-03-29 20:18:25','TestLib',126,1,1,419,'','Active','Test',5,'Tube',NULL,20,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(461,NULL,'2017-03-29 20:18:25','TestLib',138,1,1,420,'','Active','Test',5,'Tube',NULL,20,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(462,NULL,'2017-03-29 20:18:25','TestLib',150,1,1,419,'','Active','Test',5,'Tube',NULL,20,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(463,NULL,'2017-03-29 20:18:25','TestLib',162,1,1,420,'','Active','Test',5,'Tube',NULL,20,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(464,NULL,'2017-03-29 20:18:25','TestLib',174,1,1,419,'','Active','Test',5,'Tube',NULL,20,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(465,NULL,'2017-03-29 20:18:25','TestLib',115,1,1,420,'','Active','Test',5,'Tube',NULL,20,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(466,NULL,'2017-03-29 20:18:25','TestLib',127,1,1,419,'','Active','Test',5,'Tube',NULL,20,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(467,NULL,'2017-03-29 20:18:25','TestLib',139,1,1,420,'','Active','Test',5,'Tube',NULL,20,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(468,NULL,'2017-03-29 20:20:38','TestLib',105,1,1,419,'','Active','Test',4,'Tube',NULL,20,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(469,NULL,'2017-03-29 20:20:38','TestLib',106,1,1,420,'','Active','Test',4,'Tube',NULL,20,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(470,NULL,'2017-03-29 20:21:41','TestLib',89,1,1,419,'','Active','Test',13,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(471,NULL,'2017-03-29 20:21:41','TestLib',90,1,1,420,'','Active','Test',13,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(472,NULL,'2017-03-29 20:24:57','TestLib',107,1,1,419,'','Active','Test',5,'Tube',NULL,0.22,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(473,NULL,'2017-03-29 20:24:57','TestLib',108,1,1,420,'','Active','Test',5,'Tube',NULL,0.22,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(474,NULL,'2017-03-30 15:02:11','TestLib',117,1,1,419,'','Active','Test',5,'Tube',NULL,1.8,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(475,NULL,'2017-03-30 15:02:11','TestLib',129,1,1,420,'','Active','Test',5,'Tube',NULL,1.8,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(476,NULL,'2017-03-30 15:02:11','TestLib',118,1,1,419,'','Active','Test',5,'Tube',NULL,1.8,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(477,NULL,'2017-03-30 15:02:11','TestLib',130,1,1,420,'','Active','Test',5,'Tube',NULL,1.8,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(478,NULL,'2017-03-30 15:02:11','TestLib',119,1,1,419,'','Active','Test',5,'Tube',NULL,1.8,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(479,NULL,'2017-03-30 15:02:11','TestLib',131,1,1,420,'','Active','Test',5,'Tube',NULL,1.8,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(480,NULL,'2017-03-30 15:02:11','TestLib',120,1,1,419,'','Active','Test',5,'Tube',NULL,1.8,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(481,NULL,'2017-03-30 15:02:11','TestLib',132,1,1,420,'','Active','Test',5,'Tube',NULL,1.8,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(482,NULL,'2017-03-31 16:14:48','TestLib',151,1,1,420,'','Active','Test',4,'Tube',NULL,0.5,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(483,NULL,'2017-03-31 16:14:48','TestLib',163,1,1,419,'','Active','Test',4,'Tube',NULL,0.5,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(484,NULL,'2017-03-31 16:14:48','TestLib',116,1,1,420,'','Active','Test',4,'Tube',NULL,0.5,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(485,NULL,'2017-03-31 16:14:48','TestLib',128,1,1,419,'','Active','Test',4,'Tube',NULL,0.5,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(486,NULL,'2017-03-31 16:14:48','TestLib',152,1,1,420,'','Active','Test',4,'Tube',NULL,0.3,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(487,NULL,'2017-03-31 16:14:48','TestLib',164,1,1,419,'','Active','Test',4,'Tube',NULL,0.3,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(488,NULL,'2017-03-31 16:29:18','TestLib',175,1,1,419,'','Active','Test',5,'Tube',NULL,0.5,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(489,NULL,'2017-03-31 16:29:18','TestLib',140,1,1,420,'','Active','Test',5,'Tube',NULL,0.5,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(490,NULL,'2017-03-31 16:29:18','TestLib',154,1,1,419,'','Active','Test',5,'Tube',NULL,0.3,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(491,NULL,'2017-03-31 16:29:18','TestLib',166,1,1,420,'','Active','Test',5,'Tube',NULL,0.3,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(492,NULL,'2017-03-31 16:29:18','TestLib',156,1,1,419,'','Active','Test',5,'Tube',NULL,0.7,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(493,NULL,'2017-03-31 16:29:18','TestLib',168,1,1,420,'','Active','Test',5,'Tube',NULL,0.7,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(494,NULL,'2017-03-31 16:29:18','TestLib',169,1,1,419,'','Active','Test',5,'Tube',NULL,0.5,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(495,NULL,'2017-03-31 16:29:18','TestLib',181,1,1,420,'','Active','Test',5,'Tube',NULL,0.5,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(496,NULL,'2017-03-31 16:32:46','TestLib',176,1,1,419,'','Active','Test',5,'Tube',NULL,0.75,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(497,NULL,'2017-03-31 16:32:46','TestLib',141,1,1,420,'','Active','Test',5,'Tube',NULL,0.75,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(498,NULL,'2017-03-31 16:32:46','TestLib',177,1,1,419,'','Active','Test',5,'Tube',NULL,0.75,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(499,NULL,'2017-03-31 16:32:46','TestLib',143,1,1,420,'','Active','Test',5,'Tube',NULL,0.75,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(500,NULL,'2017-03-31 16:32:46','TestLib',179,1,1,419,'','Active','Test',5,'Tube',NULL,0.5,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(501,NULL,'2017-03-31 16:32:46','TestLib',144,1,1,420,'','Active','Test',5,'Tube',NULL,0.5,'ml','','',NULL,'',1,'label1',NULL,5,NULL,'Standard'),(502,NULL,'2017-04-08 10:37:10','TestLib',194,1,1,1,'.. to garbage','Active','Test',27,'Tube',NULL,0.3,'ml','','',NULL,'',1,'label1',43,11,NULL,'Standard'),(503,NULL,'2017-04-08 10:43:11','TestLib',185,1,1,1,'.. to garbage','Active','Test',27,'Tube',NULL,0.2,'ml','','',NULL,'',1,'label1',45,11,NULL,'Standard'),(504,NULL,'2017-04-08 11:31:00','TestLib',203,1,1,1,'.. to garbage','Active','Test',27,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',48,11,NULL,'Standard'),(505,NULL,'2017-04-11 18:03:11','TestLib',153,1,1,419,'','Active','Test',27,'Tube',NULL,1.7,'ml','','',NULL,'',1,'label1',55,11,NULL,'Standard'),(506,NULL,'2017-04-11 18:03:11','TestLib',165,1,1,420,'','Active','Test',27,'Tube',NULL,1.7,'ml','','',NULL,'',1,'label1',55,11,NULL,'Standard'),(507,NULL,'2017-04-11 18:10:25','TestLib',109,1,1,419,'','Active','Test',14,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',59,11,NULL,'Standard'),(508,NULL,'2017-04-11 18:10:25','TestLib',110,1,1,420,'','Active','Test',14,'Tube',NULL,0,'ml','','',NULL,'',1,'label1',59,11,NULL,'Standard');
/*!40000 ALTER TABLE `Plate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Plate_Attribute`
--

DROP TABLE IF EXISTS `Plate_Attribute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Plate_Attribute` (
  `FK_Plate__ID` int(11) NOT NULL DEFAULT '0',
  `FK_Attribute__ID` int(11) NOT NULL DEFAULT '0',
  `Attribute_Value` text NOT NULL,
  `Plate_Attribute_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FK_Employee__ID` int(11) DEFAULT NULL,
  `Set_DateTime` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
  PRIMARY KEY (`Plate_Attribute_ID`),
  UNIQUE KEY `FK_Attribute__ID_2` (`FK_Attribute__ID`,`FK_Plate__ID`),
  KEY `FK_Plate__ID` (`FK_Plate__ID`),
  KEY `FK_Attribute__ID` (`FK_Attribute__ID`),
  KEY `FK_Employee__ID` (`FK_Employee__ID`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Plate_Attribute`
--

LOCK TABLES `Plate_Attribute` WRITE;
/*!40000 ALTER TABLE `Plate_Attribute` DISABLE KEYS */;
INSERT INTO `Plate_Attribute` VALUES (419,66,'0113327997',8,1,'2017-03-29 20:06:47'),(420,66,'0113327996',9,1,'2017-03-29 20:06:47'),(1,27,'3',10,1,'2017-04-08 10:37:10'),(502,27,'2',11,1,'2017-04-08 10:40:47'),(503,27,'1',14,1,'2017-04-08 10:43:25'),(504,27,'2',16,1,'2017-04-08 11:31:06'),(505,27,'1',18,1,'2017-04-11 18:03:49'),(506,27,'1',19,1,'2017-04-11 18:03:49'),(419,27,'1',20,1,'2017-04-11 18:10:18'),(420,27,'1',21,1,'2017-04-11 18:10:18');
/*!40000 ALTER TABLE `Plate_Attribute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Plate_Format`
--

DROP TABLE IF EXISTS `Plate_Format`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Plate_Format`
--

LOCK TABLES `Plate_Format` WRITE;
/*!40000 ALTER TABLE `Plate_Format` DISABLE KEYS */;
INSERT INTO `Plate_Format` VALUES (1,'ACD Blood Vacuum Tube','Active',31,'A',1,'Tube',6,'ml',1,NULL,NULL,'Y'),(2,'SST Blood Vacuum Tube','Active',31,'A',1,'Tube',5,'ml',1,NULL,NULL,'Y'),(3,'EDTA Blood Vacuum Tube','Active',31,'A',1,'Tube',6,'ml',1,NULL,NULL,'Y'),(4,'Urine Cup','Active',31,'A',1,'Tube',100,'ml',1,NULL,NULL,'Y'),(5,'2ml cryovial','Active',35,'A',1,'Tube',2,'ml',1,NULL,NULL,'Y'),(6,'PST Blood Vacuum Tube','Active',31,'A',1,'Tube',6,'ml',1,NULL,NULL,'Y'),(13,'Saliva Cup','Active',36,'A',1,'Tube',100,'ml',1,NULL,NULL,'Y'),(14,'Conical Tube','Active',36,'A',1,'Tube',50,'ml',1,NULL,NULL,'Y'),(15,'EDTA (6 mL) RBC+WBC Tube','Inactive',31,'A',1,'Tube',6,'ml',1,NULL,NULL,'Y'),(16,'EDTA (6 mL) Tube','Inactive',31,'A',1,'Tube',6,'ml',1,NULL,NULL,'Y'),(17,'EDTA Plasma Tube','Inactive',31,'A',1,'Tube',3.6,'ml',1,NULL,3,'Y'),(18,'Frozen Red Top Serum Tube','Inactive',31,'A',1,'Tube',3.6,'ml',1,NULL,NULL,'Y'),(19,'EDTA (4 mL) RBC+WBC Tube','Inactive',31,'A',1,'Tube',4,'ml',1,NULL,NULL,'Y'),(20,'EDTA (4 mL) Tube','Inactive',31,'A',1,'Tube',4,'ml',1,NULL,NULL,'Y'),(22,'1ml cryovial','Active',35,'A',1,'Tube',1,'ml',1,NULL,2,'Y'),(23,'eppendorf','Active',35,'A',1,'Tube',1.8,'ml',1,NULL,NULL,'Y'),(24,'Frozen Blue Top Plasma Tube','Inactive',31,'A',1,'Tube',3.6,'ml',1,NULL,3,'Y'),(25,'Falcon Tube','Active',35,'A',1,'Tube',3.6,'ml',1,'Tube',0,'Y'),(27,'Matrix Tube','Active',38,'A',1,'Tube',0,'ml',1,'Tube',NULL,'Y');
/*!40000 ALTER TABLE `Plate_Format` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Plate_Prep`
--

DROP TABLE IF EXISTS `Plate_Prep`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Plate_Prep`
--

LOCK TABLES `Plate_Prep` WRITE;
/*!40000 ALTER TABLE `Plate_Prep` DISABLE KEYS */;
INSERT INTO `Plate_Prep` VALUES (1,1,1,19,NULL,NULL,2,NULL,NULL,NULL),(2,1,3,19,NULL,NULL,2,NULL,NULL,NULL),(3,1,5,19,NULL,NULL,2,NULL,NULL,NULL),(4,1,7,19,NULL,NULL,2,NULL,NULL,NULL),(5,1,9,19,NULL,NULL,2,NULL,NULL,NULL),(6,443,12,24,NULL,NULL,123,NULL,NULL,NULL),(7,443,13,30,NULL,NULL,123,'ul',NULL,NULL),(8,443,15,37,NULL,NULL,145,'ml',NULL,NULL),(9,446,17,39,NULL,NULL,456,'ml',NULL,NULL),(10,1,19,41,NULL,NULL,0.455,'ml',NULL,NULL),(11,448,21,42,NULL,NULL,0.666,'ml',NULL,NULL),(12,449,23,45,NULL,NULL,0.343,'ml',NULL,NULL),(13,449,25,48,NULL,NULL,0.246,'ml',NULL,NULL),(14,450,25,48,NULL,NULL,0.246,'ml',NULL,NULL),(15,1,27,52,NULL,NULL,0.268,'ml',NULL,NULL),(16,1,30,64,NULL,NULL,NULL,NULL,NULL,NULL),(17,1,31,66,NULL,NULL,NULL,NULL,NULL,NULL),(18,1,33,68,NULL,NULL,NULL,NULL,NULL,NULL),(19,1,35,70,NULL,NULL,NULL,NULL,NULL,NULL),(20,1,37,72,NULL,NULL,NULL,NULL,NULL,NULL),(21,1,39,74,NULL,NULL,NULL,NULL,NULL,NULL),(22,1,41,84,NULL,2,0.3,'ml',NULL,NULL),(23,502,42,85,NULL,NULL,NULL,NULL,NULL,NULL),(24,502,43,85,NULL,NULL,NULL,NULL,NULL,NULL),(25,1,44,86,NULL,2,0.2,'ml',NULL,NULL),(26,503,45,87,NULL,NULL,NULL,NULL,NULL,NULL),(27,1,46,90,NULL,NULL,NULL,NULL,NULL,NULL),(28,504,47,91,NULL,NULL,NULL,NULL,NULL,NULL),(29,504,48,91,NULL,NULL,NULL,NULL,NULL,NULL),(30,419,49,92,NULL,NULL,NULL,NULL,NULL,NULL),(31,420,49,92,NULL,NULL,NULL,NULL,NULL,NULL),(32,419,50,92,NULL,NULL,NULL,NULL,NULL,NULL),(33,420,50,92,NULL,NULL,NULL,NULL,NULL,NULL),(34,419,51,92,NULL,NULL,NULL,NULL,NULL,NULL),(35,420,51,92,NULL,NULL,NULL,NULL,NULL,NULL),(36,419,52,92,NULL,NULL,NULL,NULL,NULL,NULL),(37,420,52,92,NULL,NULL,NULL,NULL,NULL,NULL),(38,419,53,117,NULL,4,0.3,'ml',NULL,NULL),(39,420,53,117,NULL,4,0.3,'ml',NULL,NULL),(40,505,54,118,NULL,NULL,NULL,NULL,NULL,NULL),(41,506,54,118,NULL,NULL,NULL,NULL,NULL,NULL),(42,505,55,118,NULL,NULL,NULL,NULL,NULL,NULL),(43,506,55,118,NULL,NULL,NULL,NULL,NULL,NULL),(44,419,56,119,NULL,5,NULL,NULL,NULL,NULL),(45,420,56,119,NULL,5,NULL,NULL,NULL,NULL),(46,419,57,119,NULL,NULL,NULL,NULL,NULL,NULL),(47,420,57,119,NULL,NULL,NULL,NULL,NULL,NULL),(48,419,58,119,NULL,NULL,NULL,NULL,NULL,NULL),(49,420,58,119,NULL,NULL,NULL,NULL,NULL,NULL),(50,507,59,120,NULL,NULL,NULL,NULL,NULL,NULL),(51,508,59,120,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `Plate_Prep` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Plate_Set`
--

DROP TABLE IF EXISTS `Plate_Set`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Plate_Set` (
  `Plate_Set_ID` int(4) NOT NULL AUTO_INCREMENT,
  `FK_Plate__ID` int(11) DEFAULT NULL,
  `Plate_Set_Number` int(11) DEFAULT NULL,
  `FKParent_Plate_Set__Number` int(11) DEFAULT NULL,
  PRIMARY KEY (`Plate_Set_ID`),
  KEY `num` (`Plate_Set_Number`),
  KEY `FK_Plate__ID` (`FK_Plate__ID`),
  KEY `parent_set` (`FKParent_Plate_Set__Number`)
) ENGINE=InnoDB AUTO_INCREMENT=164 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Plate_Set`
--

LOCK TABLES `Plate_Set` WRITE;
/*!40000 ALTER TABLE `Plate_Set` DISABLE KEYS */;
INSERT INTO `Plate_Set` VALUES (1,1,1,NULL),(2,1,2,NULL),(3,1,3,NULL),(4,1,4,NULL),(5,1,5,NULL),(6,1,6,NULL),(7,1,7,NULL),(8,1,8,NULL),(9,1,9,NULL),(10,1,10,NULL),(11,1,11,NULL),(12,1,12,NULL),(13,1,13,NULL),(14,1,14,NULL),(15,1,15,NULL),(16,1,16,NULL),(17,1,17,NULL),(18,1,18,NULL),(19,1,19,NULL),(20,443,20,NULL),(21,1,21,NULL),(22,443,22,NULL),(23,443,23,NULL),(24,443,24,NULL),(25,444,25,NULL),(26,443,26,NULL),(27,443,27,NULL),(28,443,28,NULL),(29,443,29,NULL),(30,443,30,NULL),(31,445,31,NULL),(32,443,32,NULL),(33,443,33,NULL),(34,443,34,NULL),(35,443,35,NULL),(36,443,36,NULL),(37,443,37,NULL),(38,446,38,NULL),(39,446,39,NULL),(40,447,40,NULL),(41,1,41,NULL),(42,448,42,NULL),(43,449,43,NULL),(44,449,44,NULL),(45,449,45,NULL),(46,450,46,NULL),(47,449,47,NULL),(48,450,47,NULL),(49,449,48,NULL),(50,450,48,NULL),(51,451,49,NULL),(52,452,49,NULL),(53,449,50,NULL),(54,450,50,NULL),(55,1,51,NULL),(56,1,52,NULL),(57,453,53,NULL),(58,1,54,NULL),(59,1,55,NULL),(60,1,56,NULL),(61,1,57,NULL),(62,1,58,NULL),(63,1,59,NULL),(64,1,60,NULL),(65,1,61,NULL),(66,1,62,NULL),(67,1,63,NULL),(68,1,64,NULL),(69,454,65,NULL),(70,1,66,NULL),(71,455,67,NULL),(72,1,68,NULL),(73,456,69,NULL),(74,1,70,NULL),(75,457,71,NULL),(76,1,72,NULL),(77,458,73,NULL),(78,1,74,NULL),(79,459,75,NULL),(80,419,76,NULL),(81,420,76,NULL),(82,419,77,NULL),(83,420,77,NULL),(84,419,78,NULL),(85,420,78,NULL),(86,419,79,NULL),(87,420,79,NULL),(88,419,80,NULL),(89,420,80,NULL),(90,419,81,NULL),(91,420,81,NULL),(92,419,82,NULL),(93,420,82,NULL),(94,419,83,NULL),(95,420,83,NULL),(96,1,84,NULL),(97,502,85,NULL),(98,1,86,NULL),(99,503,87,NULL),(100,1,88,NULL),(101,1,89,NULL),(102,1,90,NULL),(103,504,91,NULL),(104,419,92,NULL),(105,420,92,NULL),(106,419,93,NULL),(107,420,93,NULL),(108,419,94,NULL),(109,420,94,NULL),(110,419,95,NULL),(111,420,95,NULL),(112,419,96,NULL),(113,420,96,NULL),(114,419,97,NULL),(115,420,97,NULL),(116,419,98,NULL),(117,420,98,NULL),(118,419,99,NULL),(119,420,99,NULL),(120,419,100,NULL),(121,420,100,NULL),(122,419,101,NULL),(123,420,101,NULL),(124,419,102,NULL),(125,420,102,NULL),(126,419,103,NULL),(127,420,103,NULL),(128,419,104,NULL),(129,420,104,NULL),(130,419,105,NULL),(131,420,105,NULL),(132,419,106,NULL),(133,420,106,NULL),(134,419,107,NULL),(135,420,107,NULL),(136,419,108,NULL),(137,420,108,NULL),(138,419,109,NULL),(139,420,109,NULL),(140,419,110,NULL),(141,420,110,NULL),(142,419,111,NULL),(143,420,111,NULL),(144,419,112,NULL),(145,420,112,NULL),(146,419,113,NULL),(147,420,113,NULL),(148,419,114,NULL),(149,420,114,NULL),(150,419,115,NULL),(151,420,115,NULL),(152,419,116,NULL),(153,420,116,NULL),(154,419,117,NULL),(155,420,117,NULL),(156,505,118,NULL),(157,506,118,NULL),(158,419,119,NULL),(159,420,119,NULL),(160,507,120,NULL),(161,508,120,NULL),(162,419,121,NULL),(163,420,121,NULL);
/*!40000 ALTER TABLE `Plate_Set` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Prep`
--

DROP TABLE IF EXISTS `Prep`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Prep`
--

LOCK TABLES `Prep` WRITE;
/*!40000 ALTER TABLE `Prep` DISABLE KEYS */;
INSERT INTO `Prep` VALUES ('Transfer DNA to Matrix Tube',1,'2017-01-24 08:54:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,1,NULL,NULL),('Completed Protocol',1,'2017-01-24 08:55:28',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,2,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-01-24 08:54:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,3,NULL,NULL),('Completed Protocol',1,'2017-01-24 08:57:28',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,4,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-01-24 08:54:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,5,NULL,NULL),('Completed Protocol',1,'2017-01-24 09:47:28',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,6,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-01-24 08:54:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,7,NULL,NULL),('Completed Protocol',1,'2017-01-24 09:49:28',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,8,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-01-24 08:54:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,9,NULL,NULL),('Completed Protocol',1,'2017-01-24 09:52:33',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,10,NULL,NULL),('Completed Protocol',1,'2017-01-24 17:47:54',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,11,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-01-24 17:46:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,12,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-01-24 18:58:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,13,NULL,NULL),('Completed Protocol',1,'2017-01-24 18:59:36',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,14,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-01-24 19:08:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,15,NULL,NULL),('Completed Protocol',1,'2017-01-24 19:08:29',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,16,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-01-24 19:10:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,17,NULL,NULL),('Completed Protocol',1,'2017-01-24 19:10:47',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,18,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-01-24 19:14:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,19,NULL,NULL),('Completed Protocol',1,'2017-01-24 19:15:28',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,20,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-01-24 19:18:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,21,NULL,NULL),('Completed Protocol',1,'2017-01-24 19:20:26',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,22,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-01-24 19:22:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,23,NULL,NULL),('Completed Protocol',1,'2017-01-24 19:23:06',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,24,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-01-25 09:51:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,25,NULL,NULL),('Completed Protocol',1,'2017-01-25 09:51:54',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,26,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-02-05 13:42:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,27,NULL,NULL),('Completed Protocol',1,'2017-02-05 13:42:36',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,28,NULL,NULL),('Completed Protocol',1,'2017-03-29 15:44:11',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,29,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-03-29 15:42:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,30,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-03-29 15:48:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,31,NULL,NULL),('Completed Protocol',1,'2017-03-29 15:49:34',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,32,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-03-29 15:52:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,33,NULL,NULL),('Completed Protocol',1,'2017-03-29 15:52:51',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,34,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-03-29 16:23:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,35,NULL,NULL),('Completed Protocol',1,'2017-03-29 16:24:04',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,36,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-03-29 16:27:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,37,NULL,NULL),('Completed Protocol',1,'2017-03-29 16:28:06',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,38,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-03-29 16:42:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,39,NULL,NULL),('Completed Protocol',1,'2017-03-29 16:42:11',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,40,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-04-08 10:34:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,41,NULL,NULL),('Thaw DNA',1,'2017-04-08 10:34:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,42,NULL,NULL),('Transfer to Conical Tube',1,'2017-04-08 10:34:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,43,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-04-08 10:42:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,44,NULL,NULL),('Thaw DNA',1,'2017-04-08 10:42:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,45,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-04-08 11:30:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,46,NULL,NULL),('Thaw DNA',1,'2017-04-08 11:30:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,47,NULL,NULL),('Transfer to Conical Tube',1,'2017-04-08 11:30:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,48,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-04-11 16:11:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Skipped',24,49,NULL,NULL),('Thaw DNA',1,'2017-04-11 16:11:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Skipped',24,50,NULL,NULL),('Transfer to Conical Tube',1,'2017-04-11 16:11:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Skipped',24,51,NULL,NULL),('Extract DNA',1,'2017-04-11 16:11:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Skipped',24,52,NULL,NULL),('Transfer DNA to Matrix Tube',1,'2017-04-11 18:00:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,53,NULL,NULL),('Thaw DNA',1,'2017-04-11 18:00:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,54,NULL,NULL),('Transfer to Conical Tube',1,'2017-04-11 18:00:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,55,NULL,NULL),('Track Extraction Kit',1,'2017-04-11 18:10:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,56,NULL,NULL),('Update Thaw & Extraction information',1,'2017-04-11 18:10:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,57,NULL,NULL),('Transfer to conical tube',1,'2017-04-11 18:10:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,58,NULL,NULL),('Extract DNA',1,'2017-04-11 18:10:00',NULL,NULL,NULL,'1000-01-01 00:00:00','Completed',24,59,NULL,NULL);
/*!40000 ALTER TABLE `Prep` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Prep_Attribute`
--

DROP TABLE IF EXISTS `Prep_Attribute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Prep_Attribute` (
  `Prep_Attribute_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FK_Prep__ID` int(11) NOT NULL,
  `FK_Attribute__ID` int(11) NOT NULL,
  `Attribute_Value` varchar(255) DEFAULT NULL,
  `FK_Employee__ID` int(11) NOT NULL,
  `Set_DateTime` datetime DEFAULT NULL,
  PRIMARY KEY (`Prep_Attribute_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Prep_Attribute`
--

LOCK TABLES `Prep_Attribute` WRITE;
/*!40000 ALTER TABLE `Prep_Attribute` DISABLE KEYS */;
INSERT INTO `Prep_Attribute` VALUES (1,9,50,'1234',1,'2017-01-24 09:52:33'),(2,25,50,'xyz',1,'2017-01-25 09:51:54'),(3,30,50,'abc',1,'2017-03-29 15:44:11'),(4,31,50,'xyz',1,'2017-03-29 15:49:34'),(5,33,50,'adfs',1,'2017-03-29 15:52:51'),(6,35,50,'zafds',1,'2017-03-29 16:24:04'),(7,41,50,'abc',1,'2017-04-08 10:37:10'),(8,42,63,'32',1,'2017-04-08 10:40:47'),(9,43,5,'logit',1,'2017-04-08 10:42:00'),(10,44,50,'abc',1,'2017-04-08 10:43:11'),(11,45,63,'44',1,'2017-04-08 10:43:25'),(12,47,63,'55',1,'2017-04-08 11:31:06'),(13,48,5,'logit2',1,'2017-04-08 11:31:14'),(14,53,50,'qln',1,'2017-04-11 18:03:11'),(15,54,63,'44',1,'2017-04-11 18:03:49'),(16,55,5,'dsn',1,'2017-04-11 18:04:33'),(17,57,63,'22',1,'2017-04-11 18:10:18');
/*!40000 ALTER TABLE `Prep_Attribute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Printer_Group`
--

DROP TABLE IF EXISTS `Printer_Group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Printer_Group` (
  `Printer_Group_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Printer_Group_Name` varchar(40) NOT NULL DEFAULT '',
  `FK_Site__ID` int(11) NOT NULL DEFAULT '0',
  `Printer_Group_Status` enum('Active','Inactive') DEFAULT 'Active',
  PRIMARY KEY (`Printer_Group_ID`),
  KEY `Site` (`FK_Site__ID`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Printer_Group`
--

LOCK TABLES `Printer_Group` WRITE;
/*!40000 ALTER TABLE `Printer_Group` DISABLE KEYS */;
INSERT INTO `Printer_Group` VALUES (2,'Lab Printer',0,'Active'),(3,'Printing Disabled',0,'Active');
/*!40000 ALTER TABLE `Printer_Group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Rack`
--

DROP TABLE IF EXISTS `Rack`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=266 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Rack`
--

LOCK TABLES `Rack` WRITE;
/*!40000 ALTER TABLE `Rack` DISABLE KEYS */;
INSERT INTO `Rack` VALUES (1,NULL,'Shelf','Bench1','N','Bench1',NULL,NULL,'N'),(2,NULL,'Rack','R1','Y','Bench1 R1',1,NULL,'N'),(3,NULL,'Box','B1','Y','Bench1 R1 B1',2,'9x9','N'),(4,NULL,'Slot','a1','N','Bench1 R1 B1 a1',3,'1','N'),(5,NULL,'Slot','a2','N','Bench1 R1 B1 a2',3,'1','N'),(6,NULL,'Slot','a3','N','Bench1 R1 B1 a3',3,'1','N'),(7,NULL,'Slot','a4','N','Bench1 R1 B1 a4',3,'1','N'),(8,NULL,'Slot','a5','N','Bench1 R1 B1 a5',3,'1','N'),(9,NULL,'Slot','a6','N','Bench1 R1 B1 a6',3,'1','N'),(10,NULL,'Slot','a7','N','Bench1 R1 B1 a7',3,'1','N'),(11,NULL,'Slot','a8','N','Bench1 R1 B1 a8',3,'1','N'),(12,NULL,'Slot','a9','N','Bench1 R1 B1 a9',3,'1','N'),(13,NULL,'Slot','b1','N','Bench1 R1 B1 b1',3,'1','N'),(14,NULL,'Slot','b2','N','Bench1 R1 B1 b2',3,'1','N'),(15,NULL,'Slot','b3','N','Bench1 R1 B1 b3',3,'1','N'),(16,NULL,'Slot','b4','N','Bench1 R1 B1 b4',3,'1','N'),(17,NULL,'Slot','b5','N','Bench1 R1 B1 b5',3,'1','N'),(18,NULL,'Slot','b6','N','Bench1 R1 B1 b6',3,'1','N'),(19,NULL,'Slot','b7','N','Bench1 R1 B1 b7',3,'1','N'),(20,NULL,'Slot','b8','N','Bench1 R1 B1 b8',3,'1','N'),(21,NULL,'Slot','b9','N','Bench1 R1 B1 b9',3,'1','N'),(22,NULL,'Slot','c1','N','Bench1 R1 B1 c1',3,'1','N'),(23,NULL,'Slot','c2','N','Bench1 R1 B1 c2',3,'1','N'),(24,NULL,'Slot','c3','N','Bench1 R1 B1 c3',3,'1','N'),(25,NULL,'Slot','c4','N','Bench1 R1 B1 c4',3,'1','N'),(26,NULL,'Slot','c5','N','Bench1 R1 B1 c5',3,'1','N'),(27,NULL,'Slot','c6','N','Bench1 R1 B1 c6',3,'1','N'),(28,NULL,'Slot','c7','N','Bench1 R1 B1 c7',3,'1','N'),(29,NULL,'Slot','c8','N','Bench1 R1 B1 c8',3,'1','N'),(30,NULL,'Slot','c9','N','Bench1 R1 B1 c9',3,'1','N'),(31,NULL,'Slot','d1','N','Bench1 R1 B1 d1',3,'1','N'),(32,NULL,'Slot','d2','N','Bench1 R1 B1 d2',3,'1','N'),(33,NULL,'Slot','d3','N','Bench1 R1 B1 d3',3,'1','N'),(34,NULL,'Slot','d4','N','Bench1 R1 B1 d4',3,'1','N'),(35,NULL,'Slot','d5','N','Bench1 R1 B1 d5',3,'1','N'),(36,NULL,'Slot','d6','N','Bench1 R1 B1 d6',3,'1','N'),(37,NULL,'Slot','d7','N','Bench1 R1 B1 d7',3,'1','N'),(38,NULL,'Slot','d8','N','Bench1 R1 B1 d8',3,'1','N'),(39,NULL,'Slot','d9','N','Bench1 R1 B1 d9',3,'1','N'),(40,NULL,'Slot','e1','N','Bench1 R1 B1 e1',3,'1','N'),(41,NULL,'Slot','e2','N','Bench1 R1 B1 e2',3,'1','N'),(42,NULL,'Slot','e3','N','Bench1 R1 B1 e3',3,'1','N'),(43,NULL,'Slot','e4','N','Bench1 R1 B1 e4',3,'1','N'),(44,NULL,'Slot','e5','N','Bench1 R1 B1 e5',3,'1','N'),(45,NULL,'Slot','e6','N','Bench1 R1 B1 e6',3,'1','N'),(46,NULL,'Slot','e7','N','Bench1 R1 B1 e7',3,'1','N'),(47,NULL,'Slot','e8','N','Bench1 R1 B1 e8',3,'1','N'),(48,NULL,'Slot','e9','N','Bench1 R1 B1 e9',3,'1','N'),(49,NULL,'Slot','f1','N','Bench1 R1 B1 f1',3,'1','N'),(50,NULL,'Slot','f2','N','Bench1 R1 B1 f2',3,'1','N'),(51,NULL,'Slot','f3','N','Bench1 R1 B1 f3',3,'1','N'),(52,NULL,'Slot','f4','N','Bench1 R1 B1 f4',3,'1','N'),(53,NULL,'Slot','f5','N','Bench1 R1 B1 f5',3,'1','N'),(54,NULL,'Slot','f6','N','Bench1 R1 B1 f6',3,'1','N'),(55,NULL,'Slot','f7','N','Bench1 R1 B1 f7',3,'1','N'),(56,NULL,'Slot','f8','N','Bench1 R1 B1 f8',3,'1','N'),(57,NULL,'Slot','f9','N','Bench1 R1 B1 f9',3,'1','N'),(58,NULL,'Slot','g1','N','Bench1 R1 B1 g1',3,'1','N'),(59,NULL,'Slot','g2','N','Bench1 R1 B1 g2',3,'1','N'),(60,NULL,'Slot','g3','N','Bench1 R1 B1 g3',3,'1','N'),(61,NULL,'Slot','g4','N','Bench1 R1 B1 g4',3,'1','N'),(62,NULL,'Slot','g5','N','Bench1 R1 B1 g5',3,'1','N'),(63,NULL,'Slot','g6','N','Bench1 R1 B1 g6',3,'1','N'),(64,NULL,'Slot','g7','N','Bench1 R1 B1 g7',3,'1','N'),(65,NULL,'Slot','g8','N','Bench1 R1 B1 g8',3,'1','N'),(66,NULL,'Slot','g9','N','Bench1 R1 B1 g9',3,'1','N'),(67,NULL,'Slot','h1','N','Bench1 R1 B1 h1',3,'1','N'),(68,NULL,'Slot','h2','N','Bench1 R1 B1 h2',3,'1','N'),(69,NULL,'Slot','h3','N','Bench1 R1 B1 h3',3,'1','N'),(70,NULL,'Slot','h4','N','Bench1 R1 B1 h4',3,'1','N'),(71,NULL,'Slot','h5','N','Bench1 R1 B1 h5',3,'1','N'),(72,NULL,'Slot','h6','N','Bench1 R1 B1 h6',3,'1','N'),(73,NULL,'Slot','h7','N','Bench1 R1 B1 h7',3,'1','N'),(74,NULL,'Slot','h8','N','Bench1 R1 B1 h8',3,'1','N'),(75,NULL,'Slot','h9','N','Bench1 R1 B1 h9',3,'1','N'),(76,NULL,'Slot','i1','N','Bench1 R1 B1 i1',3,'1','N'),(77,NULL,'Slot','i2','N','Bench1 R1 B1 i2',3,'1','N'),(78,NULL,'Slot','i3','N','Bench1 R1 B1 i3',3,'1','N'),(79,NULL,'Slot','i4','N','Bench1 R1 B1 i4',3,'1','N'),(80,NULL,'Slot','i5','N','Bench1 R1 B1 i5',3,'1','N'),(81,NULL,'Slot','i6','N','Bench1 R1 B1 i6',3,'1','N'),(82,NULL,'Slot','i7','N','Bench1 R1 B1 i7',3,'1','N'),(83,NULL,'Slot','i8','N','Bench1 R1 B1 i8',3,'1','N'),(84,NULL,'Slot','i9','N','Bench1 R1 B1 i9',3,'1','N'),(85,NULL,'Box','B2','Y','Bench1 R1 B2',2,'8x12','N'),(86,NULL,'Box','B3','Y','Bench1 R1 B3',2,'8x12','N'),(87,NULL,'Slot','a1','N','Bench1 R1 B3 a1',86,'1','N'),(88,NULL,'Slot','a2','N','Bench1 R1 B3 a2',86,'1','N'),(89,NULL,'Slot','a3','N','Bench1 R1 B3 a3',86,'1','N'),(90,NULL,'Slot','a4','N','Bench1 R1 B3 a4',86,'1','N'),(91,NULL,'Slot','a5','N','Bench1 R1 B3 a5',86,'1','N'),(92,NULL,'Slot','a6','N','Bench1 R1 B3 a6',86,'1','N'),(93,NULL,'Slot','a7','N','Bench1 R1 B3 a7',86,'1','N'),(94,NULL,'Slot','a8','N','Bench1 R1 B3 a8',86,'1','N'),(95,NULL,'Slot','a9','N','Bench1 R1 B3 a9',86,'1','N'),(96,NULL,'Slot','a10','N','Bench1 R1 B3 a10',86,'1','N'),(97,NULL,'Slot','a11','N','Bench1 R1 B3 a11',86,'1','N'),(98,NULL,'Slot','a12','N','Bench1 R1 B3 a12',86,'1','N'),(99,NULL,'Slot','b1','N','Bench1 R1 B3 b1',86,'1','N'),(100,NULL,'Slot','b2','N','Bench1 R1 B3 b2',86,'1','N'),(101,NULL,'Slot','b3','N','Bench1 R1 B3 b3',86,'1','N'),(102,NULL,'Slot','b4','N','Bench1 R1 B3 b4',86,'1','N'),(103,NULL,'Slot','b5','N','Bench1 R1 B3 b5',86,'1','N'),(104,NULL,'Slot','b6','N','Bench1 R1 B3 b6',86,'1','N'),(105,NULL,'Slot','b7','N','Bench1 R1 B3 b7',86,'1','N'),(106,NULL,'Slot','b8','N','Bench1 R1 B3 b8',86,'1','N'),(107,NULL,'Slot','b9','N','Bench1 R1 B3 b9',86,'1','N'),(108,NULL,'Slot','b10','N','Bench1 R1 B3 b10',86,'1','N'),(109,NULL,'Slot','b11','N','Bench1 R1 B3 b11',86,'1','N'),(110,NULL,'Slot','b12','N','Bench1 R1 B3 b12',86,'1','N'),(111,NULL,'Slot','c1','N','Bench1 R1 B3 c1',86,'1','N'),(112,NULL,'Slot','c2','N','Bench1 R1 B3 c2',86,'1','N'),(113,NULL,'Slot','c3','N','Bench1 R1 B3 c3',86,'1','N'),(114,NULL,'Slot','c4','N','Bench1 R1 B3 c4',86,'1','N'),(115,NULL,'Slot','c5','N','Bench1 R1 B3 c5',86,'1','N'),(116,NULL,'Slot','c6','N','Bench1 R1 B3 c6',86,'1','N'),(117,NULL,'Slot','c7','N','Bench1 R1 B3 c7',86,'1','N'),(118,NULL,'Slot','c8','N','Bench1 R1 B3 c8',86,'1','N'),(119,NULL,'Slot','c9','N','Bench1 R1 B3 c9',86,'1','N'),(120,NULL,'Slot','c10','N','Bench1 R1 B3 c10',86,'1','N'),(121,NULL,'Slot','c11','N','Bench1 R1 B3 c11',86,'1','N'),(122,NULL,'Slot','c12','N','Bench1 R1 B3 c12',86,'1','N'),(123,NULL,'Slot','d1','N','Bench1 R1 B3 d1',86,'1','N'),(124,NULL,'Slot','d2','N','Bench1 R1 B3 d2',86,'1','N'),(125,NULL,'Slot','d3','N','Bench1 R1 B3 d3',86,'1','N'),(126,NULL,'Slot','d4','N','Bench1 R1 B3 d4',86,'1','N'),(127,NULL,'Slot','d5','N','Bench1 R1 B3 d5',86,'1','N'),(128,NULL,'Slot','d6','N','Bench1 R1 B3 d6',86,'1','N'),(129,NULL,'Slot','d7','N','Bench1 R1 B3 d7',86,'1','N'),(130,NULL,'Slot','d8','N','Bench1 R1 B3 d8',86,'1','N'),(131,NULL,'Slot','d9','N','Bench1 R1 B3 d9',86,'1','N'),(132,NULL,'Slot','d10','N','Bench1 R1 B3 d10',86,'1','N'),(133,NULL,'Slot','d11','N','Bench1 R1 B3 d11',86,'1','N'),(134,NULL,'Slot','d12','N','Bench1 R1 B3 d12',86,'1','N'),(135,NULL,'Slot','e1','N','Bench1 R1 B3 e1',86,'1','N'),(136,NULL,'Slot','e2','N','Bench1 R1 B3 e2',86,'1','N'),(137,NULL,'Slot','e3','N','Bench1 R1 B3 e3',86,'1','N'),(138,NULL,'Slot','e4','N','Bench1 R1 B3 e4',86,'1','N'),(139,NULL,'Slot','e5','N','Bench1 R1 B3 e5',86,'1','N'),(140,NULL,'Slot','e6','N','Bench1 R1 B3 e6',86,'1','N'),(141,NULL,'Slot','e7','N','Bench1 R1 B3 e7',86,'1','N'),(142,NULL,'Slot','e8','N','Bench1 R1 B3 e8',86,'1','N'),(143,NULL,'Slot','e9','N','Bench1 R1 B3 e9',86,'1','N'),(144,NULL,'Slot','e10','N','Bench1 R1 B3 e10',86,'1','N'),(145,NULL,'Slot','e11','N','Bench1 R1 B3 e11',86,'1','N'),(146,NULL,'Slot','e12','N','Bench1 R1 B3 e12',86,'1','N'),(147,NULL,'Slot','f1','N','Bench1 R1 B3 f1',86,'1','N'),(148,NULL,'Slot','f2','N','Bench1 R1 B3 f2',86,'1','N'),(149,NULL,'Slot','f3','N','Bench1 R1 B3 f3',86,'1','N'),(150,NULL,'Slot','f4','N','Bench1 R1 B3 f4',86,'1','N'),(151,NULL,'Slot','f5','N','Bench1 R1 B3 f5',86,'1','N'),(152,NULL,'Slot','f6','N','Bench1 R1 B3 f6',86,'1','N'),(153,NULL,'Slot','f7','N','Bench1 R1 B3 f7',86,'1','N'),(154,NULL,'Slot','f8','N','Bench1 R1 B3 f8',86,'1','N'),(155,NULL,'Slot','f9','N','Bench1 R1 B3 f9',86,'1','N'),(156,NULL,'Slot','f10','N','Bench1 R1 B3 f10',86,'1','N'),(157,NULL,'Slot','f11','N','Bench1 R1 B3 f11',86,'1','N'),(158,NULL,'Slot','f12','N','Bench1 R1 B3 f12',86,'1','N'),(159,NULL,'Slot','g1','N','Bench1 R1 B3 g1',86,'1','N'),(160,NULL,'Slot','g2','N','Bench1 R1 B3 g2',86,'1','N'),(161,NULL,'Slot','g3','N','Bench1 R1 B3 g3',86,'1','N'),(162,NULL,'Slot','g4','N','Bench1 R1 B3 g4',86,'1','N'),(163,NULL,'Slot','g5','N','Bench1 R1 B3 g5',86,'1','N'),(164,NULL,'Slot','g6','N','Bench1 R1 B3 g6',86,'1','N'),(165,NULL,'Slot','g7','N','Bench1 R1 B3 g7',86,'1','N'),(166,NULL,'Slot','g8','N','Bench1 R1 B3 g8',86,'1','N'),(167,NULL,'Slot','g9','N','Bench1 R1 B3 g9',86,'1','N'),(168,NULL,'Slot','g10','N','Bench1 R1 B3 g10',86,'1','N'),(169,NULL,'Slot','g11','N','Bench1 R1 B3 g11',86,'1','N'),(170,NULL,'Slot','g12','N','Bench1 R1 B3 g12',86,'1','N'),(171,NULL,'Slot','h1','N','Bench1 R1 B3 h1',86,'1','N'),(172,NULL,'Slot','h2','N','Bench1 R1 B3 h2',86,'1','N'),(173,NULL,'Slot','h3','N','Bench1 R1 B3 h3',86,'1','N'),(174,NULL,'Slot','h4','N','Bench1 R1 B3 h4',86,'1','N'),(175,NULL,'Slot','h5','N','Bench1 R1 B3 h5',86,'1','N'),(176,NULL,'Slot','h6','N','Bench1 R1 B3 h6',86,'1','N'),(177,NULL,'Slot','h7','N','Bench1 R1 B3 h7',86,'1','N'),(178,NULL,'Slot','h8','N','Bench1 R1 B3 h8',86,'1','N'),(179,NULL,'Slot','h9','N','Bench1 R1 B3 h9',86,'1','N'),(180,NULL,'Slot','h10','N','Bench1 R1 B3 h10',86,'1','N'),(181,NULL,'Slot','h11','N','Bench1 R1 B3 h11',86,'1','N'),(182,NULL,'Slot','h12','N','Bench1 R1 B3 h12',86,'1','N'),(183,NULL,NULL,'Garbage','Y','Garbage',NULL,NULL,'N'),(184,NULL,'Box','B4','Y','Bench1 R1 B4',2,'9x9','N'),(185,NULL,'Slot','a1','N','Bench1 R1 B4 a1',184,'1','N'),(186,NULL,'Slot','a2','N','Bench1 R1 B4 a2',184,'1','N'),(187,NULL,'Slot','a3','N','Bench1 R1 B4 a3',184,'1','N'),(188,NULL,'Slot','a4','N','Bench1 R1 B4 a4',184,'1','N'),(189,NULL,'Slot','a5','N','Bench1 R1 B4 a5',184,'1','N'),(190,NULL,'Slot','a6','N','Bench1 R1 B4 a6',184,'1','N'),(191,NULL,'Slot','a7','N','Bench1 R1 B4 a7',184,'1','N'),(192,NULL,'Slot','a8','N','Bench1 R1 B4 a8',184,'1','N'),(193,NULL,'Slot','a9','N','Bench1 R1 B4 a9',184,'1','N'),(194,NULL,'Slot','b1','N','Bench1 R1 B4 b1',184,'1','N'),(195,NULL,'Slot','b2','N','Bench1 R1 B4 b2',184,'1','N'),(196,NULL,'Slot','b3','N','Bench1 R1 B4 b3',184,'1','N'),(197,NULL,'Slot','b4','N','Bench1 R1 B4 b4',184,'1','N'),(198,NULL,'Slot','b5','N','Bench1 R1 B4 b5',184,'1','N'),(199,NULL,'Slot','b6','N','Bench1 R1 B4 b6',184,'1','N'),(200,NULL,'Slot','b7','N','Bench1 R1 B4 b7',184,'1','N'),(201,NULL,'Slot','b8','N','Bench1 R1 B4 b8',184,'1','N'),(202,NULL,'Slot','b9','N','Bench1 R1 B4 b9',184,'1','N'),(203,NULL,'Slot','c1','N','Bench1 R1 B4 c1',184,'1','N'),(204,NULL,'Slot','c2','N','Bench1 R1 B4 c2',184,'1','N'),(205,NULL,'Slot','c3','N','Bench1 R1 B4 c3',184,'1','N'),(206,NULL,'Slot','c4','N','Bench1 R1 B4 c4',184,'1','N'),(207,NULL,'Slot','c5','N','Bench1 R1 B4 c5',184,'1','N'),(208,NULL,'Slot','c6','N','Bench1 R1 B4 c6',184,'1','N'),(209,NULL,'Slot','c7','N','Bench1 R1 B4 c7',184,'1','N'),(210,NULL,'Slot','c8','N','Bench1 R1 B4 c8',184,'1','N'),(211,NULL,'Slot','c9','N','Bench1 R1 B4 c9',184,'1','N'),(212,NULL,'Slot','d1','N','Bench1 R1 B4 d1',184,'1','N'),(213,NULL,'Slot','d2','N','Bench1 R1 B4 d2',184,'1','N'),(214,NULL,'Slot','d3','N','Bench1 R1 B4 d3',184,'1','N'),(215,NULL,'Slot','d4','N','Bench1 R1 B4 d4',184,'1','N'),(216,NULL,'Slot','d5','N','Bench1 R1 B4 d5',184,'1','N'),(217,NULL,'Slot','d6','N','Bench1 R1 B4 d6',184,'1','N'),(218,NULL,'Slot','d7','N','Bench1 R1 B4 d7',184,'1','N'),(219,NULL,'Slot','d8','N','Bench1 R1 B4 d8',184,'1','N'),(220,NULL,'Slot','d9','N','Bench1 R1 B4 d9',184,'1','N'),(221,NULL,'Slot','e1','N','Bench1 R1 B4 e1',184,'1','N'),(222,NULL,'Slot','e2','N','Bench1 R1 B4 e2',184,'1','N'),(223,NULL,'Slot','e3','N','Bench1 R1 B4 e3',184,'1','N'),(224,NULL,'Slot','e4','N','Bench1 R1 B4 e4',184,'1','N'),(225,NULL,'Slot','e5','N','Bench1 R1 B4 e5',184,'1','N'),(226,NULL,'Slot','e6','N','Bench1 R1 B4 e6',184,'1','N'),(227,NULL,'Slot','e7','N','Bench1 R1 B4 e7',184,'1','N'),(228,NULL,'Slot','e8','N','Bench1 R1 B4 e8',184,'1','N'),(229,NULL,'Slot','e9','N','Bench1 R1 B4 e9',184,'1','N'),(230,NULL,'Slot','f1','N','Bench1 R1 B4 f1',184,'1','N'),(231,NULL,'Slot','f2','N','Bench1 R1 B4 f2',184,'1','N'),(232,NULL,'Slot','f3','N','Bench1 R1 B4 f3',184,'1','N'),(233,NULL,'Slot','f4','N','Bench1 R1 B4 f4',184,'1','N'),(234,NULL,'Slot','f5','N','Bench1 R1 B4 f5',184,'1','N'),(235,NULL,'Slot','f6','N','Bench1 R1 B4 f6',184,'1','N'),(236,NULL,'Slot','f7','N','Bench1 R1 B4 f7',184,'1','N'),(237,NULL,'Slot','f8','N','Bench1 R1 B4 f8',184,'1','N'),(238,NULL,'Slot','f9','N','Bench1 R1 B4 f9',184,'1','N'),(239,NULL,'Slot','g1','N','Bench1 R1 B4 g1',184,'1','N'),(240,NULL,'Slot','g2','N','Bench1 R1 B4 g2',184,'1','N'),(241,NULL,'Slot','g3','N','Bench1 R1 B4 g3',184,'1','N'),(242,NULL,'Slot','g4','N','Bench1 R1 B4 g4',184,'1','N'),(243,NULL,'Slot','g5','N','Bench1 R1 B4 g5',184,'1','N'),(244,NULL,'Slot','g6','N','Bench1 R1 B4 g6',184,'1','N'),(245,NULL,'Slot','g7','N','Bench1 R1 B4 g7',184,'1','N'),(246,NULL,'Slot','g8','N','Bench1 R1 B4 g8',184,'1','N'),(247,NULL,'Slot','g9','N','Bench1 R1 B4 g9',184,'1','N'),(248,NULL,'Slot','h1','N','Bench1 R1 B4 h1',184,'1','N'),(249,NULL,'Slot','h2','N','Bench1 R1 B4 h2',184,'1','N'),(250,NULL,'Slot','h3','N','Bench1 R1 B4 h3',184,'1','N'),(251,NULL,'Slot','h4','N','Bench1 R1 B4 h4',184,'1','N'),(252,NULL,'Slot','h5','N','Bench1 R1 B4 h5',184,'1','N'),(253,NULL,'Slot','h6','N','Bench1 R1 B4 h6',184,'1','N'),(254,NULL,'Slot','h7','N','Bench1 R1 B4 h7',184,'1','N'),(255,NULL,'Slot','h8','N','Bench1 R1 B4 h8',184,'1','N'),(256,NULL,'Slot','h9','N','Bench1 R1 B4 h9',184,'1','N'),(257,NULL,'Slot','i1','N','Bench1 R1 B4 i1',184,'1','N'),(258,NULL,'Slot','i2','N','Bench1 R1 B4 i2',184,'1','N'),(259,NULL,'Slot','i3','N','Bench1 R1 B4 i3',184,'1','N'),(260,NULL,'Slot','i4','N','Bench1 R1 B4 i4',184,'1','N'),(261,NULL,'Slot','i5','N','Bench1 R1 B4 i5',184,'1','N'),(262,NULL,'Slot','i6','N','Bench1 R1 B4 i6',184,'1','N'),(263,NULL,'Slot','i7','N','Bench1 R1 B4 i7',184,'1','N'),(264,NULL,'Slot','i8','N','Bench1 R1 B4 i8',184,'1','N'),(265,NULL,'Slot','i9','N','Bench1 R1 B4 i9',184,'1','N');
/*!40000 ALTER TABLE `Rack` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sample_Type`
--

DROP TABLE IF EXISTS `Sample_Type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Sample_Type` (
  `Sample_Type_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Sample_Type` varchar(40) DEFAULT NULL,
  `FKParent_Sample_Type__ID` int(11) DEFAULT NULL,
  `Sample_Type_Alias` varchar(255) NOT NULL,
  PRIMARY KEY (`Sample_Type_ID`),
  UNIQUE KEY `Sample_Type` (`Sample_Type`),
  KEY `Parent_Sample_Type` (`FKParent_Sample_Type__ID`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sample_Type`
--

LOCK TABLES `Sample_Type` WRITE;
/*!40000 ALTER TABLE `Sample_Type` DISABLE KEYS */;
INSERT INTO `Sample_Type` VALUES (1,'Mixed',NULL,'Mixed'),(2,'Tissue',NULL,'Tissue'),(3,'Cells',NULL,'Cells'),(4,'Whole Blood',NULL,'Whole Blood'),(5,'Blood Serum',NULL,'Blood Serum'),(6,'Red Blood Cells',NULL,'Red Blood Cells'),(7,'White Blood Cells',NULL,'White Blood Cells'),(8,'Urine',NULL,'Urine'),(9,'Saliva',NULL,'Saliva'),(10,'Blood Plasma',NULL,'Blood Plasma'),(11,'DNA',NULL,'DNA'),(12,'RBC+WBC',0,'RBC+WBC');
/*!40000 ALTER TABLE `Sample_Type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Solution`
--

DROP TABLE IF EXISTS `Solution`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Solution`
--

LOCK TABLES `Solution` WRITE;
/*!40000 ALTER TABLE `Solution` DISABLE KEYS */;
INSERT INTO `Solution` VALUES (1,NULL,2,'2017-03-02',0,NULL,NULL,'Reagent','Unopened',8,NULL,1,2,NULL,'N/A',NULL,'ml'),(2,NULL,2,'2017-03-02',0,NULL,NULL,'Reagent','Unopened',8,NULL,2,2,NULL,'N/A',NULL,'ml');
/*!40000 ALTER TABLE `Solution` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Stock`
--

DROP TABLE IF EXISTS `Stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Stock` (
  `Stock_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FK_Employee__ID` int(11) DEFAULT NULL,
  `Stock_Lot_Number` varchar(80) DEFAULT NULL,
  `Stock_Received` date DEFAULT NULL,
  `FK_Orders__ID` int(11) DEFAULT NULL,
  `FK_Box__ID` int(11) DEFAULT NULL,
  `Stock_Number_in_Batch` int(11) DEFAULT NULL,
  `Stock_Cost` float DEFAULT NULL,
  `FK_Grp__ID` int(11) NOT NULL DEFAULT '0',
  `FK_Barcode_Label__ID` int(11) DEFAULT NULL,
  `Identifier_Number` varchar(80) DEFAULT NULL,
  `Identifier_Number_Type` enum('Component Number','Reference ID') DEFAULT NULL,
  `FK_Stock_Catalog__ID` int(11) NOT NULL DEFAULT '0',
  `Stock_Notes` text,
  `PO_Number` varchar(20) DEFAULT NULL,
  `Requisition_Number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`Stock_ID`),
  KEY `box` (`FK_Box__ID`),
  KEY `FK_Orders__ID` (`FK_Orders__ID`),
  KEY `FK_Barcode_Label__ID` (`FK_Barcode_Label__ID`),
  KEY `FK_Grp__ID` (`FK_Grp__ID`),
  KEY `FK_Employee__ID` (`FK_Employee__ID`),
  KEY `grp_id` (`FK_Grp__ID`),
  KEY `employee_id` (`FK_Employee__ID`),
  KEY `barcode_label` (`FK_Barcode_Label__ID`),
  KEY `lot` (`Stock_Lot_Number`),
  KEY `identifier` (`Identifier_Number_Type`),
  KEY `indentifier_number` (`Identifier_Number`),
  KEY `Catalog_ID` (`FK_Stock_Catalog__ID`)
) ENGINE=MyISAM AUTO_INCREMENT=23 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Stock`
--

LOCK TABLES `Stock` WRITE;
/*!40000 ALTER TABLE `Stock` DISABLE KEYS */;
INSERT INTO `Stock` VALUES (3,NULL,'abv','2017-03-23',NULL,NULL,2,NULL,0,NULL,NULL,NULL,7,NULL,NULL,NULL),(4,NULL,'rrr','2017-03-23',NULL,NULL,2,NULL,0,NULL,NULL,NULL,7,'nonotes',NULL,NULL),(5,NULL,'fff','2017-03-23',NULL,NULL,2,NULL,0,NULL,NULL,NULL,8,'nono',NULL,NULL),(6,NULL,'fsf','2017-03-23',NULL,NULL,2,NULL,0,NULL,NULL,NULL,8,'asd',NULL,NULL),(7,NULL,'32','2017-03-23',NULL,NULL,1,NULL,0,NULL,NULL,NULL,8,'sss',NULL,NULL),(8,NULL,'aff','2017-03-23',NULL,NULL,2,NULL,0,NULL,NULL,NULL,8,'asdf',NULL,NULL),(9,NULL,'fff','2017-03-02',NULL,NULL,1,NULL,0,NULL,NULL,NULL,9,'',NULL,NULL),(10,NULL,'123','2017-03-23',NULL,NULL,2,NULL,0,NULL,NULL,NULL,9,NULL,NULL,NULL),(11,NULL,'666','2017-03-23',NULL,NULL,2,NULL,0,NULL,NULL,NULL,9,NULL,NULL,NULL),(12,NULL,'123','2017-03-23',NULL,NULL,2,NULL,0,NULL,NULL,NULL,9,NULL,NULL,NULL),(13,NULL,'xyz','2017-03-23',NULL,NULL,2,NULL,0,NULL,NULL,NULL,9,NULL,NULL,NULL),(14,NULL,'afsadfsf','2017-03-23',NULL,NULL,2,NULL,0,NULL,NULL,NULL,9,NULL,NULL,NULL),(15,NULL,'xx','2017-03-23',NULL,NULL,2,NULL,0,NULL,NULL,NULL,9,NULL,NULL,NULL),(16,NULL,'xyz','2017-03-24',NULL,NULL,1,NULL,0,NULL,NULL,NULL,9,NULL,NULL,NULL),(17,NULL,'asfsf','2017-03-24',NULL,NULL,2,NULL,0,NULL,NULL,NULL,9,NULL,NULL,NULL),(18,NULL,'lmnop','2017-03-24',NULL,NULL,3,NULL,0,NULL,NULL,NULL,9,NULL,NULL,NULL),(19,NULL,NULL,'2017-03-24',NULL,NULL,5,NULL,0,NULL,NULL,NULL,9,NULL,NULL,NULL),(20,NULL,'l1234','2017-03-24',NULL,NULL,2,NULL,0,NULL,NULL,NULL,9,NULL,NULL,NULL),(21,NULL,'l1l2','2017-03-24',NULL,NULL,2,NULL,0,NULL,NULL,NULL,9,NULL,NULL,NULL),(22,NULL,'l1l2','2017-03-24',NULL,NULL,2,NULL,0,NULL,NULL,NULL,9,NULL,NULL,NULL);
/*!40000 ALTER TABLE `Stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Stock_Catalog`
--

DROP TABLE IF EXISTS `Stock_Catalog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Stock_Catalog`
--

LOCK TABLES `Stock_Catalog` WRITE;
/*!40000 ALTER TABLE `Stock_Catalog` DISABLE KEYS */;
INSERT INTO `Stock_Catalog` VALUES (7,'Picogreen',NULL,NULL,'Reagent','Order','Active',NULL,NULL,NULL,NULL,NULL,0),(8,'Qiagen Kit',NULL,NULL,'Reagent','Order','Active',NULL,NULL,NULL,NULL,NULL,0),(9,'Freezer (-80)',NULL,NULL,'Equipment','Order','Active',NULL,NULL,NULL,NULL,NULL,86);
/*!40000 ALTER TABLE `Stock_Catalog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tube`
--

DROP TABLE IF EXISTS `Tube`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Tube` (
  `Tube_ID` int(11) NOT NULL AUTO_INCREMENT,
  `FK_Plate__ID` int(11) NOT NULL,
  PRIMARY KEY (`Tube_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tube`
--

LOCK TABLES `Tube` WRITE;
/*!40000 ALTER TABLE `Tube` DISABLE KEYS */;
INSERT INTO `Tube` VALUES (1,1),(2,417),(3,418),(4,420),(5,420),(6,425),(7,425),(8,428),(9,428),(10,429),(11,430),(12,431),(13,432),(14,433),(15,434),(16,435),(17,436),(18,437),(19,438),(20,439),(21,440),(22,441),(23,442),(24,443),(25,444),(26,445),(27,446),(28,447),(29,448),(30,449),(31,450),(32,451),(33,452),(34,453),(35,454),(36,455),(37,456),(38,457),(39,458),(40,459),(41,460),(42,461),(43,462),(44,463),(45,464),(46,465),(47,466),(48,467),(49,468),(50,469),(51,470),(52,471),(53,472),(54,473),(55,474),(56,475),(57,476),(58,477),(59,478),(60,479),(61,480),(62,481),(63,482),(64,483),(65,484),(66,485),(67,486),(68,487),(69,488),(70,489),(71,490),(72,491),(73,492),(74,493),(75,494),(76,495),(77,496),(78,497),(79,498),(80,499),(81,500),(82,501),(83,502),(84,503),(85,504),(86,505),(87,506),(88,507),(89,508);
/*!40000 ALTER TABLE `Tube` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `barcode`
--

DROP TABLE IF EXISTS `barcode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `barcode` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barcode`
--

LOCK TABLES `barcode` WRITE;
/*!40000 ALTER TABLE `barcode` DISABLE KEYS */;
/*!40000 ALTER TABLE `barcode` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `department` (
  `name` varchar(255) DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES ('LIMS',1,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('Laboratory',2,'2016-12-30 18:05:15','2016-12-30 18:05:15');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grp`
--

DROP TABLE IF EXISTS `grp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grp` (
  `name` varchar(255) DEFAULT NULL,
  `access` varchar(255) DEFAULT NULL,
  `department` int(11) DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grp`
--

LOCK TABLES `grp` WRITE;
/*!40000 ALTER TABLE `grp` DISABLE KEYS */;
INSERT INTO `grp` VALUES ('Admin','read,write,delete',1,1,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('Users','read,write,delete',1,2,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('Guest','read',1,3,'2016-12-30 18:05:15','2016-12-30 18:05:15');
/*!40000 ALTER TABLE `grp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grp_members__user_groups`
--

DROP TABLE IF EXISTS `grp_members__user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grp_members__user_groups` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `grp_members` int(11) DEFAULT NULL,
  `user_groups` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grp_members__user_groups`
--

LOCK TABLES `grp_members__user_groups` WRITE;
/*!40000 ALTER TABLE `grp_members__user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `grp_members__user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `help`
--

DROP TABLE IF EXISTS `help`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `help` (
  `title` varchar(255) DEFAULT NULL,
  `section` varchar(255) DEFAULT NULL,
  `description` longtext,
  `page` varchar(255) DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `help`
--

LOCK TABLES `help` WRITE;
/*!40000 ALTER TABLE `help` DISABLE KEYS */;
INSERT INTO `help` VALUES ('Stock_Catalog','Database Tables','This table enables a list of repeatedly ordered items to be easily received via the interface without repeatedly entering information such as the model, vendor’s catalog number and a description of the item.  These records (similar to an actual catalog) document the details of a given stock item (eg 1 litre bottle of Isopropanol sold by xyz chemical company)\n);\n',NULL,1,NULL,NULL),('Equipment_Category','Database Tables','This table simply enables certain stock items to be given automated prefix names which allow them to be more easily referenced and grouped together.  (eg all -80 degree freezers are given an autoincrementing name of ‘F80-N’)   This will be modified slightly to remove the implication that this can only be applied to equipment (even if that is the most likely usage).  In theory you could also automatically establish standard prefixes to other stock items (eg ‘QKit-N’ for Qiagen Kits received, or ‘Iso-N’ for bottles of Isopropanol)\n',NULL,2,NULL,NULL),('Attribute_Type','Database Tables','This is a string indicating the type of information an attribute stores.  Since Attributes are always stored as string values, this field enables the interface to provide format checking or provide a dropdown menu rather than a simple text field for attributes that should have specific enumerated values.  Similarly, a foreign key reference will enable the interface to replace the textfield with a dropdown menu referencing the applicable referenced records.  The ‘Count’ type is a special type which indicates that this attribute is simply an auto-incremented counter.  Attributes of this type within a protocol will not be prompted for, but will be incremented in the background whenever these steps are completed (Thaw_Count for example is simply a counter indicating the number of times a step is completed which contains the Thaw_Count attribute - which should be supplied for any step which implies that the user has thawed the sample)\n',NULL,3,NULL,NULL);
/*!40000 ALTER TABLE `help` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_protocol`
--

DROP TABLE IF EXISTS `lab_protocol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lab_protocol` (
  `name` varchar(255) DEFAULT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `status` enum('Active','Archived','Under Development','External') DEFAULT NULL,
  `description` longtext,
  `Container_format` int(11) DEFAULT NULL,
  `Sample_type` int(11) DEFAULT NULL,
  `repeatable` tinyint(1) DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_protocol`
--

LOCK TABLES `lab_protocol` WRITE;
/*!40000 ALTER TABLE `lab_protocol` DISABLE KEYS */;
INSERT INTO `lab_protocol` VALUES ('Standard',1,'Archived',NULL,NULL,NULL,1,1,NULL,NULL),('LIMS_Lab_Protocol',4,'Archived','Selenium Test Create Protocol',NULL,NULL,1,2,NULL,NULL),('new ACD Tube SOP',4,'Active','Protocol for handling ACD Blood Collection Tubes',1,4,2,3,NULL,NULL),('SST Tube SOP',4,'Active','Protocol for handling SST Blood Collection Tubes',2,4,2,4,NULL,NULL),('EDTA Tube SOP',4,'Active','Protocol for handling EDTA Blood Collection Tubes',3,4,2,5,NULL,NULL),('Urine SOP',4,'Active','Protocol for handling collected Urine samples',4,8,2,6,NULL,NULL),('Export Samples',1,'Archived','Export sample to another site',NULL,NULL,1,7,NULL,NULL),('Receive Samples',1,'Archived','Receive samples exported from another site',NULL,NULL,1,8,NULL,NULL),('Add to Sample Shipment',1,'Archived','Collect Samples into Transporter Box',NULL,NULL,1,9,NULL,NULL),('Blood Separation Protocol',4,'Archived','Protocol for handling EDTA Blood Collection Tubes',NULL,4,2,10,NULL,NULL),('PST Protocol',4,'Active','Protocol for handling PST Blood Collection Tubes',6,4,2,11,NULL,NULL),('EDTA 6 mL Extraction Protocol',1,'Archived','Protocol for handling plasma and sucrose DNA extraction.',16,NULL,2,12,NULL,NULL),('EDTA 4 mL Extraction Protocol',1,'Archived','Protocol for handling plasma and sucrose DNA extraction.',20,NULL,2,14,NULL,NULL),('EDTA RBC WBC Protocol',1,'Archived','Protocol for handling blood cell mixing.',NULL,12,2,15,NULL,NULL),('Weigh Tube',1,'Active','Calculate sample volume by weighing tube & subtracting empty weight',NULL,NULL,1,16,NULL,NULL),('Saliva DNA Extraction',1,'Active','DNA extraction from Saliva',13,9,1,17,NULL,NULL),('Sucrose Extraction',1,'Active','Sucrose DNA extraction from RBC/WBC samples',NULL,NULL,1,18,NULL,NULL),('Gender_Test',41,'Active','Track Gender Test Results for Samples',NULL,NULL,2,19,NULL,NULL),('DNA_Quantification',41,'Active','Update DNA Quantification information',NULL,NULL,2,20,NULL,NULL),('Test Protocol',0,'Archived','Test input ',NULL,NULL,0,21,NULL,NULL),('DNA Extraction',41,'Active','DNA Extraction Protocol',NULL,4,0,22,'2016-05-05 00:00:00','2016-05-05 00:00:00'),('Picogreen Protocol',41,'Active','Picogreen Protocol',NULL,NULL,0,23,'2016-06-05 00:00:00','2016-05-05 00:00:00'),('Qiagen Flexigene ',41,'Active','Qiagen Flexigene Protocol',NULL,NULL,0,24,'2016-06-05 00:00:00','2016-05-05 00:00:00'),('Thaw Samples ',41,'Active','Track Thawing of Samples',NULL,NULL,0,25,'2016-06-05 00:00:00','2016-05-05 00:00:00'),('B-Globin PCR',15,'Active','',NULL,NULL,NULL,26,'2016-09-01 00:00:00','2016-09-01 00:00:00'),('DNA Normalization',15,'Active','',NULL,NULL,NULL,27,'2016-09-01 00:00:00','2016-09-01 00:00:00');
/*!40000 ALTER TABLE `lab_protocol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `protocol_step`
--

DROP TABLE IF EXISTS `protocol_step`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `protocol_step` (
  `name` varchar(255) DEFAULT NULL,
  `Lab_protocol` int(11) DEFAULT NULL,
  `step_number` varchar(255) DEFAULT NULL,
  `instructions` longtext,
  `message` varchar(255) DEFAULT NULL,
  `Target_format` int(11) DEFAULT NULL,
  `Target_sample` int(11) DEFAULT NULL,
  `reset_focus` tinyint(1) DEFAULT NULL,
  `input_options` varchar(255) DEFAULT NULL,
  `input_format` varchar(255) DEFAULT NULL,
  `input_defaults` varchar(255) DEFAULT NULL,
  `custom_settings` varchar(255) DEFAULT NULL,
  `prompt` tinyint(1) DEFAULT NULL,
  `transfer_type` enum('Transfer','Aliquot','Pre-Print') DEFAULT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `repeatable` tinyint(1) DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `protocol_step`
--

LOCK TABLES `protocol_step` WRITE;
/*!40000 ALTER TABLE `protocol_step` DISABLE KEYS */;
INSERT INTO `protocol_step` VALUES ('Do Not Discard This Protocol',1,'1','','',NULL,NULL,NULL,'','','',NULL,0,NULL,1,NULL,1,NULL,NULL),('Throw Away',1,'1','','',NULL,NULL,NULL,'','','',NULL,0,NULL,1,NULL,2,NULL,NULL),('Export',1,'1','','',NULL,NULL,NULL,'','','',NULL,0,NULL,1,NULL,3,NULL,NULL),('Fail Plate',1,'1','Standard Protocol Step for Failing Plates',NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,0,NULL,1,NULL,4,NULL,NULL),('Thaw',1,'1','Standard Protocol Step for Thawing Plates',NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,0,NULL,1,NULL,5,NULL,NULL),('Get Sample',2,'1','','',NULL,NULL,NULL,'','','',NULL,1,NULL,1,NULL,10,NULL,NULL),('Aliquot to 384-well Abgene - Culture',2,'4','','',NULL,NULL,NULL,':location*','',':','{\"transfer_type\" : \"Aliquot\", \"fill_by\" : \"position\" }',1,'Aliquot',1,NULL,11,NULL,NULL),('Centrifuge',2,'10','','',NULL,NULL,NULL,'equipment','','',NULL,1,NULL,1,NULL,12,NULL,NULL),('Apply solution',2,'11','','',NULL,NULL,NULL,'solution:solution_qty',':',':l',NULL,1,NULL,1,NULL,13,NULL,NULL),('Setup tubes with DMSO',3,'10','','Fill empty tubes with RPMI / 20% DMSO',NULL,NULL,NULL,'comments','','',NULL,1,NULL,4,NULL,14,NULL,NULL),('Transfer Whole Blood to 2 ml cryovial',3,'11','','',5,4,NULL,'transfer_qty*:Split:location*:comments','','750ul:3:','{\"transfer_type\" : \"Transfer\", \"target_format\" : 5, \"target_sample\" : 4, \"fill_by\" : \"position\" }',1,'Transfer',1,NULL,15,NULL,NULL),('New Store Tubes in Box',3,'12','','Scan Box Barcode',NULL,NULL,NULL,'location*:comments','','',NULL,1,NULL,1,NULL,16,NULL,NULL),('Centrifuge',5,'1','Centrifuge at 1300 x g for 10 minutes at room temperature','Centrifuge 1300 x g; 10 min (4 deg C)',NULL,NULL,NULL,'comments','','',NULL,1,NULL,1,NULL,18,NULL,NULL),('Pre-Print Blood Serum to 2 ml cryovial',4,'10','','',5,5,NULL,'Split:location*:comments','','2:','{\"transfer_type\" : \"Pre-Print\", \"target_format\" : 5, \"target_sample\" : 5, \"fill_by\" : \"position\" }',1,'Pre-Print',1,NULL,22,NULL,NULL),('Centrifuge',4,'1','Centrifuge 1300 x g; 10 minutes at room temperature','Centrifuge 1300 x g; 10 min (Room Temp)',NULL,NULL,NULL,'comments','','',NULL,1,NULL,1,NULL,23,NULL,NULL),('Transfer Blood Serum to 2 ml cryovial',4,'11','','',5,5,NULL,'transfer_qty*:Split:location*:comments','','1.0ml:2:','{\"transfer_type\" : \"Transfer\", \"target_format\" : 5, \"target_sample\" : 5, \"fill_by\" : \"position\" }',1,'Transfer',4,NULL,24,NULL,NULL),('Transfer to 2 ml cryovial',6,'4','','',5,NULL,NULL,'transfer_qty*:Split:location*:comments',':','1.5ml:3:','{\"transfer_type\" : \"Transfer\", \"target_format\" : 5, \"fill_by\" : \"position\" }',1,'Transfer',4,NULL,26,NULL,NULL),('Record Clotting time',4,'4','','',NULL,NULL,NULL,'Minutes_Clotted:Thaw_Count:comments','','',NULL,0,NULL,4,NULL,27,NULL,NULL),('Extract Blood Plasma out to 2 ml cryovial',5,'12','','',5,10,1,'transfer_qty*:Split:location*:comments','::','1.0ml:2::','{\"transfer_type\" : \"Transfer\", \"reset_focus\" : 1, \"target_format\" : 5, \"target_sample\" : 10, \"fill_by\" : \"position\" }',1,'Transfer',4,NULL,29,NULL,NULL),('Extract White Blood Cells out to 2 ml cryovial',5,'13','','Extract Buffy Coat',5,7,1,'transfer_qty*:location*:comments',':','1.0ml::','{\"transfer_type\" : \"Transfer\", \"reset_focus\" : 1, \"target_format\" : 5, \"target_sample\" : 7, \"fill_by\" : \"position\" }',1,'Transfer',4,NULL,30,NULL,NULL),('Transfer Red Blood Cells to 2 ml cryovial',5,'14','','',5,6,NULL,'transfer_qty*:location*:comments',':','1.0ml::','{\"transfer_type\" : \"Transfer\", \"target_format\" : 5, \"target_sample\" : 6, \"fill_by\" : \"position\" }',1,'Transfer',4,NULL,31,NULL,NULL),('Store cryovials in box',4,'12','','Scan Box Barcode',NULL,NULL,NULL,'location*:comments','','',NULL,1,NULL,1,NULL,32,NULL,NULL),('Store cryovials in box',5,'15','','Scan Box Barcode',NULL,NULL,NULL,'location*:comments','','',NULL,0,NULL,1,NULL,33,NULL,NULL),('Store cryovials in box',6,'10','','Scan Box Barcode',NULL,NULL,NULL,'location*:comments','','',NULL,1,NULL,1,NULL,34,NULL,NULL),('Export Samples',7,'1','','',NULL,NULL,NULL,'Waybill_Number*:Shipping_Temp_in_C:Shipper:Data_Logger_Serial_No:comments','','',NULL,1,NULL,1,NULL,35,NULL,NULL),('Receive Sample Shipment',8,'1','','',NULL,NULL,NULL,'Max_Transit_Temp_in_C:Min_Transit_Temp_in_C:comments','','',NULL,1,NULL,1,NULL,36,NULL,NULL),('Insert into Transporter Box',9,'1','','Scan Transporter Box',NULL,NULL,NULL,'location*:comments','','',NULL,0,NULL,1,NULL,37,NULL,NULL),('Pre-Print Blood Plasma out to 2 ml cryovial',5,'4','pre-print barcodes for plasma cryovials','apply barcodes to cryovials for Plasma',5,10,1,'Split:location*:comments','','2:','{\"transfer_type\" : \"Pre-Print\", \"reset_focus\" : 1, \"target_format\" : 5, \"target_sample\" : 10, \"fill_by\" : \"position\" }',1,'Pre-Print',1,NULL,38,NULL,NULL),('Pre-Print White Blood Cells out to 2 ml cryovial',5,'10','pre-print barcodes for WBC cryovials','apply barcodes to cryovials for White Bl',5,7,1,'location*:comments','',':','{\"transfer_type\" : \"Pre-Print\", \"reset_focus\" : 1, \"target_format\" : 5, \"target_sample\" : 7, \"fill_by\" : \"position\" }',1,'Pre-Print',1,NULL,39,NULL,NULL),('Pre-Print Red Blood Cells out to 2 ml cryovial',5,'11','pre-print barcodes for RBC cryovials','apply barcodes to cryovials for Red Bloo',5,6,1,'location*:comments','',':','{\"transfer_type\" : \"Pre-Print\", \"reset_focus\" : 1, \"target_format\" : 5, \"target_sample\" : 6, \"fill_by\" : \"position\" }',1,'Pre-Print',1,NULL,40,NULL,NULL),('Pre-Print Whole Blood to 2 ml cryovial',3,'4','Pre-Print Whole Blood out to cryovial','put barcodes on cryovials',5,4,NULL,'Split:location*:comments','','3:','{\"transfer_type\" : \"Pre-Print\", \"target_format\" : 5, \"target_sample\" : 4, \"fill_by\" : \"position\" }',1,'Pre-Print',1,NULL,41,NULL,NULL),('Centrifuge',10,'1','Centrifuge at 1300 x g for 10 minutes at room temperature','Centrifuge 1300 x g; 10 min (4 deg C)',NULL,NULL,NULL,'comments','','',NULL,1,NULL,1,0,42,NULL,NULL),('Extract Blood Plasma out to 2 ml cryovial',10,'4','','',5,10,1,'transfer_qty*:Split:location*:comments','::','1.0ml:3::','{\"transfer_type\" : \"Transfer\", \"reset_focus\" : 1, \"target_format\" : 5, \"target_sample\" : 10, \"fill_by\" : \"position\" }',1,'Transfer',4,0,43,NULL,NULL),('Extract White Blood Cells out to 2 ml cryovial',10,'10','','Extract Buffy Coat',5,7,1,'transfer_qty*:Split:location*:comments','::::','1.0ml:1:','{\"transfer_type\" : \"Transfer\", \"reset_focus\" : 1, \"target_format\" : 5, \"target_sample\" : 7, \"fill_by\" : \"position\" }',1,'Transfer',1,NULL,44,NULL,NULL),('Transfer Red Blood Cells to 2 ml cryovial',10,'11','','',5,6,NULL,'transfer_qty*:Split:location*:comments','::::','1.0ml:1:','{\"transfer_type\" : \"Transfer\", \"target_format\" : 5, \"target_sample\" : 6, \"fill_by\" : \"position\" }',1,'Transfer',1,NULL,45,NULL,NULL),('Store cryovials in box',10,'12','','Scan Box Barcode',NULL,NULL,NULL,'location*:comments','','',NULL,0,NULL,1,0,46,NULL,NULL),('Pre-Print Blood Plasma to 2 ml cryovial',11,'1','','',5,10,NULL,'Split:location*:comments','','3:','{\"transfer_type\" : \"Pre-Print\", \"target_format\" : 5, \"target_sample\" : 10, \"fill_by\" : \"position\" }',1,'Pre-Print',1,0,50,NULL,NULL),('Centrifuge',11,'4','Centrifuge 1500 x g; 10 minutes at room temperature','Centrifuge 1500 x g; 10 min (Room Temp)',NULL,NULL,NULL,'comments','','',NULL,1,NULL,1,NULL,51,NULL,NULL),('Transfer Blood Plasma to 2 ml cryovial',11,'11','','',5,10,NULL,'transfer_qty*:Split:location*:comments','','1.0ml:3:','{\"transfer_type\" : \"Transfer\", \"target_format\" : 5, \"target_sample\" : 10, \"fill_by\" : \"position\" }',1,'Transfer',4,0,52,NULL,NULL),('Record Clotting time',11,'10','','',NULL,NULL,NULL,'Minutes_Clotted:Thaw_Count:comments','','',NULL,0,NULL,4,0,53,NULL,NULL),('Store cryovials in box',11,'12','','Scan Box Barcode',NULL,NULL,NULL,'location*:comments','','',NULL,1,NULL,1,0,54,NULL,NULL),('Pre-Print to 2 ml cryovial',6,'1','','',5,NULL,NULL,'Split:location*:comments',':','3::','{\"transfer_type\" : \"Pre-Print\", \"target_format\" : 5, \"fill_by\" : \"position\" }',1,'Pre-Print',1,NULL,56,NULL,NULL),('Pre-Print Blood Plasma to 1 ml cryovial',12,'1','Pre-print plasma barcodes','',22,10,NULL,'Split:location*:comments',':','3::','{\"transfer_type\" : \"Pre-Print\", \"target_format\" : 22, \"target_sample\" : 10, \"fill_by\" : \"position\" }',1,'Pre-Print',1,NULL,57,NULL,NULL),('Centrifuge containers',12,'4','Centrifuge containers at 2500 rpm for 10 minutes at room temperature.','Centrifuge 2500 rpm, 10 min, room temp',NULL,NULL,NULL,'comments','','',NULL,1,NULL,1,NULL,58,NULL,NULL),('Aliquot Blood Plasma to 1 ml cryovial',12,'10','','Aliquot 1.0 mL per tube',22,10,NULL,'transfer_qty*:Split:location*:comments','::::','1.0ml:3::::','{\"transfer_type\" : \"Aliquot\", \"target_format\" : 22, \"target_sample\" : 10, \"fill_by\" : \"position\" }',1,'Aliquot',1,NULL,59,NULL,NULL),('Pre-Print Blood Plasma to 1 ml cryovial',14,'1','','Pre-print plasma barcodes',22,10,NULL,'Split:location*:comments',':','2::','{\"transfer_type\" : \"Pre-Print\", \"target_format\" : 22, \"target_sample\" : 10, \"fill_by\" : \"position\" }',1,'Pre-Print',1,NULL,62,NULL,NULL),('Centrifuge containers',14,'4','Centrifuge containers at 2500 rpm for 10 minutes at room temperature.','Centrifuge 2500 rpm, 10 min, room temp',NULL,NULL,NULL,'comments','','',NULL,1,NULL,1,NULL,63,NULL,NULL),('Aliquot Blood Plasma to 1 ml cryovial',14,'10','','Aliquot 1.0 mL per tube',22,10,NULL,'transfer_qty*:Split:location*:comments','::::','1.0ml:2::::','{\"transfer_type\" : \"Aliquot\", \"target_format\" : 22, \"target_sample\" : 10, \"fill_by\" : \"position\" }',1,'Aliquot',1,NULL,64,NULL,NULL),('Pool to 50 ml Conical Tube',15,'1','','Pool sample tubes together',14,NULL,NULL,'comments','','',NULL,1,NULL,1,NULL,66,NULL,NULL),('Aliquot to 50 ml Conical Tube',15,'4','','Split into 2 tubes',14,NULL,NULL,'Split:location*:comments',':','2::','{\"transfer_type\" : \"Aliquot\", \"target_format\" : 14, \"fill_by\" : \"position\" }',0,'Aliquot',1,NULL,67,NULL,NULL),('Weigh Tube',16,'1','Measure and record Full Tube weight in grams. ','',NULL,NULL,NULL,'Measured_Tube_Weight_in_g','','',NULL,1,NULL,1,NULL,68,NULL,NULL),('Transfer DNA to 1.8 ml eppendorf',17,'16','','',23,11,NULL,':location*','',':','{\"transfer_type\" : \"Transfer\", \"target_format\" : 23, \"target_sample\" : 11, \"fill_by\" : \"position\" }',1,'Transfer',1,NULL,71,NULL,NULL),('Incubate',17,'4','Incubate sample overnight at 50 C','Incubate sample overnight at 50 C',NULL,NULL,NULL,'','','',NULL,1,NULL,1,NULL,72,NULL,NULL),('Resuspend',17,'15','Resuspend in 1ml of hydration buffer','Resuspend Pellet in 50 ul of DNA Buffer',NULL,NULL,NULL,'solution:solution_qty',':',':50ul',NULL,1,NULL,1,NULL,74,NULL,NULL),('Store sample',17,'17','','',NULL,NULL,NULL,'location*','','',NULL,1,NULL,1,NULL,75,NULL,NULL),('Transfer DNA to 1.8 ml eppendorf',18,'10','','Lyses and remove RBC',23,11,NULL,':location*','',':','{\"transfer_type\" : \"Transfer\", \"target_format\" : 23, \"target_sample\" : 11, \"fill_by\" : \"position\" }',1,'Transfer',1,NULL,76,NULL,NULL),('Digest',18,'11','','Digest WBC with Protease K',NULL,NULL,NULL,'','','',NULL,1,NULL,1,NULL,77,NULL,NULL),('Precipitate',18,'12','','Precipitate, wash and air dry DNA',NULL,NULL,NULL,'','','',NULL,1,NULL,1,NULL,78,NULL,NULL),('Resuspend',18,'13','Resuspend in 1ml of hydration buffer','Resuspend pellet in 1 ml of DNA buffer',NULL,NULL,NULL,'','','',NULL,1,NULL,1,NULL,79,NULL,NULL),('Store Sample',18,'14','','Scan target location - 4 C Fridge',NULL,NULL,NULL,'location*',':',':',NULL,1,NULL,1,NULL,80,NULL,NULL),('Pre-Print DNA to 1.8 ml eppendorf',18,'1','','Generate DNA barcodes',23,11,NULL,':location*','',':','{\"transfer_type\" : \"Pre-Print\", \"target_format\" : 23, \"target_sample\" : 11, \"fill_by\" : \"position\" }',1,'Pre-Print',1,0,81,NULL,NULL),('Add PT-LP2 solution and Incubate 10 min',17,'10','Add 20?L PT-L2P solution to each tube, mix, incubate on ice for 10 minutes','',NULL,NULL,NULL,'','','',NULL,1,NULL,1,NULL,82,NULL,NULL),('Centrifuge',17,'11','Centrifuge at 15,000 x g for 15 minutes at room temperature','Spin 15000 15m RT',NULL,NULL,NULL,'','','',NULL,1,NULL,1,NULL,83,NULL,NULL),('Transfer supernatant',17,'12','Transfer supernatant containing DNA to new tube. Add 5?L glycogen and 0.5mL 95% ethanol, mix &#8805;10X. Incubate at RT for 10 minutes','',NULL,NULL,NULL,':location*','',':','{\"transfer_type\" : \"Transfer\", \"fill_by\" : \"position\" }',1,'Transfer',1,NULL,84,NULL,NULL),('Centrifuge again',17,'13','Centrifuge at 15,000 x g for 2 minutes at RT','Spin 15000 2 min RT',NULL,NULL,NULL,'','','',NULL,1,NULL,1,NULL,85,NULL,NULL),('Decant',17,'14','Discard supernatant. Wash DNA pellet with 70% ethanol, centrifuge (15,000 x g, 2 minutes, RT), discard ethanol, air-dry DNA pellet','',NULL,NULL,NULL,'','','',NULL,1,NULL,1,NULL,86,NULL,NULL),('Transfer  to 1.8 ml eppendorf',17,'1','Transfer 0.5mL saliva sample to 1.5mL microfuge tube(s)','Transfer 0.5mL to ufuge tube(s)',23,NULL,NULL,'transfer_qty*:Split:location*',':','0.5ml:2:','{\"transfer_type\" : \"Transfer\", \"target_format\" : 23, \"fill_by\" : \"position\" }',1,'Transfer',1,NULL,87,NULL,NULL),('Update Gender Test Results',19,'1','Indicate results of Gender Test','',NULL,NULL,NULL,'Gender_Test_Result','','',NULL,1,NULL,41,2,88,NULL,NULL),('DNA Quantification',20,'1','Indicate results of DNA Quantification','Enter DNA UV Batch for DNA Quantification',NULL,11,NULL,'DNA_UV_Batch*','','',NULL,1,NULL,41,2,89,NULL,NULL),('test step 1',21,'1','general instructions','basic message',NULL,NULL,NULL,'solution:solution_qty:equipment*:location*:Waybill_Number*','','',NULL,1,NULL,0,0,90,NULL,NULL),('Transfer Buffy Coat to Falcon Tubes',22,'1','Transfer 1.0 ml of buffy coat to 15 ml Falcon tube','Transfer as indicated',26,7,0,'transfer_qty*:location*','','1ml:','{\"transfer_type\" : \"Transfer\", \"target_format\" : 26, \"target_sample\" : 7, \"fill_by\" : \"position\" }',1,'Transfer',41,0,91,'2016-04-18 07:00:00','2016-04-18 07:00:00'),('Mix & Centrifuge',22,'4','Mix buffy coat with FG1 and centrifuge @2000 xg for 5 min','Mix with FG1 & Centrifuge',0,0,0,'Qiagen_Kit_Lot_Number','','',NULL,1,NULL,41,0,92,'2016-04-18 07:00:00','2016-04-18 07:00:00'),('Mix & Digest',22,'10','Suspend pellet in FG2 buffer/protease, invert 3 times, heat at 65 C for 10 min','Digest with FG2 buffer/protease',0,0,0,'location*','','',NULL,1,NULL,41,0,93,'2016-04-18 07:00:00','2016-04-18 07:00:00'),('Precipitate & Centrifuge',22,'11','Precipitate DNA with isopropanol and centrifuge @2000 xg for 3 min','',0,0,0,'location*','','',NULL,1,NULL,41,0,94,'2016-04-18 07:00:00','2016-04-18 07:00:00'),('Wash Pellet',22,'12','Wash DNA Pellet with 70% ethanol','',0,0,0,'DNA_Wash_Cycles','','2',NULL,1,NULL,41,0,95,'2016-04-18 07:00:00','2016-04-18 07:00:00'),('Suspend DNA in buffer',22,'13','Suspend DNA in 300 ul of TE pH 8.0 buffer','',0,0,0,'solution:solution_qty','','',NULL,1,NULL,41,0,96,'2016-04-18 07:00:00','2016-04-18 07:00:00'),('Transfer DNA to 0.5 ml Matrix Tube',22,'14','','',27,0,0,'transfer_qty:location*:comments','','0.3 ml:','{\"transfer_type\" : \"Transfer\", \"target_format\" : 27, \"fill_by\" : \"position\" }',1,'Transfer',41,0,97,'2016-04-18 07:00:00','2016-04-18 07:00:00'),('Add Picogreen Data',23,'1','Upload data from Picogreen protocol','Upload Picogreen data',0,0,0,'solution*:DNA_Conc_PG_Batch*','','',NULL,1,NULL,41,0,98,'2016-04-18 07:00:00','2016-04-18 07:00:00'),('Standard Thaw',25,'1','Update Thaw Count for current samples ','Track Thaw Instance and note Thaw Temperature',0,0,0,'Thaw_Count:Thaw_Temp','','',NULL,1,NULL,4,0,100,'2016-04-18 07:00:00','2016-04-18 07:00:00'),('Update Thaw & Extraction information',24,'2',NULL,'Update Thaw information',NULL,NULL,NULL,'Thaw_Temp*:Thaw_Count',NULL,NULL,NULL,1,NULL,NULL,NULL,101,NULL,NULL),('Transfer to conical tube',24,'3',NULL,NULL,NULL,NULL,NULL,'location*',NULL,NULL,'{\"transfer_type\" : \"Transfer\", \"Target_sample\" : \"11\", \"Target_format\" : \"14\", \"transfer_qty\" : \"0ml\" }',1,NULL,NULL,NULL,102,NULL,NULL),('Extract DNA',24,'4',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,104,NULL,NULL),('Add Hydration Buffer',24,'5',NULL,NULL,NULL,NULL,NULL,'solution*:solution_qty',NULL,NULL,NULL,1,NULL,NULL,NULL,105,NULL,NULL),('Indicate PCR Batch ID',26,'1',NULL,NULL,NULL,NULL,NULL,'DNA_BGGLOBIN_Batch*',NULL,NULL,NULL,1,NULL,NULL,NULL,106,NULL,NULL),('Add Hydration Buffer',27,'2',NULL,NULL,NULL,NULL,NULL,'solution*:solution_qty*',NULL,NULL,NULL,1,NULL,NULL,NULL,107,NULL,NULL),('Aliquot DNA',27,'1',NULL,NULL,NULL,NULL,NULL,'transfer_qty*:solution_qty*',NULL,NULL,'{\"transfer_type\" : \"Aliquot\", \"transfer_qty\" : \"true\"}',1,NULL,NULL,NULL,108,NULL,NULL),('Track Extraction Kit',24,'1',NULL,NULL,NULL,NULL,NULL,'solution*',NULL,NULL,NULL,1,NULL,NULL,NULL,110,NULL,NULL);
/*!40000 ALTER TABLE `protocol_step` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `record`
--

DROP TABLE IF EXISTS `record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `record` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `record`
--

LOCK TABLES `record` WRITE;
/*!40000 ALTER TABLE `record` DISABLE KEYS */;
/*!40000 ALTER TABLE `record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `remote_login`
--

DROP TABLE IF EXISTS `remote_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `remote_login` (
  `User` int(11) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `remote_login`
--

LOCK TABLES `remote_login` WRITE;
/*!40000 ALTER TABLE `remote_login` DISABLE KEYS */;
/*!40000 ALTER TABLE `remote_login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sample_tracking`
--

DROP TABLE IF EXISTS `sample_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sample_tracking` (
  `Container` int(11) DEFAULT NULL,
  `Moved_from` int(11) DEFAULT NULL,
  `Moved_to` int(11) DEFAULT NULL,
  `moved` datetime DEFAULT NULL,
  `Moved_by` int(11) DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sample_tracking`
--

LOCK TABLES `sample_tracking` WRITE;
/*!40000 ALTER TABLE `sample_tracking` DISABLE KEYS */;
INSERT INTO `sample_tracking` VALUES (436,NULL,102,'2017-01-12 22:36:59',1,1,NULL,NULL),(437,NULL,103,'2017-01-12 22:37:16',1,2,NULL,NULL),(438,NULL,104,'2017-01-12 22:37:16',1,3,NULL,NULL),(439,NULL,111,'2017-01-24 08:55:28',1,4,NULL,NULL),(440,NULL,111,'2017-01-24 08:57:28',1,5,NULL,NULL),(441,NULL,123,'2017-01-24 09:47:28',1,6,NULL,NULL),(442,NULL,123,'2017-01-24 09:49:28',1,7,NULL,NULL),(443,NULL,135,'2017-01-24 09:52:33',1,8,NULL,NULL),(444,NULL,147,'2017-01-24 17:47:55',1,9,NULL,NULL),(445,NULL,159,'2017-01-24 18:59:36',1,10,NULL,NULL),(446,NULL,171,'2017-01-24 19:08:29',1,11,NULL,NULL),(447,NULL,112,'2017-01-24 19:10:47',1,12,NULL,NULL),(448,NULL,124,'2017-01-24 19:15:28',1,13,NULL,NULL),(449,NULL,136,'2017-01-24 19:20:26',1,14,NULL,NULL),(450,NULL,148,'2017-01-24 19:23:06',1,15,NULL,NULL),(451,NULL,160,'2017-01-25 09:51:54',1,16,NULL,NULL),(452,NULL,172,'2017-01-25 09:51:54',1,17,NULL,NULL),(453,NULL,113,'2017-02-05 13:42:36',1,18,NULL,NULL),(454,NULL,125,'2017-03-29 15:44:11',1,19,NULL,NULL),(455,NULL,137,'2017-03-29 15:49:34',1,20,NULL,NULL),(1,87,183,'2017-03-29 15:52:51',1,21,NULL,NULL),(456,NULL,149,'2017-03-29 15:52:51',1,22,NULL,NULL),(457,NULL,161,'2017-03-29 16:24:05',1,23,NULL,NULL),(1,87,NULL,'2017-03-29 16:28:06',1,24,NULL,NULL),(458,NULL,173,'2017-03-29 16:28:07',1,25,NULL,NULL),(1,87,183,'2017-03-29 16:42:11',1,26,NULL,NULL),(459,NULL,114,'2017-03-29 16:42:11',1,27,NULL,NULL),(460,NULL,126,'2017-03-29 20:18:25',1,28,NULL,NULL),(461,NULL,138,'2017-03-29 20:18:25',1,29,NULL,NULL),(462,NULL,150,'2017-03-29 20:18:25',1,30,NULL,NULL),(463,NULL,162,'2017-03-29 20:18:25',1,31,NULL,NULL),(464,NULL,174,'2017-03-29 20:18:25',1,32,NULL,NULL),(465,NULL,115,'2017-03-29 20:18:25',1,33,NULL,NULL),(466,NULL,127,'2017-03-29 20:18:25',1,34,NULL,NULL),(467,NULL,139,'2017-03-29 20:18:25',1,35,NULL,NULL),(419,89,183,'2017-03-29 20:20:38',1,36,NULL,NULL),(420,90,183,'2017-03-29 20:20:38',1,37,NULL,NULL),(468,NULL,105,'2017-03-29 20:20:38',1,38,NULL,NULL),(469,NULL,106,'2017-03-29 20:20:38',1,39,NULL,NULL),(470,NULL,89,'2017-03-29 20:21:41',1,40,NULL,NULL),(471,NULL,90,'2017-03-29 20:21:41',1,41,NULL,NULL),(472,NULL,107,'2017-03-29 20:24:57',1,42,NULL,NULL),(473,NULL,108,'2017-03-29 20:24:57',1,43,NULL,NULL),(419,89,183,'2017-03-30 15:02:11',1,44,NULL,NULL),(420,90,183,'2017-03-30 15:02:11',1,45,NULL,NULL),(474,NULL,117,'2017-03-30 15:02:11',1,46,NULL,NULL),(475,NULL,129,'2017-03-30 15:02:11',1,47,NULL,NULL),(476,NULL,118,'2017-03-30 15:02:11',1,48,NULL,NULL),(477,NULL,130,'2017-03-30 15:02:11',1,49,NULL,NULL),(478,NULL,119,'2017-03-30 15:02:11',1,50,NULL,NULL),(479,NULL,131,'2017-03-30 15:02:11',1,51,NULL,NULL),(480,NULL,120,'2017-03-30 15:02:11',1,52,NULL,NULL),(481,NULL,132,'2017-03-30 15:02:11',1,53,NULL,NULL),(419,89,183,'2017-03-31 16:14:48',1,54,NULL,NULL),(420,88,183,'2017-03-31 16:14:48',1,55,NULL,NULL),(482,NULL,151,'2017-03-31 16:14:48',1,56,NULL,NULL),(483,NULL,163,'2017-03-31 16:14:48',1,57,NULL,NULL),(484,NULL,116,'2017-03-31 16:14:48',1,58,NULL,NULL),(485,NULL,128,'2017-03-31 16:14:48',1,59,NULL,NULL),(486,NULL,152,'2017-03-31 16:14:48',1,60,NULL,NULL),(487,NULL,164,'2017-03-31 16:14:48',1,61,NULL,NULL),(419,89,183,'2017-03-31 16:29:18',1,62,NULL,NULL),(420,90,183,'2017-03-31 16:29:18',1,63,NULL,NULL),(488,NULL,175,'2017-03-31 16:29:18',1,64,NULL,NULL),(489,NULL,140,'2017-03-31 16:29:18',1,65,NULL,NULL),(490,NULL,154,'2017-03-31 16:29:18',1,66,NULL,NULL),(491,NULL,166,'2017-03-31 16:29:18',1,67,NULL,NULL),(492,NULL,156,'2017-03-31 16:29:18',1,68,NULL,NULL),(493,NULL,168,'2017-03-31 16:29:18',1,69,NULL,NULL),(494,NULL,169,'2017-03-31 16:29:18',1,70,NULL,NULL),(495,NULL,181,'2017-03-31 16:29:18',1,71,NULL,NULL),(496,NULL,176,'2017-03-31 16:32:47',1,72,NULL,NULL),(497,NULL,141,'2017-03-31 16:32:47',1,73,NULL,NULL),(498,NULL,177,'2017-03-31 16:32:47',1,74,NULL,NULL),(499,NULL,143,'2017-03-31 16:32:47',1,75,NULL,NULL),(500,NULL,179,'2017-03-31 16:32:47',1,76,NULL,NULL),(501,NULL,144,'2017-03-31 16:32:47',1,77,NULL,NULL),(1,185,183,'2017-04-08 10:37:10',1,78,NULL,NULL),(502,NULL,194,'2017-04-08 10:37:10',1,79,NULL,NULL),(503,NULL,185,'2017-04-08 10:43:11',1,80,NULL,NULL),(504,NULL,203,'2017-04-08 11:31:00',1,81,NULL,NULL),(419,89,183,'2017-04-11 18:03:11',1,82,NULL,NULL),(420,90,183,'2017-04-11 18:03:11',1,83,NULL,NULL),(505,NULL,153,'2017-04-11 18:03:11',1,84,NULL,NULL),(506,NULL,165,'2017-04-11 18:03:11',1,85,NULL,NULL),(507,NULL,109,'2017-04-11 18:10:25',1,86,NULL,NULL),(508,NULL,110,'2017-04-11 18:10:25',1,87,NULL,NULL);
/*!40000 ALTER TABLE `sample_tracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temp`
--

DROP TABLE IF EXISTS `temp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `temp` (
  `temp_id` int(11) NOT NULL AUTO_INCREMENT,
  `Dec_Num` decimal(9,3) DEFAULT NULL,
  `Flo_Num` float DEFAULT NULL,
  PRIMARY KEY (`temp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temp`
--

LOCK TABLES `temp` WRITE;
/*!40000 ALTER TABLE `temp` DISABLE KEYS */;
INSERT INTO `temp` VALUES (1,1.000,1.23456);
/*!40000 ALTER TABLE `temp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `units` (
  `name` varchar(255) DEFAULT NULL,
  `base_unit` varchar(255) DEFAULT NULL,
  `factor` float DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `units`
--

LOCK TABLES `units` WRITE;
/*!40000 ALTER TABLE `units` DISABLE KEYS */;
INSERT INTO `units` VALUES ('l','l',1,NULL,1,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('ml','l',0.001,NULL,2,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('ul','l',0.000001,NULL,3,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('nl','l',0.000000001,NULL,4,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('pl','l',0.000000000001,NULL,5,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('g','g',1,NULL,6,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('mg','g',0.001,NULL,7,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('ug','g',0.000001,NULL,8,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('ng','g',0.000000001,NULL,9,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('pg','g',0.000000000001,NULL,10,'2016-12-30 18:05:15','2016-12-30 18:05:15');
/*!40000 ALTER TABLE `units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `upload`
--

DROP TABLE IF EXISTS `upload`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `upload` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `upload`
--

LOCK TABLES `upload` WRITE;
/*!40000 ALTER TABLE `upload` DISABLE KEYS */;
/*!40000 ALTER TABLE `upload` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `name` varchar(255) DEFAULT NULL,
  `FK_Employee__ID` varchar(255) DEFAULT NULL,
  `access` enum('public','lab','research','lab admin','admin') DEFAULT 'lab',
  `email` varchar(255) DEFAULT NULL,
  `encryptedPassword` varchar(255) DEFAULT NULL,
  `status` enum('inactive','pending','active') DEFAULT 'pending',
  `lastLoggedIn` date DEFAULT NULL,
  `gravatarUrl` varchar(255) DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('DemoUser','1','admin','demo@domain.com','$2a$10$sH7xUsFHRwg2JmFeLeadvOGyp/forjLIjQo5Jvu1bubCCIhsXyrKC','active','1970-01-01',NULL,1,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('Guest','1','admin','guest@domain.com','$2a$10$sH7xUsFHRwg2JmFeLeadvOGyp/forjLIjQo5Jvu1bubCCIhsXyrKC','active','1970-01-01',NULL,2,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('Admin','1','admin','admin@domain.com','$2a$10$sH7xUsFHRwg2JmFeLeadvOGyp/forjLIjQo5Jvu1bubCCIhsXyrKC','active','1970-01-01',NULL,3,'2016-12-30 18:05:15','2016-12-30 18:05:15'),('Ran','1','admin','ran.guin@gmail.com','$2a$10$sH7xUsFHRwg2JmFeLeadvOGyp/forjLIjQo5Jvu1bubCCIhsXyrKC','active','2016-12-31','http://www.gravatar.com/avatar/e1974155800a61bd008be54b09821a42?',4,'2016-12-31 17:00:51','2016-12-31 17:00:51');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-04-13 16:59:25
