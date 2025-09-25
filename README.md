# Aadhaar OCR Backend

This backend service extracts structured data from Aadhaar card images using OpenAI GPT-4 Vision API.

## Features

- Accepts Aadhaar front and back images (PNG/JPG/JPEG)
- Uses OpenAI GPT-4 Vision for OCR and data extraction
- Validates images and returns structured JSON data
- Handles errors and invalid images gracefully

## Requirements

- Node.js (v18+ recommended)
- An OpenAI API key with GPT-4 Vision access

## Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root directory (already present in your project). Example:
   ```
   NODE_ENV=production
   PORT=3000
   OPENAI_API_KEY=sk-...
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## API Usage

### Endpoint

`POST /ocr/extract`

#### Form Data

- `front`: Aadhaar front image (required)
- `back`: Aadhaar back image (optional)

#### Example Request (using curl)

```bash
curl -X POST http://localhost:3000/ocr/extract \
  -F "front=@/path/to/front.jpg" \
  -F "back=@/path/to/back.jpg"
```

#### Example Response

```json
{
  "status": "true",
  "data": {
    "UID": "XXXX-XXXX-XXXX",
    "name": "John Doe",
    "dob": "01-01-1990",
    "gender": "Male",
    "address": "123 Street, City, State",
    "pincode": "123456",
    "age_band": "20-30",
    "maskedMobileNumber": "not given",
    "isUidSame": "not given"
  },
  "message": "Parsing Successful"
}
```

If the image is invalid, you will get a 400 response with an appropriate message.

## Project Structure

```
src/
  domain/
  infrastructure/
    config/
    http/
      controllers/
      middleware/
      routes/
      validators/
    ocr/
    services/
  main/
.env
```

## License

MIT

---

**Note:**  
This project is for educational/demo purposes. Do not use real Aadhaar data in production without proper