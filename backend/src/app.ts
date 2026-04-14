import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import "express-async-errors";
import helmet from "helmet";

import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import cardsRoutes from "./modules/cards/cards.routes";
import collectionRoutes from "./modules/collection/collection.routes";
import marketRoutes from "./modules/market/market.routes";
import profileRoutes from "./modules/profile/profile.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cards", cardsRoutes);
app.use("/api/collection", collectionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/market", marketRoutes);

app.use(errorHandler);

export default app;
