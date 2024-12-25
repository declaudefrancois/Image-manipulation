import { resolve, join } from "path";

export const ROOT_DIR = resolve(__dirname, "..");
export const APP_DIR = join(ROOT_DIR, "src");
export const UPLOAD_DIR = join(ROOT_DIR, "uploads");