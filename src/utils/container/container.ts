import { DataModelRepository } from "../../model/dataModel";
import { IDatamodelRepository } from "../../model/IdataModel";
import { container } from "tsyringe";

container.registerSingleton<IDatamodelRepository>(
    "DataModelRepository",
    DataModelRepository
);

