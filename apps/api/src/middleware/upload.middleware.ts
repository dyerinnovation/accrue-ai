import multer from "multer";

// Store files in memory (they'll be written to the object store)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 20,                   // Max 20 files per upload
  },
});
