# Server Credentials

`dbServer.json` should be created in this directory using this template:
```json
{
	"connectionString": "%PROTO://%NAME:%PASS@%DOM:%PORT/%DB?sslmode=%MODE&sslrootcert=%CERT&options=%OPTS",
	"users": [
		{ "name": "dbUser", "pass": "password123" },
		{ "name": "api",    "pass": "password456" },
	],
	"server": {
		"proto": "postgresql",
		"dom": "sqlserver.domain.com",
		"port": "26257",
		"db": "dbname",
		"mode": "verify-full",
		"cert": "$HOME/.postgresql/root.crt",
		"opts": ""
	},
	"pwsalt": "[random string]",
	"sessionSecret": "[random string]"
}
```

Or for a locally run database *(Dev ONLY!)*:
```json
{
	"connectionString": "%PROTO://%NAME@%DOM:%PORT/%DB?sslmode=%MODE",
	"users": [
		{ "name": "api", "pass": "[ignored w/o SSL]" },
	],
	"server": {
		"proto": "postgresql",
		"dom": "localhost",
		"port": "26257",
		"db": "dbname",
		"mode": "disable",
		"cert": "",
		"opts": ""
	},
	"pwsalt": "[random string]",
	"sessionSecret": "[random string]"
}

```

###### NOTE: Run using `npm run devdb`, initialize using `npm run initdb`.

## Additional Notes

- ***Changing pwsalt will invalidate all passwords in database.*** 
- Connection string replaces`%VAR`with`users[n].var`or`server.var`.
- It also replaces`$VAR`with`process.env.var`.
- If you are having trouble connecting to a brand new Database, try running [`initDB.sh`](./initDB.sh) using one of the following formats:

```sh
./api/src/config/initDB.sh --url "<Paste URL to DB>"

./api/src/config/initDB.sh --host=$IP:$PORT --user=$USER --database=$DBNAME --insecure
# For secure connection use --certs-dir=/path/to/certs instead of --insecure
```
