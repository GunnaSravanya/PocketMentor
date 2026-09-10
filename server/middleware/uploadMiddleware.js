import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "text/plain",
    "text/markdown",
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.endsWith(".pdf") || file.originalname.endsWith(".txt") || file.originalname.endsWith(".md")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and Text documents are supported."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
  },
});
