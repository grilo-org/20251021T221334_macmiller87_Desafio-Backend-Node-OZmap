import { Request, Response } from "express";
import { logger } from "../logs/logs";
import * as fs from "fs";

const url = process.env.ORIGIN_MOCKDB_URL;

export const objectResponse = [];

export async function SheduleDataJob(request: Request, response: Response) {

    const mockDBColumns = ["cables", "drop_cables", "boxes", "customers"];

    let count = 0;

    do {
        await fetch(`${url}/${mockDBColumns[count]}`, {

        }).then(async (response) => {
            const resp = await response.json();
            
            objectResponse.push({
                [mockDBColumns[count]]: resp
            });

            return resp;
        });

        count++;

    }while(mockDBColumns.length > count);

    fs.writeFileSync("./src/utils/copy-mock-database/base_data.json", JSON.stringify(objectResponse, null, 2));

    const getLogs = async (objectResponse: any) => {
        logger.info("GetAutoData Route log", { objectResponse });
    } 

    await getLogs(objectResponse);

    return response.status(201).json({ 
        message: "Work Done !",
        data: objectResponse
    });
    
}