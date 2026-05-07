import { Router } from "express";
import * as salesController from "./sales.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/sales/stats - Get sales statistics
router.get("/stats", salesController.getSalesStats);

// GET /api/sales - Get all potential sales for the user
router.get("/", salesController.getPotentialSales);

// POST /api/sales - Add a new potential sale
router.post("/", salesController.addPotentialSale);

// PATCH /api/sales/:id - Update a potential sale
router.patch("/:id", salesController.updatePotentialSale);

// DELETE /api/sales/:id - Delete a potential sale
router.delete("/:id", salesController.deletePotentialSale);

export default router;
