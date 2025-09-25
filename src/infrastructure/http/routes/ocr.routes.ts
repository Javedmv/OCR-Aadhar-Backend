import { Router } from "express";
import { upload } from "../middleware/uploads";
import { OcrController } from "../controllers/OcrControllers";

const router = Router();
const controller = new OcrController();

router.post("/extract", upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),controller.extract);

export default router