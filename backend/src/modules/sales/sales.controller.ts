import type { Request, Response } from "express";
import * as salesService from "./sales.service";
import type { CardCondition } from "../../types/models";

export async function getPlannedSales(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const sales = await salesService.getPlannedSales(userId);
    res.json({ data: sales });
  } catch (error) {
    console.error("Error fetching planned sales:", error);
    res.status(500).json({ error: "Failed to fetch planned sales" });
  }
}

export async function addPlannedSale(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { cardId, setId, salePrice, saleDate, condition, notes } = req.body;

    if (!cardId || !setId || !salePrice || !saleDate || !condition) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const sale = await salesService.addPlannedSale(
      userId,
      cardId,
      setId,
      Number.parseFloat(salePrice),
      saleDate,
      condition as CardCondition,
      notes || null,
    );

    res.status(201).json({ data: sale });
  } catch (error) {
    console.error("Error adding planned sale:", error);
    res.status(500).json({ error: "Failed to add planned sale" });
  }
}

export async function updatePlannedSale(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { salePrice, saleDate, condition, notes } = req.body;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Invalid sale ID" });
      return;
    }

    if (!salePrice || !saleDate || !condition) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const sale = await salesService.updatePlannedSale(
      userId,
      id,
      Number.parseFloat(salePrice),
      saleDate,
      condition as CardCondition,
      notes || null,
    );

    res.json({ data: sale });
  } catch (error) {
    console.error("Error updating planned sale:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to update planned sale" });
  }
}

export async function deletePlannedSale(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Invalid sale ID" });
      return;
    }

    await salesService.deletePlannedSale(userId, id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting planned sale:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to delete planned sale" });
  }
}

export async function markSaleAsCompleted(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Invalid sale ID" });
      return;
    }

    const sale = await salesService.markSaleAsCompleted(userId, id);
    res.json({ data: sale });
  } catch (error) {
    console.error("Error marking sale as completed:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to mark sale as completed" });
  }
}

export async function getSalesStats(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const stats = await salesService.getSalesStats(userId);
    res.json({ data: stats });
  } catch (error) {
    console.error("Error fetching sales stats:", error);
    res.status(500).json({ error: "Failed to fetch sales stats" });
  }
}
