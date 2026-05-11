/// <reference types="./types" />

import express from "express";
import logger from "./utils/log.adapter";
import { missingError } from "./config/constants";
import { apiVersion as version, env, name, port } from "./config/meta";

// Startup/Middleware
import initServices from "./services/init.services";
import sessionMiddleware from "./middleware/session.middleware";
import logMiddleware from "./middleware/log.middleware";
import unescapeMiddleware from "./middleware/unescape.middleware";
import errorMiddleware from "./middleware/error.middleware";
import metricsMiddleware from "./middleware/metrics.middleware";

// Routes
import base from "./routes/base.routes";
import metrics from "./routes/metrics.routes";
import event from "./routes/event.routes";
import match from "./routes/match.routes";
import player from "./routes/player.routes";
import team from "./routes/team.routes";
import session from "./routes/session.routes";
import voter from "./routes/voter.routes";
import plan from "./routes/plan.routes";

const app = express();

// Setup middleware
env === "production" && app.set("trust proxy", 1);
app.use(express.json());
app.use("/api/metrics", metrics);
app.use(sessionMiddleware);
app.use(logMiddleware);
app.use(unescapeMiddleware);
app.use(metricsMiddleware);

// Setup routes
app.use(`/api/v${version}`, base);
app.use(`/api/v${version}/event`, event);
app.use(`/api/v${version}/match`, match);
app.use(`/api/v${version}/player`, player);
app.use(`/api/v${version}/team`, team);
app.use(`/api/v${version}/session`, session);
app.use(`/api/v${version}/voter`, voter);
app.use(`/api/v${version}/plan`, plan);
app.use("/api/version", (_, res) => res.sendAndLog({ version }));

// Error handling
app.use(() => {
  throw missingError;
});
app.use(errorMiddleware);

// Initialize General
if (process.env.NODE_ENV === "development") {
  import("./config/exportToClient");
}
initServices().then(() => {
  // Start server
  app.listen(port, (err: any) => {
    if (err) logger.error("Exiting due to:", err);
    else
      logger.log(`${name} (v${version}) started. Listening on port ${port}.`);
  });
});
