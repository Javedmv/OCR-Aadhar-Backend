import { Request, Response, NextFunction } from "express";
import { ExtractTextUseCase } from "../../../application/useCase/extractTextUseCase";
import { env } from "../../config/env";

export class OcrController {
  constructor(private readonly extractText: ExtractTextUseCase) {}

  extract = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const langs = (req.body.langs as string) || "eng";

      const front = files?.front?.[0];
      const back = files?.back?.[0];

      if (!front) {
        return res.status(400).json({ error: "Front image is required" });
      }

      // Run Tesseract OCR
      const frontResult = await this.extractText.execute({
        image: front.buffer,
        langs,
      });
      const backResult = back
        ? await this.extractText.execute({
            image: back.buffer,
            langs,
          })
        : { text: "" };
      console.log(frontResult, "--============-------==========-----", backResult);

      // Clean OCR results using Mistral with better error handling
      const cleanedFront = await this.cleanWithMistral(frontResult.text);
      const cleanedBack = await this.cleanWithMistral(backResult.text);
      console.log(cleanedFront, "----------===================-------------", cleanedBack);

      // Aadhaar parsing
      const structuredData = this.parseAadhaar(cleanedFront, cleanedBack);
      console.log(structuredData, "Structured Data");

      res.json(structuredData);
    } catch (error) {
      next(error);
    }
  };

  private async cleanWithMistral(rawText: string): Promise<string> {
    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that cleans OCR text from Aadhaar cards. " +
                "Fix OCR errors, normalize Aadhaar numbers into '1234 5678 9012' format (do not mask), " +
                "standardize dates into DD/MM/YYYY, and remove any garbage text.",
            },
            { role: "user", content: rawText },
          ],
          temperature: 0.2,
          max_tokens: 512,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Mistral cleanup failed: ${response.status} ${response.statusText} - ${errText}`);
        return this.enhancedTextCleaning(rawText);
      }

      const data = await response.json();
      return data?.choices?.[0]?.message?.content?.trim() || this.enhancedTextCleaning(rawText);
    } catch (err) {
      console.error("Mistral cleanup error:", err);
      return this.enhancedTextCleaning(rawText);
    }
  }

  // Fallback text cleaning
  private enhancedTextCleaning(rawText: string): string {
    let cleaned = rawText;

    cleaned = cleaned.replace(/\s+/g, " ");

    // Aadhaar number formatting (keep real numbers, don't mask)
    const aadhaarMatch = cleaned.match(/\b\d{12}\b|\b\d{4}\s*\d{4}\s*\d{4}\b/);
    if (aadhaarMatch) {
      const aadhaar = aadhaarMatch[0].replace(/\s+/g, "");
      if (aadhaar.length === 12) {
        const formatted = aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
        cleaned = cleaned.replace(aadhaarMatch[0], formatted);
      }
    }

    // Standardize date format
    cleaned = cleaned.replace(
      /(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{2,4})/g,
      (match, day, month, year) => {
        const d = day.padStart(2, "0");
        const m = month.padStart(2, "0");
        const y = year.length === 2 ? `20${year}` : year;
        return `${d}/${m}/${y}`;
      }
    );

    return cleaned.trim();
  }

  private parseAadhaar(frontText: string, backText: string) {
    const combined = `${frontText}\n${backText}`;
  
    const aadhaarMatch = combined.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
    const dobMatch = combined.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
    const yobMatch = combined.match(/\b(19|20)\d{2}\b/);
    const genderMatch = combined.match(
      /\b(MALE|FEMALE|TRANSGENDER|OTHERS|पुरुष|महिला|ट्रांसजेंडर)\b/i
    );
  
    // --- Address Extractor ---
    function extractAddress(str: string): string | null {
      const addressRegex = /Address[:\s]*([\s\S]*?)(\d{6})\b/i;
      let address: string | null = null;
  
      const match = str.match(addressRegex);
      if (match) {
        address = `${match[1]} ${match[2]}`;
      } else {
        const fallback = str.match(/Address[:\s]*([\s\S]*)/i);
        if (fallback) address = fallback[1];
      }
  
      if (!address) return null;
  
      address = address.replace(/[^A-Za-z0-9,\-\s]/g, " ");
  
      address = address
        .split(/\s+/)
        .filter((word) => word.length >= 3 || /^\d+$/.test(word))
        .join(" ");
  
      address = address
        .replace(/\s*,\s*/g, ", ")
        .replace(/,+/g, ",")
        .replace(/\s+/g, " ")
        .trim();
  
      return address || null;
    }
  
    // --- Name Extractor ---
    function extractName(): string | null {
      const lines = frontText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
  
      for (const line of lines) {
        if (
          /cleaned and normalized|gender|date of birth|address|aadhaar|uidai|government|authority/i.test(
            line
          )
        ) {
          continue;
        }
        if (/\d{4}\s?\d{4}\s?\d{4}/.test(line)) continue;
        if (/\d{2}\/\d{2}\/\d{4}/.test(line)) continue;
        if (/male|female|transgender/i.test(line)) continue;
  
        const alphaCount = (line.match(/[A-Za-z\u0900-\u097F]/g) || []).length;
        if (alphaCount >= 2) {
          const wordCount = line.split(/\s+/).length;
          if (wordCount >= 2) return cleanName(line);
        }
      }
      return null;
    }
  
    function cleanName(rawName: string): string {
      return rawName.replace(/[^\u0900-\u097FA-Za-z\s]/g, " ").replace(/\s+/g, " ").trim();
    }
  
    function normalizeGender(gender: string): string {
      const normalized = gender.toUpperCase();
      if (normalized.includes("पुरुष") || normalized === "MALE") return "MALE";
      if (normalized.includes("महिला") || normalized === "FEMALE") return "FEMALE";
      if (normalized.includes("ट्रांसजेंडर") || normalized === "TRANSGENDER") return "TRANSGENDER";
      if (normalized === "OTHERS") return "OTHERS";
      return normalized;
    }
  
    // --- Build structured object ---
    const dob = dobMatch ? dobMatch[0] : null;
    let yob: string | null = null;
    if (dob) {
      yob = dob.slice(-4); // last 4 digits from DOB
    } else if (yobMatch) {
      yob = yobMatch[0];
    }
  
    return {
      aadhaarNumber: aadhaarMatch
        ? aadhaarMatch[0]
            .replace(/\s+/g, "")
            .replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3")
        : null,
      name: extractName(),
      dob,
      yob,
      gender: genderMatch ? normalizeGender(genderMatch[0]) : null,
      address: extractAddress(backText),
    };
  }
  
}
