
# ServiceFlow

**AI-Powered Hospitality Training Automation**

ServiceFlow is a generative AI application designed to digitize tribal knowledge in the hospitality industry. It uses a multi-agent architecture powered by **Google Gemini 3** to convert raw inputs (voice, text, sketches) into structured training deliverables like Sequence Cards, Audio Scripts, and Diagrams.


## 🛠️ Local Development Setup

### 1. Prerequisites
*   Node.js (v18 or higher)
*   A Google Cloud Project with billing enabled.
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
Add your API key to the file:
```env
API_KEY=AIzaSy...YourActualKey
```

### 4. Run Application
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Deployment: Google Cloud Run

ServiceFlow is containerized and optimized for Google Cloud Run. We use a runtime injection strategy so you can manage your API Key as a Cloud Run environment variable without rebuilding the image.

### 1. Prerequisites
*   Google Cloud SDK (`gcloud`) installed and authenticated.
*   Artifact Registry API enabled.

### 2. Build & Submit Image
Run this command from the project root. Replace `[PROJECT_ID]` with your GCP Project ID.
```bash
gcloud builds submit --tag gcr.io/[PROJECT_ID]/serviceflow
```

### 3. Deploy
Deploy the service to Cloud Run. This command makes the service public and sets the API Key.
```bash
gcloud run deploy serviceflow \
  --image gcr.io/[PROJECT_ID]/serviceflow \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars API_KEY=[YOUR_GEMINI_API_KEY]
```

Once finished, `gcloud` will output a URL (e.g., `https://serviceflow-xyz-uc.a.run.app`).

---

## 🖥️ Deployment: VPS (Ubuntu/DigitalOcean/AWS)

You can run ServiceFlow on any server with Docker installed.

### 1. Prepare Server
SSH into your server and install Docker:
```bash
sudo apt update
sudo apt install -y docker.io
```

### 2. Clone & Build
```bash
git clone https://github.com/your-username/serviceflow.git
cd serviceflow

# Build the Docker image
sudo docker build -t serviceflow-app .
```

### 3. Run Container
Run the container on port 80. Ensure you pass your API Key.
```bash
sudo docker run -d \
  --name serviceflow \
  --restart always \
  -p 80:8080 \
  -e API_KEY=AIzaSy...YourActualKey \
  serviceflow-app
```

Your app is now live at your server's IP address.

---

## Key Features

- **Agent Orchestrator**: Powered by `gemini-3-pro-preview`.
- **Visuals as Code**: Generates Mermaid.js diagrams via `gemini-3-flash-preview`.
- **Native Audio**: Synthesizes training scripts using `gemini-2.5-flash-native-audio-preview-12-2025`.
- **Generative Imagery**: Illustrations via `gemini-2.5-flash-image` (Nano Banana).
