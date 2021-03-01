printf "Logging into DB as $DB_USERNAME\n"
/opt/mssql-tools/bin/sqlcmd -S $DB_DOMAIN -U $DB_USERNAME -d $DB_NAME -P $SA_PASSWORD