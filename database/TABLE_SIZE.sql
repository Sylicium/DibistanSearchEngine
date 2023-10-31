
SELECT table_schema "Base de données", 
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) "Taille (Mo)" 
FROM information_schema.tables 
GROUP BY table_schema;


SELECT size FROM (SELECT table_schema "database", 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) "size" 
      FROM information_schema.tables 
      GROUP BY table_schema) as tb WHERE tb.database="dibim";


INSERT INTO links VALUES (1, "title", "https://dibistan.fandom.com/fr/wiki/Wiki_Dibistan", 1698279794084, 0, 1);