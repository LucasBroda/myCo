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

// Crée une application Express
const app = express();

// Permet l'ajout d'en-têtes HTTP de sécurité afin de protéger l'application contre les attaques XSS, le clickjacking etc
app.use(helmet());

// Permet la communication avec le front qui est sur le port http://localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
// Parse les corps de requête JSON
app.use(express.json());
// Parse les cookies des requêtes HTTP
app.use(cookieParser());

// Permet de check que l'API est disponible
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Permet de créer les différentes routes de l'application grâce aux différentes routes définies par chaques modules
app.use("/api/auth", authRoutes);
app.use("/api/cards", cardsRoutes);
app.use("/api/collection", collectionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/market", marketRoutes);

// Permet d'utiliser la fonction de trappeur d'erreur
app.use(errorHandler);

export default app;
