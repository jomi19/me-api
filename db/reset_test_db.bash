$(> db/test.sqlite)
cat db/migrate_test.sql | sqlite3 db/test.sqlite

cat db/inserts.sql | sqlite3 db/test.sqlite


cat db/test.sql | sqlite3 db/test.sqlite