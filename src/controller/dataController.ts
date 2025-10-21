import { InputData, transformToOZmap } from "../utils/interfaces/ozmap_output_Interfaces";
import { SheduleDataJob } from "../utils/scheduleJob/dataScheduleJob";
import { DataService } from "../service/dataService";
import { AppError } from "../utils/error/appError";
import { Request, Response } from "express";
import { scheduleJob } from "node-schedule"
import { logger } from "../utils/logs/logs";
import { container } from "tsyringe";
import * as fs from "fs";

export class DataController {

    async getData(request: Request, response: Response): Promise<Response> {

        const { id } = request.params;
        const { target } = request.body;

        if(target === "" || id === "") {
            throw new AppError("All data must have a value !", 401);

        }else if(typeof(target) !== "string") {
            throw new AppError("Target must be a string !", 401);
        }

        const dataService = container.resolve(DataService);

        const checkData = await dataService.getData({
            target,
            id
        });

        return response.status(200).json({
            target: target,
            data: checkData
        });
    }
    
    async getAutoData(request: Request, response: Response): Promise<void> {

        const timer = process.env.TIMER;

        scheduleJob(timer, async () => {
           await SheduleDataJob(request, response); 
        });
        
    }

    async tranformData(request: Request, response: Response): Promise<Response> {

        const rawData = fs.readFileSync("./src/utils/copy-mock-database/base_data.json", "utf-8");
        const rawArray = JSON.parse(rawData) as any[];

        const inputData: InputData = {
            cables: rawArray.find((obj) => obj.cables)?.cables || [],
            drop_cables: rawArray.find((obj) => obj.drop_cables)?.drop_cables || [],
            boxes: rawArray.find((obj) => obj.boxes)?.boxes || [],
            customers: rawArray.find((obj) => obj.customers)?.customers || [],
        };

        const ozmapData = transformToOZmap(inputData);

        const getLogs = async (ozmapData: any) => {
            logger.info("TranformData Route log", { ozmapData });
        } 

        await getLogs(ozmapData);

        fs.writeFileSync("./src/utils/copy-mock-database/ozmap_output/ozmap_output.json", JSON.stringify(ozmapData, null, 2));

        return response.status(201).json({ message: "Transformation completed! File saved !" });
    }

    async sendDataToOZmap(request: Request, response: Response): Promise<Response> {

        const rawData = fs.readFileSync("src/utils/copy-mock-database/ozmap_output/ozmap_output.json", "utf-8");

        const dataService = container.resolve(DataService);
        const sendGeoJSONToOZmap = await dataService.sendDataToOZmap(rawData);

        const getLogs = async (sendGeoJSONToOZmap: any) => {
            logger.info("OZmap log", { sendGeoJSONToOZmap });
        } 

        await getLogs(sendGeoJSONToOZmap);
        
        return response.status(201).json(sendGeoJSONToOZmap);
    }

    async saveDataAtDB(request: Request, response: Response): Promise<Response> {
        const rawData = fs.readFileSync("src/utils/copy-mock-database/ozmap_output/ozmap_output.json", "utf-8");

        const dataService = container.resolve(DataService);
        const saveDataAtDB = await dataService.saveDataAtDB(rawData);

         const getLogs = async (saveDataAtDB: any) => {
            logger.info("Db log", { saveDataAtDB });
        } 

        await getLogs(saveDataAtDB);

        return response.status(201).json(saveDataAtDB);
    }

}