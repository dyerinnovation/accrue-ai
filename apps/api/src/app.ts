import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { apiRateLimit } from "./middleware/rate-limit.middleware.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(apiRateLimit);

  app.use("/api", routes);

  app.use(errorMiddleware);

  return app;
}
