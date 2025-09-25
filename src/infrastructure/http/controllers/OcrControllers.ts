import { Request, Response, NextFunction } from "express";
import { validateOcrFiles } from "../validators/ocrValidator";
import { ocrExtractService } from "../../services/ocrExtractService";

export class OcrController {
  extract = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { valid, error } = validateOcrFiles(req.files);
      if (!valid) {
        const err = new Error(error);
        (err as any).statusCode = 400;
        throw err;
      }

      const structuredData = await ocrExtractService(req.files);

      let status = "true";
      let message = "Parsing Successful";
      if(structuredData.frontImage == "false" && structuredData.backImage == "false"){
        status = "false";
        message = "Please provide a valid Aadhaar front/back image.";
        
      } else if (structuredData.frontImage === "false") {
        status = "false";
        message = "Please provide a valid Aadhaar front image.";
      } else if (structuredData.backImage === "false") {
        status = "false";
        message = "Please provide a valid Aadhaar back image.";
      }

      delete structuredData.frontImage;
      delete structuredData.backImage;

      const response = {
        status,
        data: structuredData,
        message,
      };

      // if (status === "false") {
      //   return res.status(400).json(response);
      // }

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error in extract:", error);
      next(error);
    }
  };
}
