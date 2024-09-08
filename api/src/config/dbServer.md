# Server Credentials

`dbServer.json` should be created in this directory using this template:
```
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

------------

***WARNING: Changing pwsalt will invalidate all passwords in database!*** 
Connection string replaces`%VAR`with`users[n].var`or`server.var`.
It also replaces`$VAR`with`process.env.var`.