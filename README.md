
# ServiceFlow

**AI-Powered Hospitality Training Automation**

ServiceFlow is a generative AI application designed to digitize tribal knowledge in the hospitality industry. It uses a multi-agent architecture powered by **Google Gemini 3** to convert raw inputs (voice, text, sketches) into structured training deliverables like Sequence Cards, Audio Scripts, and Diagrams.



## Key Features

- **Agent Orchestrator**: Powered by `gemini-3-pro-preview`.
- **Visuals as Code**: Generates Mermaid.js diagrams via `gemini-3-flash-preview`.
- **Native Audio**: Synthesizes training scripts using `gemini-2.5-flash-native-audio-preview-12-2025`.
- **Generative Imagery**: Illustrations via `gemini-2.5-flash-image` (Nano Banana).

## Setup

1.  Clone the repository.
2.  Install dependencies: `npm install`.
3.  Set your API Key in `.env`: `API_KEY=AIza...`.
4.  Run the dev server: `npm start`.

See `docs/` for full details.
