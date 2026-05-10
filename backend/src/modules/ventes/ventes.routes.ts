import { Router } from "express";
import * as salesController from "./ventes.controleur";
import { authenticate } from "../../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/sales/stats - Get sales statistics
router.get("/stats", salesController.getSalesStats);

// GET /api/sales - Get all planned sales for the user
router.get("/", salesController.getPlannedSales);

// POST /api/sales - Add a new planned sale
router.post("/", salesController.addPlannedSale);

// PATCH /api/sales/:id - Update a planned sale
router.patch("/:id", salesController.updatePlannedSale);

// PATCH /api/sales/:id/complete - Mark a sale as completed
router.patch("/:id/complete", salesController.markSaleAsCompleted);

// DELETE /api/sales/:id - Delete a planned sale
router.delete("/:id", salesController.deletePlannedSale);

export default router;
