export interface GetDataDTO {
    target: string,
    id: string
}

export interface IDatamodelRepository {
    getData({target, id}: GetDataDTO): Promise<Response>;
    sendDataToOZmap(rawData: string): Promise<Response>;
    saveDataAtDB(rawData: string): Promise<Response>;
}