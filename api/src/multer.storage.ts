import multer, { diskStorage } from "multer";
import { tmpdir } from "os";
import { extname, join } from "path";
import { v4 as uuidv4 } from "uuid";

const TMP_DIR = tmpdir();
export const multerStorage = diskStorage({
  destination: join(TMP_DIR, "iman"),
  filename: (req, file, cb) => {
    const randomName = uuidv4();
    return cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

export const multerUpload = multer({ storage: multerStorage });
