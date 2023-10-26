
SELECT table_schema "Base de données", 
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) "Taille (Mo)" 
FROM information_schema.tables 
GROUP BY table_schema;