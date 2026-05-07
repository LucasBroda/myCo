import type { Request, Response } from "express";
import * as salesService from "./sales.service";
import type { CardCondition } from "../../types/models";

export async function getPotentialSales(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const sales = await salesService.getPotentialSales(userId);
    res.json(sales);
  } catch (error) {
    console.error("Error fetching potential sales:", error);
    res.status(500).json({ error: "Failed to fetch potential sales" });
  }
}

export async function addPotentialSale(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { cardId, setId, salePrice, saleDate, condition, notes } = req.body;

    if (!cardId || !setId || !salePrice || !saleDate || !condition) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const sale = await salesService.addPotentialSale(
      userId,
      cardId,
      setId,
      Number.parseFloat(salePrice),
      saleDate,
      condition as CardCondition,
      notes || null,
    );

    res.status(201).json(sale);
  } catch (error) {
    console.error("Error adding potential sale:", error);
    res.status(500).json({ error: "Failed to add potential sale" });
  }
}

export async function updatePotentialSale(req: Request, res: Response) {
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

    const sale = await salesService.updatePotentialSale(
      userId,
      id,
      Number.parseFloat(salePrice),
      saleDate,
      condition as CardCondition,
      notes || null,
    );

    res.json(sale);
  } catch (error) {
    console.error("Error updating potential sale:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to update potential sale" });
  }
}

export async function deletePotentialSale(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Invalid sale ID" });
      return;
    }

    await salesService.deletePotentialSale(userId, id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting potential sale:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to delete potential sale" });
  }
}
