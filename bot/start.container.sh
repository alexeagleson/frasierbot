#run the setup script to create the DB and the schema in the DB
#do this in a loop because the timing for when the SQL instance is ready is indeterminate
for i in {1..50};
do
    /opt/mssql-tools/bin/sqlcmd -S $DB_DOMAIN -U $DB_USERNAME -P $SA_PASSWORD -d master -i ./sql/create-db.sql
    if [ $? -eq 0 ]
    then
        echo "/sql/create-db.sql completed"
        break
    else
        echo "not ready yet..."
        sleep 1
    fi
done

for i in {1..50};
do
    /opt/mssql-tools/bin/sqlcmd -S $DB_DOMAIN -U $DB_USERNAME -P $SA_PASSWORD -d $DB_NAME -i ./sql/create-table.sql
    if [ $? -eq 0 ]
    then
        echo "sql/create-table.sql completed"
        break
    else
        echo "not ready yet..."
        sleep 1
    fi
done

#import the data from the csv file
/opt/mssql-tools/bin/bcp "$DB_NAME".dbo.Nouns in "/usr/src/app/csv/Nouns.csv" -c -t',' -S $DB_DOMAIN -U $DB_USERNAME -P $SA_PASSWORD
/opt/mssql-tools/bin/bcp "$DB_NAME".dbo.Verbs in "/usr/src/app/csv/Verbs.csv" -c -t',' -S $DB_DOMAIN -U $DB_USERNAME -P $SA_PASSWORD
/opt/mssql-tools/bin/bcp "$DB_NAME".dbo.Adjectives in "/usr/src/app/csv/Adjectives.csv" -c -t',' -S $DB_DOMAIN -U $DB_USERNAME -P $SA_PASSWORD
/opt/mssql-tools/bin/bcp "$DB_NAME".dbo.Adverbs in "/usr/src/app/csv/Adverbs.csv" -c -t',' -S $DB_DOMAIN -U $DB_USERNAME -P $SA_PASSWORD
/opt/mssql-tools/bin/bcp "$DB_NAME".dbo.Characters in "/usr/src/app/csv/Characters.csv" -c -t',' -S $DB_DOMAIN -U $DB_USERNAME -P $SA_PASSWORD
/opt/mssql-tools/bin/bcp "$DB_NAME".dbo.Exclamations in "/usr/src/app/csv/Exclamations.csv" -c -t',' -S $DB_DOMAIN -U $DB_USERNAME -P $SA_PASSWORD
/opt/mssql-tools/bin/bcp "$DB_NAME".dbo.Quotes in "/usr/src/app/csv/Quotes.csv" -c -t',' -S $DB_DOMAIN -U $DB_USERNAME -P $SA_PASSWORD

yarn introspect
yarn generate

if [ "$NODE_ENV" == "production" ]
then
    echo "Starting Frasierbot production build..."
    yarn start:production
else
    echo "Starting Frasierbot development build..."
    yarn start:development
fi

# keep the container alive
# tail -f /dev/null