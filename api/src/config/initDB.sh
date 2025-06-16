#!/bin/bash

cockroach sql "$@" \
    -e "CREATE USER IF NOT EXISTS api;" \
    -e "GRANT admin TO api;" \
    -e "CREATE ROLE IF NOT EXISTS db_admin;" \
    -e "CREATE ROLE IF NOT EXISTS db_rw;" \
    -e "CREATE ROLE IF NOT EXISTS db_read;"