import "dotenv/config";
import Express from "express";
import { createServer } from "node:http";
import {
  createProcessingTask,
  downloadMedias,
  getTask,
} from "./medias/medias.controller";
import { errorMiddleware } from "./middlewares/error.middleware";
import { connectMongoose } from "./connect-mongoose";
import { multerUpload } from "./multer.storage";
import { validate } from "./middlewares/zod.validator";
import { createMediaSchema } from "./medias/dtos/create-media.dto";
import cors from "cors";
import { createChannel } from "./rabbit";

const app = Express();

async function main() {
  await connectMongoose();
  const server = createServer(app);

  app.use(cors());
  app.use(Express.json());
  app.use(Express.urlencoded({ extended: true }));
  app.use(async (req, _, next) => {
    const { channel } = await createChannel();

    req.channel = channel;

    next();
  });

  app.get("/tasks/:id", getTask);
  app.post(
    "/tasks",
    multerUpload.array("files"),
    validate(createMediaSchema),
    createProcessingTask
  );
  app.get("/tasks/:id/medias", downloadMedias);

  app.use(errorMiddleware);

  server.listen(3000, () => console.log(`Listening on port 3000`));
}

main().catch((error) => {
  console.error(error);

  process.exit(1);
});
