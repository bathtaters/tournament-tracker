import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from "prom-client";
import logger from "../utils/log.adapter";

const connect = require("../db/admin/connect");

export const register = new Registry();
collectDefaultMetrics({ register });

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests received",
  labelNames: ["method", "route", "status"] as const,
  registers: [register],
});

export const httpRequestDurationSeconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status"] as const,
  registers: [register],
});

new Gauge({
  name: "pg_pool_total",
  help: "Total clients in the pg pool (idle + in-use)",
  registers: [register],
  collect() {
    try {
      this.set(connect.staticPool().totalCount ?? 0);
    } catch {
      /* pool not yet initialized */
    }
  },
});

new Gauge({
  name: "pg_pool_idle",
  help: "Idle clients in the pg pool",
  registers: [register],
  collect() {
    try {
      this.set(connect.staticPool().idleCount ?? 0);
    } catch {
      /* noop */
    }
  },
});

new Gauge({
  name: "pg_pool_waiting",
  help: "Pending client requests waiting for a pg pool connection",
  registers: [register],
  collect() {
    try {
      this.set(connect.staticPool().waitingCount ?? 0);
    } catch {
      /* noop */
    }
  },
});

async function scalarQuery(sql: string): Promise<number> {
  return connect.runOperation(async (client: any) => {
    const res = await client.query(sql);
    const row = res?.rows?.[0];
    if (!row) return 0;
    return Number(Object.values(row)[0]) || 0;
  });
}

new Gauge({
  name: "sessions_active",
  help: "Number of unexpired rows in the session table",
  registers: [register],
  async collect() {
    try {
      this.set(
        await scalarQuery("SELECT count(*) FROM session WHERE expire > now()"),
      );
    } catch (e) {
      logger.warn("metrics: sessions_active collect failed:", e);
    }
  },
});

new Gauge({
  name: "players_total",
  help: "Total rows in the player table",
  registers: [register],
  async collect() {
    try {
      this.set(await scalarQuery("SELECT count(*) FROM player"));
    } catch (e) {
      logger.warn("metrics: players_total collect failed:", e);
    }
  },
});
