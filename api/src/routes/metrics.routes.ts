import { Router } from "express";
import { register } from "../services/metrics.service";
import { metricsToken } from "../config/meta";

const router = Router();

router.get("/", async (req, res) => {
  if (!metricsToken) {
    res.status(503).send("metrics disabled");
    return;
  }
  if (req.headers.authorization !== `Bearer ${metricsToken}`) {
    res.status(401).send("unauthorized");
    return;
  }
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});

export default router;
