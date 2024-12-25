import mongoose, { HydratedDocument, Types } from "mongoose";

export interface ITask {
  status?: "pending" | "processing" | "completed" | "failed";
  operation: "compress" | "convert";
  result?: string;
  files: string[];
  format?: SupportedFormat;
  quality?: number;
  dir: string;
  id: string;
  _id: Types.ObjectId;
}

export enum TaskStatusEnum {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export const TASK_STATUSES = [
  TaskStatusEnum.PENDING,
  TaskStatusEnum.PROCESSING,
  TaskStatusEnum.COMPLETED,
  TaskStatusEnum.FAILED,
];

export enum SupportedFormat {
  JPEG = "jpeg",
  PNG = "png",
  WEBP = "webp",
  GIF = "gif",
  TIFF = "tiff",
  AVIF = "avif",
  HEIF = "heif",
}

export const SUPPORTED_FORMATS = [
  SupportedFormat.JPEG,
  SupportedFormat.PNG,
  SupportedFormat.WEBP,
  SupportedFormat.GIF,
  SupportedFormat.TIFF,
  SupportedFormat.AVIF,
  SupportedFormat.HEIF,
];

export const TaskSchema = new mongoose.Schema<ITask>(
  {
    operation: {
      type: String,
      required: true,
      enum: ["compress", "convert"],
    },
    files: {
      type: [String],
      required: true,
    },
    format: {
      type: String,
      enum: SUPPORTED_FORMATS,
    },
    quality: {
      type: Number,
    },
    result: {
      type: String,
    },
    dir: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: TaskStatusEnum.PENDING,
      enum: TASK_STATUSES,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const TaskModel = mongoose.model<ITask>("Task", TaskSchema);
export type TaskDocument = HydratedDocument<ITask>;
