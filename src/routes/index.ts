import { dataRoutes } from "./data.routes";
import { Router } from "express";

export const routes = Router();

routes.use(dataRoutes);