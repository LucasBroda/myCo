import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import "express-async-errors";
import helmet from "helmet";

import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/authentification/authentification.routes";
import cardsRoutes from "./modules/cartes/cartes.routes";
import collectionRoutes from "./modules/collection/collection.routes";
import marketRoutes from "./modules/marche/marche.routes";
import profileRoutes from "./modules/profil/profil.routes";
import salesRoutes from "./modules/ventes/ventes.routes";

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

app.get("/api/sante", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/authentification", authRoutes);
app.use("/api/cartes", cardsRoutes);
app.use("/api/collection", collectionRoutes);
app.use("/api/profil", profileRoutes);
app.use("/api/marche", marketRoutes);
app.use("/api/ventes", salesRoutes);

app.use(errorHandler);

export default app;
