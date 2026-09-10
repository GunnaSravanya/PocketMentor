import { Router } from "express";
import { createNote, getNotes, getNoteById, deleteNote } from "../../controllers/noteController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { upload } from "../../middleware/uploadMiddleware.js";

const router = Router();

// Protect all note routes
router.use(protect);

router.post("/", upload.single("file"), createNote);
router.get("/", getNotes);
router.get("/:noteId", getNoteById);
router.delete("/:noteId", deleteNote);

export default router;
