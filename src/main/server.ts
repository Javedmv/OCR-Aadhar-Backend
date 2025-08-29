import { env } from "../infrastructure/config/env";
import { ExpressApp } from "../infrastructure/http/ExpressApp";
import { logger } from "../infrastructure/config/logger";


const server = new ExpressApp().app;

server.listen(env.port, () => {
logger.info(`Server listening Ports:${env.port}`);
});