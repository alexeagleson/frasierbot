FROM mcr.microsoft.com/mssql/server

# Switch to root user for access to apt-get install
USER root

# Install node/npm
RUN apt-get -y update  && \
        apt-get install -y curl && \
        curl -sL https://deb.nodesource.com/setup_15.x | bash - && \
        apt-get install -y nodejs && \
        # apt-get install -y yarn && \
        apt-get install -y dos2unix

RUN npm install -g yarn

RUN yarn global add pm2
RUN yarn global add prisma

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

RUN dos2unix *

RUN yarn install

# RUN prisma introspect

# Grant permissions for the import-data script to be executable
RUN chmod +x /usr/src/app/start.container.sh

# Switch back to mssql user and run the entrypoint script
# USER mssql
ENTRYPOINT /bin/bash ./entrypoint.sh
