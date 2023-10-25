
-- dibim.links definition

CREATE TABLE `links` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  `url` varchar(512) NOT NULL,
  `createdAt` bigint(20) unsigned NOT NULL,
  `lastFetch` bigint(20) unsigned NOT NULL,
  `fetchCount` int(10) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
);

-- dibim.keywords definition

CREATE TABLE `keywords` (
  `keyword_id` bigint(20) unsigned NOT NULL,
  `value` varchar(50) DEFAULT NULL,
  `createdAt` bigint(20) unsigned DEFAULT NULL
);

-- dibim.keyword_in_link definition

CREATE TABLE `keyword_in_link` (
  `link_id` bigint(20) unsigned NOT NULL,
  `keyword_id` varchar(100) NOT NULL,
  `weight` tinyint(6) NOT NULL
);