import { GetDataDTO, IDatamodelRepository } from "../model/IdataModel";
import { inject, injectable } from "tsyringe";

@injectable()
export class DataService implements IDatamodelRepository {

    constructor(@inject("DataModelRepository") private dataModelRepository: IDatamodelRepository) {}

    async getData({ target, id }: GetDataDTO): Promise<Response> {

        const get = await this.dataModelRepository.getData({
            target,
            id
        });

        return get;
    }

    async sendDataToOZmap(rawData: string): Promise<Response> {
      const create = await this.dataModelRepository.sendDataToOZmap(rawData);
      return create;
    }

    async saveDataAtDB(rawData: string): Promise<Response> {
        const saveDataAtDB = await this.dataModelRepository.saveDataAtDB(rawData);
        return saveDataAtDB;
    }

}