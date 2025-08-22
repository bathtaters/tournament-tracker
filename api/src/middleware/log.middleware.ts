// Initialize logging on requests
import type { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import logger from "../utils/log.adapter";
import { morganLog } from "../config/meta";

function setupLogging(req: Request, res: Response, next: NextFunction) {
  // Log request
  logger.info("REQ:", req.method, req.originalUrl, req.body);

  // Log response
  res.sendAndLog = (...args) => {
    logger.info(
      "RES:",
      res.statusCode,
      req.originalUrl,
      ...args.map((a) =>
        typeof a !== "object" || a.error
          ? a
          : Object.keys(a).map((k) => (a[k] ? "" : "!") + k),
      ),
    );
    return res.send(...args);
  };

  // Bypass CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  return next();
}

function bypassLogging(_: Request, res: Response, next: NextFunction) {
  res.sendAndLog = res.send;
  return next();
}

export default morganLog?.toLowerCase() === "debug"
  ? setupLogging
  : [bypassLogging, morgan(morganLog || "combined")];

declare module "express-serve-static-core" {
  interface Response {
    sendAndLog: Response["send"];
  }
}
