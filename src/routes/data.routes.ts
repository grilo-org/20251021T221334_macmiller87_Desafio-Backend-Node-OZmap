import { DataController } from "../controller/dataController";
import { Router } from "express";

export const dataRoutes = Router();

const dataController = new DataController();

dataRoutes.get("/getData/:id", dataController.getData);
dataRoutes.post("/getAutoData", dataController.getAutoData);
dataRoutes.post("/tranformData", dataController.tranformData);
dataRoutes.post("/sendDataToOZmap", dataController.sendDataToOZmap);
dataRoutes.post("/saveDataAtDB", dataController.saveDataAtDB);