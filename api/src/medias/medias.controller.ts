import { NextFunction, Request, Response } from "express";
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "../errors";
import { exists, move } from "fs-extra";
import { UPLOAD_DIR } from "../contant";
import { join } from "path";
import { TaskModel, TaskStatusEnum } from "./task.model";
import { v4 as uuid } from "uuid";
import { Types } from "mongoose";
import { getTaskHateoasLings } from "./task.util";
import { createReadStream } from "fs";
import Admzip from "adm-zip";

/**
 * Setup a new processing task.
 */
export const createProcessingTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || !Array.isArray(req.files) || !req.files.length) {
      next(
        new BadRequestException("No files uploaded", {
          files: ["At least one file is required"],
        })
      );
      return;
    }

    const subDir = uuid();
    const filenames = await Promise.all(
      req.files.map(async (file) => {
        await move(file.path, join(UPLOAD_DIR, subDir, file.filename));

        return file.filename;
      })
    );

    const tasks = await TaskModel.create({
      files: filenames,
      dir: subDir,
      format: req.body.format,
      operation: req.body.operation,
      quality: req.body.quality,
    });

    const taskJson = tasks.toJSON();

    req.channel.sendToQueue(
      "medias",
      Buffer.from(JSON.stringify({ taskId: tasks.id })),
      {
        appId: "medias",
      }
    );

    res.status(202).json({
      status: "ACCEPTED",
      message: "Task created successfully",
      data: {
        ...taskJson,
        links: getTaskHateoasLings(tasks),
      },
    });
  } catch (error) {
    console.error(error);
    next(new InternalServerErrorException());
  }
};

/**
 * Get a processing task.
 */
export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const taskId = req.params.id;

  const task = await TaskModel.findOne({ _id: new Types.ObjectId(taskId) });
  if (!task) {
    next(new NotFoundException("Task not found"));
    return;
  }

  res.status(200).json({
    status: "OK",
    data: {
      ...task.toJSON(),
      links: getTaskHateoasLings(task),
    },
  });
};

export const downloadMedias = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = req.params.id;
    const task = await TaskModel.findOne({ _id: new Types.ObjectId(taskId) });
    if (!task) {
      next(new NotFoundException("Task not found"));
      return;
    } else if (task.status !== TaskStatusEnum.COMPLETED) {
      next(new BadRequestException("Task is not completed yet", {}));
      return;
    }

    // Check if the zip file exists.
    const zipFile = join(UPLOAD_DIR, `${task.dir}/${task.id}.zip`);
    if (await exists(zipFile)) {
      streamFile(zipFile, res);
      return;
    }

    // Create a new zip file.
    const zip = new Admzip();
    task.files.forEach((file) => {
      zip.addLocalFile(join(UPLOAD_DIR, task.dir, file));
    });

    const result = await zip.writeZipPromise(zipFile);
    if (result) {
      streamFile(zipFile, res);
    } else {
      next(new InternalServerErrorException("Failed to create zip file"));
    }
  } catch (error) {
    next(new InternalServerErrorException("Failed to create zip file"));
  }
};

function streamFile(path: string, res: Response) {
  const stream = createReadStream(path);

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${path.split("/").pop()}`
  );

  stream.on("error", (error) => {
    console.error(error);
    res.status(500).send("Internal server error");
  });

  stream.pipe(res);
}
