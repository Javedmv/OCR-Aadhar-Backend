import dotenv from 'dotenv';
dotenv.config();

export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 3000),
    HF_API_KEY: process.env.HF_API_KEY,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    frontend: process.env.frontend ?? "http://localhost:5173"
};