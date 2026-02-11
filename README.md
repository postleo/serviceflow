
# ServiceFlow

**AI-Powered Hospitality Training Automation**

ServiceFlow is a generative AI application designed to digitize tribal knowledge in the hospitality industry. It uses a multi-agent architecture powered by **Google Gemini 3** to convert raw inputs (voice, text, sketches) into structured training deliverables like Sequence Cards, Audio Scripts, and Diagrams.


## 🛠️ Local Development Setup

### 1. Prerequisites
*   Node.js (v18 or higher)
*   A Gemini API Key from [Google AI Studio](https://aistudio.google.com/).

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/serviceflow.git
cd serviceflow

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
touch .env
```
Add your API key to the file. Note: In Vite, variables usually need to be prefixed with `VITE_`, but we have configured `vite.config.ts` to map `process.env`.
```env
API_KEY=AIzaSy...YourActualKey
```

### 4. Run Application
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 Build for Production

To create a production-ready static bundle:

```bash
npm run build
```

The output will be in the `dist/` directory. You can deploy this folder to any static hosting provider (Vercel, Netlify, AWS S3, Firebase Hosting, etc.).

---

## Key Features

- **Agent Orchestrator**: Powered by `gemini-3-pro-preview`.
- **Visuals as Code**: Generates Mermaid.js diagrams via `gemini-3-flash-preview`.
- **Native Audio**: Synthesizes training scripts using `gemini-2.5-flash-native-audio-preview-12-2025`.
- **Generative Imagery**: Illustrations via `gemini-2.5-flash-image` (Nano Banana).
