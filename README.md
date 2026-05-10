# tournament-tracker

Track and schedule tournaments. Generate pairings and aggregate statistics.

### Admin Instructions

1. Create a new database using [CockroachDB](https://github.com/cockroachdb/cockroach).
2. See [/api/src/config/dbServer.md](/api/src/config/dbServer.md) to connect/configure the database.
3. Start both the API and Client packages.
4. Navigate to the `/setup` endpoint in your browser (At whatever domain the Client is hosted on) to create the initial
   user account.
    - NOTE: After this is created, the `/setup` endpoint will become unavailable.
5. Login and begin setting up the app.

## Development Environment

This repository contains both the API and client apps.

### Prerequisites

- Node.js w/ npm installed on your machine.
- Podman or Docker Compose installed on your machine (For testing the build locally).
- A created and configured CockroachDB database.
    - See [/api/src/config/dbServer.md](/api/src/config/dbServer.md) to connect/configure the database.
    - If hosting locally, install CockroachDB, then use `npm run devdb` & `npm run initdb`
      in [/api/package.json](/api/package.json).

### Run From Source

This will run the API server and client apps from the source code,
watching for changes and updating the app on the fly.

1. Start CockroachDB if hosted locally (`npm run devdb` in [API](/api/package.json)).
2. Start the API server (`npm run dev` in [API](/api/package.json)).
3. Start the client application (`npm run start` in [client](/client/package.json)).
    - Optionally run `npm run start:react` & `npm run watch:css` if you wish to have individual terminals for each.
4. Navigate to http://localhost:3000 to view the application (See [Admin Instructions](#admin-instructions) for initial
   setup).

### Run Built App

This will serve static content from ./client/build and forward API requests
to your TS compiled API server.

1. Ensure the CockroachDB database is running if hosted locally.
2. Ensure that Docker or Podman is running (`podman machine start`).
3. Build the client app (`npm run build` in [client](/client/package.json)).
4. Build & Run the API server (`npm run build` & `npm run start` in [API](/api/package.json)).
5. Start the NGINX container (`docker compose up` or `podman compose up` in the root directory).
6. Navigate to http://localhost:3000 to view the application.
