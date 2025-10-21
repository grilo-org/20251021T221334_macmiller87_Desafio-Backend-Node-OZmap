import { GeoJSONFeatureCollection } from "src/utils/interfaces/ozmap_output_Interfaces";
import { GetDataDTO, IDatamodelRepository } from "./IdataModel";
import { AppError } from "../utils/error/appError";
import { PrismaClient } from "@prisma/client";
import OZMapSDK from "@ozmap/ozmap-sdk";

const prismaService = new PrismaClient();
const mockDb = process.env.ORIGIN_MOCKDB_URL;
export class DataModelRepository implements IDatamodelRepository {

    async getData({ target, id }: GetDataDTO): Promise<Response>  {

        const request = await fetch(`${mockDb}/${target}/${id}`, {
            method: "GET"

        }).then((response) => {
            const resp = response.json();
            return resp;
        });

        return request; 
    }

    async sendDataToOZmap(rawData: string): Promise<Response | any> {
        const geojson: GeoJSONFeatureCollection = JSON.parse(rawData);
        
        const sdk = new OZMapSDK(process.env.OZMAP_OUTPUT_MOCKDB_URL, {
            apiKey: process.env.API_KEY,
        });

        let resp: any[] = [];

        for(const feature of geojson.features) {
            
            const { entity, ...properties } = feature.properties;

            let create: any;

            switch(entity) {
                
                case "boxes":
                    create = await sdk.box.create({
                        project: "Desaafio Backend OZmap",
                        hierarchyLevel: properties.id,
                        name: properties.name,
                        boxType: properties.type,
                        coords: [properties.lat, properties.lng],                       
                        implanted: true

                    }).catch((error) => {
                        return error.message;
                    });
                    break;

                case "customers":
                    create = await sdk.pop.create({
                        project: "Desaafio Backend OZmap",
                        hierarchyLevel: properties.id,
                        name: properties.name,
                        address: properties.address,
                        external_id: properties.box_id,
                        implanted: true,
                        popType: "popTypeId",
                        coords: []

                    }).catch((error) => {
                        return error.message;
                    });
                    break;

                case "cables":
                    create = await sdk.cable.create({
                        project: "Desaafio Backend OZmap",
                        hierarchyLevel: properties.id,
                        name: properties.name,
                        implanted: true,
                        poles: [properties.lat, properties.lng],
                        cableType: "cableTypeId"

                    }).catch((error) => {
                        return error.message;
                    });
                    break;

                case "drop_cables":
                    create = await sdk.pop.create({
                        project: "Desaafio Backend OZmap",
                        hierarchyLevel: properties.id,
                        name: properties.name,
                        external_id: properties.box_id,
                        coords: [properties.lat, properties.lng],
                        implanted: true,
                        popType: "popTypeId",

                    }).catch((error) => {
                        return error.message;
                    });
                    break;

                default:
                    new AppError("Entity not found !", 404);
                    break;
            }

            resp.push({
                feature
            });

        }

        return resp;
    }

    async saveDataAtDB(rawData: string): Promise<Response | any> {
        const geojson: GeoJSONFeatureCollection = JSON.parse(rawData);

        let resp: any[] = [];

        for(const feature of geojson.features) {

            const { entity, ... properties } = feature.properties;
            const { ... path } = feature;

            let create: any;

            if(entity === "boxes") {

                create = await prismaService.boxes.createMany({
                    data: {
                        entity: entity,
                        id: properties.id,
                        name: properties.name,
                        type: properties.type,
                        coords: [properties.lat, properties.lng]
                    }
                });

            }

            if(entity === "customers") {

                create = await prismaService.customers.createMany({
                    data: {
                        entity: entity,
                        id: properties.id,
                        code: properties.code,
                        name: properties.name,
                        address: properties.address,
                        box_id: properties.box_id
                    }
                });
            }

            if(entity === "cables") {

                create = await prismaService.cables.createMany({
                    data: {
                        entity: entity,
                        id: properties.id,
                        name: properties.name,
                        capacity: properties.capacity,
                        boxes_connected: properties.boxes_connected,
                        path: path.path.coordinates
                    }
                });
            }

            if(entity === "drop_cables") {
                
                create = await prismaService.dropCables.createMany({
                    data: {
                        entity: entity,
                        id: properties.id,
                        name: properties.name,
                        box_id: properties.box_id,
                        customer_id: properties.customer_id
                    }
                });
            }

            resp.push({
                feature
            });

        }

        return resp;
    }

}