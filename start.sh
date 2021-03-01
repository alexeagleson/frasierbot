printf "Rebuilding and starting the containers...\n"
docker-compose --env-file .env up --build --remove-orphans --force-recreate