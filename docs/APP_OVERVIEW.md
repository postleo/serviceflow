
# App Overview: ServiceFlow

**ServiceFlow** is a comprehensive workspace for hospitality managers to capture, structure, and distribute training materials. It replaces the "Word Doc on the office computer" with an active, AI-driven creation studio.

## Core Mechanics

### 1. The Capture Workspace
The heart of the app. Managers don't sit down to "write" manuals; they capture thoughts.
*   **Input Modes:**
    *   **Record:** Use the microphone to talk through a process while walking the floor.
    *   **Upload:** Drop in existing PDFs, photos of sketches, or video clips.
    *   **Type:** Jot down bullet points.
*   **Deliverable Selector:** Choose what you want to build (Card, Diagram, Script, Flowchart, Slideshow).

### 2. The AI Orchestrator
Once "Generate" is clicked, the app hands off the input to the Gemini Agent Swarm.
*   **Structure:** It breaks the input into logical steps.
*   **Visuals:** It generates images or code-based diagrams for every step.
*   **Audio:** It converts the text into a listenable training script.

### 3. Training Packs
Assets are organized into "Packs" (e.g., "New Hire Orientation"). This mimics the curriculum structure of Learning Management Systems (LMS).
*   **Progress Tracking:** Visual rings show how complete a pack is.
*   **Status Management:** Draft vs. Ready states.

### 4. Sophie (AI Assistant)
A pervasive chat assistant available on every screen.
*   **Context Aware:** Sophie knows you are in a restaurant context.
*   **History:** Sophie remembers previous conversations, allowing for iterative brainstorming.

## Key Features

*   **Native Audio Generation:** Creates high-fidelity voiceovers for scripts, essential for auditory learners.
*   **Mermaid.js Integration:** Renders editable, code-based flowcharts and layouts directly in the browser.
*   **Slide Generator:** Creates frame-by-frame visual storytelling for complex physical tasks.
*   **History & Library:** Automatically saves every generation, allowing users to "time travel" back to previous assets.
*   **Role-Based Access:** Simulates Admin vs. Manager vs. Staff views (demo mode).

## How it works (Under the Hood)
1.  **Input:** User provides a raw string or base64 media.
2.  **Prompt Engineering:** The app constructs a complex system prompt defining the "Structural Analyst" persona.
3.  **API Call:** `gemini-3-pro` processes the prompt and returns a JSON object.
4.  **Parallel Processing:**
    *   If visuals are needed -> call `gemini-2.5-flash-image` or `gemini-3-flash` (for code).
    *   If audio is needed -> call `gemini-2.5-native-audio`.
5.  **Rehydration:** The app combines these asynchronous results into a single `AgentOutput` object and renders it via React components.
