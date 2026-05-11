import type { NextFunction, Request, Response } from "express";
import {
  httpRequestsTotal,
  httpRequestDurationSeconds,
} from "../services/metrics.service";

export default function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const end = httpRequestDurationSeconds.startTimer();
  res.on("finish", () => {
    const route =
      req.route?.path ?? (req.baseUrl ? req.baseUrl : req.originalUrl ?? "");
    const labels = {
      method: req.method,
      route: String(route) || "unknown",
      status: String(res.statusCode),
    };
    httpRequestsTotal.inc(labels);
    end(labels);
  });
  next();
}
