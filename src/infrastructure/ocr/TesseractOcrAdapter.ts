import Tesseract from "tesseract.js"
import { OcrPort } from "../../domain/ports/OcrPorts"

export class TessaeractOcrAdaptor implements OcrPort{
    async recognize(image: Buffer, langs: string): Promise<string> {
        try {
            const {data} = await Tesseract.recognize(image, langs);
            return data.text ?? "";
        } catch (error) {
            console.log("error in TessaarectOcrAdaptor",error);
            throw error
        }
    }
}