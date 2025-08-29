import { OcrPort } from "../../domain/ports/OcrPorts";

export type ExtractTextInput = {
    image: Buffer;
    langs?: string;
}

export type ExtractTextOutput = {
    text : string;
}

export class ExtractTextUseCase {
    constructor(private readonly ocr: OcrPort) {}

    async execute(input: ExtractTextInput): Promise<ExtractTextOutput>{
        if(!input.image || input.image.length === 0){
            throw new Error("Image buffer is required.")
        }
        
        const langs = input.langs?.trim() || "eng"
        const text = await this.ocr.recognize(input.image, langs);
        
        return { text }
    }
}