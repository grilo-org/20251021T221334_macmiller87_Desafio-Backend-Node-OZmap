import "reflect-metadata";
import { AppError } from "./utils/error/appError";
import { logger } from "./utils/logs/logs";
import { routes } from "./routes/index";
import "./utils/container/container";
import * as express from "express";

const app = express();

app.use(express.json());
app.use(routes);

app.use((erro: Error, request: express.Request, response: express.Response, next: express.NextFunction) => {

    const getLogs = (erro: Error) => {
        logger.error("App log error", { message: erro.message });
    } 

    getLogs(erro);

    if(erro instanceof AppError) {
        return response.status(erro.statusCode).json({ message: erro.message });
    }

    return response.status(500).json({
        status: "error",
        message: `Internal Server Error ${erro.message}`
    });

});

const host = process.env.HOST;
const port = process.env.PORT;

app.listen(port, () => console.log(`Server API is running at http://${host}:${port}`));
