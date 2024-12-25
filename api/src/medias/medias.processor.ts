import "dotenv/config";
import amqp from "amqplib";
import {
  SupportedFormat,
  TaskDocument,
  TaskModel,
  TaskStatusEnum,
} from "./task.model";
import { Types } from "mongoose";
import { connectMongoose } from "../connect-mongoose";
import sharp from "sharp";
import { join } from "node:path";
import { UPLOAD_DIR } from "../contant";
import { remove } from "fs-extra";
import { getBaseDir } from "../utils/index.utils";
import { v4 as uuid } from "uuid";

async function main() {
  await connectMongoose();
  const connection = await amqp.connect(process.env.RABBITMQ_URI);
  const channel = await connection.createChannel();
  const queue = "medias";

  await channel.assertQueue(queue, {
    durable: true,
  });

  console.log("WAITING FOR MESSAGES ====================>");

  channel.consume(queue, async (msg) => {
    console.log(" NEW MESSAGE ==========> ", { msg: msg!.content.toString() });
    const { taskId } = JSON.parse(msg!.content.toString());
    try {
      const task = await TaskModel.findOne({ _id: new Types.ObjectId(taskId) });
      /**
       * If the task is not found, we should acknowledge the message and return.
       */
      if (!task) {
        console.warn("TASK NOT FOUND", { taskId });
        channel.ack(msg!);
        return;
      }

      await processTask(task);
    } catch (error) {
      await TaskModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(taskId),
        },
        {
          $set: {
            status: TaskStatusEnum.FAILED,
          },
        }
      );

      console.error("PROCESSING ERROR", { error });
    }

    console.log("PROCESSING END.");
  });
}

async function processTask(task: TaskDocument) {
  if (task.operation === "convert") {
    const filenames = await Promise.all(
      task.files.map((file) =>
        convertImage(join(UPLOAD_DIR, `${task.dir}/${file}`), task.format!)
      )
    );

    task.files = filenames;
    task.status = TaskStatusEnum.COMPLETED;
    await task.save();
  } else {
    await compressImages(task);
  }
}

async function convertImage(
  path: string,
  operation: SupportedFormat
): Promise<string> {
  const image = sharp(path);
  switch (operation) {
    case SupportedFormat.GIF:
      image.gif();
      break;
    case SupportedFormat.JPEG:
      image.jpeg();
      break;

    case SupportedFormat.PNG:
      image.png();
      break;

    case SupportedFormat.TIFF:
      image.tiff();
      break;

    case SupportedFormat.WEBP:
      image.webp();
      break;

    case SupportedFormat.AVIF:
      image.avif();
      break;

    case SupportedFormat.HEIF:
      image.heif();
      break;

    default:
      break;
  }

  const dest = join(getBaseDir(path), `${uuid()}.${operation.toLowerCase()}`);
  console.log({
    path,
    dest,
  });
  await image.toFile(dest);
  await remove(path);

  return dest.split("/").pop()!;
}

async function compressImages(task: TaskDocument) {}

main().catch((error) => {
  console.error(error);

  process.exit(1);
});
