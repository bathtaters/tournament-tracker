# tournament-tracker

Track and schedule tournaments. Generate pairings and aggregate statistics.

### Instructions

1. Create a new database using [CockroachDB](https://github.com/cockroachdb/cockroach).
2. See [/api/src/config/dbServer.md](/api/src/config/dbServer.md) to connect/configure the database.
3. Start both the API and Client packages.
4. Navigate to the `/setup` endpoint in your browser (At whatever domain the Client is hosted on) to create the initial user account.
   - NOTE: After this is created, the `/setup` endpoint will become unavailable.
5. Login and begin setting up the app.
