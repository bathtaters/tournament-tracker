#!/bin/sh

### SET THESE PARAMETERS ###

# Path to where this file resides (No trailing slash!)
repopath="/path/to/repo/tournament-tracker"

# Path to where the server serves built pages (No trailing slash!)
livepath="/var/www/tournament-tracker"

# Name of API service in PM2
apiname="tournament-tracker-api"




### SCRIPT ###

set -e

# Update code
cd "$repopath"
git pull

# Update API
echo
echo " *** UPDATING API *** "
cd "$repopath/api"
npm install
npm update

# Update Client
echo
echo " *** UPDATING CLIENT *** "
cd "$repopath/client"
npm install
npm update
npm run build

# Deploy Client
echo
echo " *** DEPLOYING CLIENT *** "
if [ -d "$livepath" ]; then
    mv -f "$livepath" "$livepath-old"
    echo "> Old client backed up: $livepath-old"
else
    echo "> Old client not found"
fi

cp -a "$repopath/client/build" "$livepath" && echo "> New client build is live."

# Deploy API
echo
echo " *** DEPLOYING API *** "
pm2 stop "$apiname"
pm2 start "$apiname"
pm2 logs "$apiname"

echo
echo " *** UPDATED AND DEPLOYED SUCCESSFULLY *** "