import dotenv from 'dotenv';
dotenv.config();

export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 3000),
    HF_API_KEY: process.env.HF_API_KEY,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL
};