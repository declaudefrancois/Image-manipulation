import { Channel } from "amqplib";

export {};

declare global {
  namespace Express {
    export interface Request {
      channel: Channel;
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      MONGODB_URI: string;
      DB_NAME: string;
      SERVER_URL: string;
      RABBITMQ_URI: string;
    }
  }
}
