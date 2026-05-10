import { Router } from "express";
import * as salesController from "./ventes.controleur";
import { authenticate } from "../../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/ventes/statistiques - Get sales statistics
router.get("/statistiques", salesController.getSalesStats);

// GET /api/ventes - Get all planned sales for the user
router.get("/", salesController.getPlannedSales);

// POST /api/ventes - Add a new planned sale
router.post("/", salesController.addPlannedSale);

// PATCH /api/ventes/:id - Update a planned sale
router.patch("/:id", salesController.updatePlannedSale);

// PATCH /api/ventes/:id/completer - Mark a sale as completed
router.patch("/:id/completer", salesController.markSaleAsCompleted);

// DELETE /api/ventes/:id - Delete a planned sale
router.delete("/:id", salesController.deletePlannedSale);

export default router;
