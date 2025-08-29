import { Router } from "express";
import { upload } from "../middleware/uploads";
import { ExtractTextUseCase } from "../../../application/useCase/extractTextUseCase";
import { TessaeractOcrAdaptor } from "../../ocr/TesseractOcrAdapter";
import { OcrController } from "../controllers/OcrControllers";

const router = Router();
const adapter = new TessaeractOcrAdaptor();
const useCase = new ExtractTextUseCase(adapter);
const controller = new OcrController(useCase);

router.post("/extract", upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),controller.extract);

export default router