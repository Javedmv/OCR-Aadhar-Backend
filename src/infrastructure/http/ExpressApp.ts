import express ,{ Application } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan"
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import ocrRouter from "./routes/ocr.routes"
import { env } from "../config/env";

export class ExpressApp{
    public readonly app:Application;
    
    constructor(){
        this.app = express();
        this.configure();
        this.routes();
        this.handleErrors();
    }
    private configure(){
        console.log(env.frontend,"frontend url");
        this.app.use(helmet());
        this.app.use(cors({
            origin: [
              `${env.frontend}`,
            ],
            methods:"*",
          }));
        this.app.use(express.json());
        this.app.use(morgan("dev"));
    }

    private routes(){
        this.app.get("/health",(req,res) => res.json({ok:true, message:"Server is good in health"}));
        this.app.use("/ocr",ocrRouter)
    }
    
    private handleErrors(){
        this.app.use(errorHandler);
        this.app.use(notFound)
    }
}