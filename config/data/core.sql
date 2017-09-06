CREATE TABLE `User` (
  `name` varchar(255) DEFAULT NULL,
  `FK_Employee__ID` varchar(255) DEFAULT NULL,
  `access` enum('public','lab','research','lab admin','admin') DEFAULT 'lab',
  `email` varchar(255) DEFAULT NULL,
  `encryptedPassword` varchar(255) DEFAULT NULL,
  `status` enum('inactive','pending','active') DEFAULT 'pending',
  `lastLoggedIn` date DEFAULT NULL,
  `gravatarUrl` varchar(255) DEFAULT NULL,
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) 
