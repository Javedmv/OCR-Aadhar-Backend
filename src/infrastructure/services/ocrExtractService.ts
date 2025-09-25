import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function ocrExtractService(files: any) {
  const front = files.front[0];
  const back = files.back?.[0];

  const frontBase64 = front.buffer.toString("base64");
  const backBase64 = back ? back.buffer.toString("base64") : null;

  const systemMessage = {
    role: "system",
    content: `You are an OCR + parser for Aadhaar cards. Extract all data in EXACT JSON format:
    {
    "UID": "", // 12 digit number from FRONT image only
    "name": "", // Name from FRONT image
    "dob": "", // Date of birth from FRONT image
    "gender": "", // Gender from FRONT image
    "address": "", // Address from BACK image
    "pincode": "", // 6 digit number from address (BACK image)
    "age_band": "", // If age is 30, give "30-40". If 22, "20-30". If 10, "10-20"
    "maskedMobileNumber": "", // 10 digit mobile number (may start with +91), check both FRONT and BACK
    "isUidSame": "" // Extract UID from BACK and compare with FRONT. If not same, return "back uid not same"
    "frontImage": "" // check if this is a valid aadhaar front image which has a image and a qr with above Government of india. if not add value "false" else "true" also make sure to check UID and name is avalable else make this false.
    "backImage": "" // check if this is a valid aadhaar back image which has aadhaar number and Unique identification Authority of india. if not "false" else "true" also make sure to check if isUidSame field has the same UID value else make this false.
    }
    Rules:
    - If any value is missing or not found, set it as "not given".
    - Do NOT mask UID or Mobile Number.
    - Only use the FRONT image for UID, name, dob, and gender.
    - Only use the BACK image for address and pincode.
    - For mobile number, check both images.
    - For isUidSame, extract UID from BACK and compare with FRONT. If not same, return "back uid not same". If not found, return "not given".
    Return only the JSON object, nothing else.`,
    };

  const userMessages: any[] = [
    {
      role: "user",
      content: [
        { type: "text", text: "Extract Aadhaar card details from the following images." },
        { type: "image_url", image_url: { url: `data:image/png;base64,${frontBase64}` } }
      ],
    },
  ];

  if (backBase64) {
    userMessages[0].content.push({
      type: "image_url",
      image_url: { url: `data:image/png;base64,${backBase64}` }
    });
  }

  const response = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [systemMessage, ...userMessages],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message?.content || "{}");
}