export interface OcrPort {
    /**
    * Recognize text from an image buffer using given language(s).
    * @param image - Raw image bytes (e.g., multer memory buffer)
    * @param langs - Tesseract language codes (e.g., "eng", "eng+tam")
    */
    recognize(image: Buffer, langs: string): Promise<string>;
}