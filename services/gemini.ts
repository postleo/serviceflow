
import { GoogleGenAI, Type, Schema, Modality, Content } from "@google/genai";
import { DeliverableType, AgentOutput, UserSettings } from "../types";

// --- CONFIGURATION ---
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const cleanJsonString = (text: string): string => {
    if (!text) return '{}';
    let clean = text.trim();
    // Remove markdown code blocks if present (common LLM behavior)
    clean = clean.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    return clean;
};

// Helper to add WAV header to raw PCM data
const addWavHeader = (base64PCM: string): string => {
  const SAMPLE_RATE = 24000;
  const NUM_CHANNELS = 1;
  const BITS_PER_SAMPLE = 16;

  const binaryString = atob(base64PCM);
  const len = binaryString.length;
  const headerLength = 44;
  const totalLength = headerLength + len;
  
  const buffer = new Uint8Array(totalLength);
  const view = new DataView(buffer.buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + len, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, NUM_CHANNELS, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * NUM_CHANNELS * 2, true); // Byte rate
  view.setUint16(32, NUM_CHANNELS * 2, true); // Block align
  view.setUint16(34, BITS_PER_SAMPLE, true);
  writeString(view, 36, 'data');
  view.setUint32(40, len, true);

  // Write PCM data
  for (let i = 0; i < len; i++) {
    buffer[headerLength + i] = binaryString.charCodeAt(i);
  }

  // Convert back to base64
  let binary = '';
  // Process in smaller chunks if needed, but for typical TTS clips loop is fine
  for (let i = 0; i < totalLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  
  return btoa(binary);
};

// --- AGENT DEFINITIONS ---

/**
 * 1. THE ORCHESTRATOR (Project Manager)
 * Model: gemini-3-pro-preview
 */
export const orchestrateCreation = async (
  input: string, 
  media: { data: string, mimeType: string } | null,
  outputType: DeliverableType,
  settings: UserSettings,
  onProgress: (status: string) => void,
  signal?: AbortSignal
): Promise<AgentOutput> => {
  if (!apiKey) {
    throw new Error("API Key Missing. Please check your .env configuration.");
  }

  const checkAbort = () => {
      if (signal?.aborted) throw new Error("Process stopped.");
  };

  try {
    checkAbort();
    onProgress("Initializing Orchestrator Agent...");

    // 1. Structural Analysis (Text/Reasoning)
    // Using Gemini 3 Flash for speed and reliability.
    onProgress("Analysing input and structuring content...");
    
    const structure = await runStructuralAnalyst(input, media, outputType, settings);

    if (!structure) {
        throw new Error("Structural Analysis returned empty result.");
    }
    
    checkAbort();
    
    let visualCode: string | undefined;
    let visualImage: string | undefined;
    let visualSlides: string[] | undefined;
    let visualType: 'svg' | 'html' | 'image' | 'slides' | undefined;
    let audioAsset: string | undefined;

    const promises: Promise<void>[] = [];

    // 2. Visuals & Schematics
    // A. Diagrams & Scripts (Code/HTML)
    if (settings.enableDiagrams && (outputType === DeliverableType.DIAGRAM || outputType === DeliverableType.FLOWCHART || outputType === DeliverableType.CODE_MODULE || outputType === DeliverableType.SCRIPT || outputType === DeliverableType.CARDS)) {
        onProgress("Drafting visual layout (HTML/Mermaid)...");
        
        let visualPrompt = '';
        if (outputType === DeliverableType.SCRIPT) {
             visualPrompt = `
                Create a stylish, modern HTML card to display this training script.
                Title: ${structure.title}
                Content: ${structure.steps?.[0]?.script || structure.summary}
                Style: ${settings.visualStyle}, Brand Color: ${settings.accentColor}.
                IMPORTANT: Return ONLY the raw HTML code (no markdown). Use Tailwind CSS via CDN if needed or inline styles.
                Make it look like a high-end flashcard.
            `;
        } else {
             visualPrompt = `
                Create a self-contained HTML file using Mermaid.js for a diagram representing: ${structure.summary}.
                Context: ${structure.steps?.[0]?.visualCue || 'Overview'}.
                Style: ${settings.visualStyle}. Brand Color: ${settings.accentColor}.
                IMPORTANT: Return ONLY the HTML code. Embed the mermaid CDN script.
                Example structure: <html><body><script type="module">import mermaid from '...';</script><div class="mermaid">graph TD...</div></body></html>
            `;
        }

        promises.push(
            runVisualCoder(visualPrompt)
            .then(res => { if(res) { visualCode = res; visualType = 'html'; }})
            .catch(e => console.warn("Visual Coder failed", e))
        );
    }
    
    // B. Images (Nano Banana)
    if (settings.enableImages && (outputType === DeliverableType.CARDS || outputType === DeliverableType.SCRIPT)) {
        onProgress("Creating visuals (Nano Banana)...");
        const imagePrompt = `A ${settings.visualStyle} illustration of: ${structure.summary}. ${structure.steps?.[0]?.visualCue || 'Professional service setting'}`;
        promises.push(
            runPhotographer(imagePrompt)
            .then(res => { if(res) { visualImage = res; if(!visualType) visualType = 'image'; }}) 
            .catch(e => console.warn("Photographer failed", e))
        );
    }

    // C. Slideshow (Simulating Video)
    if (settings.enableImages && (outputType === DeliverableType.SLIDES || outputType === DeliverableType.VIDEO)) {
        onProgress("Generating animated slide sequence...");
        // Limit to 3 slides to ensure speed
        const slidePrompts = structure.steps?.slice(0, 3).map(s => `A ${settings.visualStyle} scene showing: ${s.action}.`) || [structure.summary];
        promises.push(
            runAnimator(slidePrompts) 
            .then(res => { 
                if(res && res.length > 0) { 
                    visualSlides = res; 
                    visualType = 'slides'; 
                }
            })
            .catch(e => console.warn("Animator failed", e))
        );
    }

    // 3. Voice Actor
    if (settings.enableAudio && (outputType === DeliverableType.SCRIPT || outputType === DeliverableType.AUDIO || outputType === DeliverableType.CARDS)) {
        const scriptText = structure.steps?.map(s => s.script).join(' ') || structure.summary;
        onProgress("Synthesizing audio assets...");
        promises.push(
            runVoiceActor(scriptText, settings)
            .then(res => { if(res) audioAsset = res; })
            .catch(e => console.warn("Voice Actor failed", e))
        );
    }

    // Wait for all non-critical assets to attempt generation
    await Promise.all(promises);
    
    checkAbort();
    onProgress("Finalizing assets...");

    return {
      ...structure,
      visualCode,
      visualImage,
      visualSlides,
      visualType,
      audioAsset
    };

  } catch (error: any) {
    if (signal?.aborted || error.message === "Process stopped.") {
        throw new Error("Process stopped.");
    }
    console.error("Orchestrator Failed:", error);
    throw error; // Re-throw to UI
  }
};

/**
 * 2. SUB-AGENT: STRUCTURAL ANALYST
 */
const runStructuralAnalyst = async (input: string, media: any, type: string, settings: UserSettings): Promise<AgentOutput> => {
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      summary: { type: Type.STRING },
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stepNumber: { type: Type.INTEGER },
            action: { type: Type.STRING },
            script: { type: Type.STRING },
            visualCue: { type: Type.STRING }
          }
        }
      }
    },
    required: ["title", "summary", "steps"]
  };

  const prompt = `Analyze input for 'ServiceFlow'. Tone: ${settings.brandTone}. Task: Create a ${type} structure. Context: "${input}"`;
  const parts: any[] = [{ text: prompt }];
  if (media) parts.push({ inlineData: { mimeType: media.mimeType, data: media.data } });

  try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: parts }],
        config: { 
            responseMimeType: "application/json", 
            responseSchema: responseSchema 
        }
      });
      
      const text = cleanJsonString(response.text || '{}');
      return JSON.parse(text) as AgentOutput;
  } catch (e) {
      console.error("Structural Analysis Failed", e);
      // Fallback: Try Pro if Flash fails
      try {
         console.log("Retrying with Gemini 3 Pro...");
         const responsePro = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [{ role: 'user', parts: parts }],
            config: { 
                responseMimeType: "application/json", 
                responseSchema: responseSchema 
            }
         });
         const textPro = cleanJsonString(responsePro.text || '{}');
         return JSON.parse(textPro) as AgentOutput;
      } catch (e2) {
         throw new Error("Failed to parse AI structure.");
      }
  }
};

/**
 * 3. SUB-AGENT: VISUAL CODER (Mermaid/HTML)
 */
const runVisualCoder = async (prompt: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return response.text?.replace(/```html/g, '').replace(/```/g, '').trim();
  } catch (e) {
    return undefined;
  }
};

/**
 * 4. SUB-AGENT: PHOTOGRAPHER (Nano Banana)
 * Model: gemini-2.5-flash-image
 */
const runPhotographer = async (prompt: string): Promise<string | undefined> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] }
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return undefined;
    } catch (e) {
        console.warn("Photographer failed", e);
        return undefined;
    }
};

/**
 * 5. SUB-AGENT: ANIMATOR (Slideshow)
 */
const runAnimator = async (prompts: string[]): Promise<string[]> => {
    // Run in parallel to speed up, limited to 3
    const promises = prompts.slice(0, 3).map(p => runPhotographer(p));
    const results = await Promise.all(promises);
    return results.filter((r): r is string => !!r);
};

/**
 * 6. SUB-AGENT: VOICE ACTOR
 * Model: gemini-2.5-flash-preview-tts
 */
const runVoiceActor = async (script: string, settings: UserSettings): Promise<string | undefined> => {
  try {
    const voiceName = settings.brandTone === 'Formal' ? 'Kore' : 'Puck';
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ role: 'user', parts: [{ text: script }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
      }
    });
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts?.[0]?.inlineData) {
        // The API returns raw PCM data. We must convert it to WAV for browser playback.
        const base64PCM = parts[0].inlineData.data;
        const base64WAV = addWavHeader(base64PCM);
        return `data:audio/wav;base64,${base64WAV}`;
    }
    return undefined;
  } catch (e) {
    console.warn("Voice actor failed", e);
    return undefined;
  }
};

/**
 * 7. AUDIO TRANSCRIBER (Gemini 3)
 */
export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Audio } },
                    { text: "Transcribe this audio exactly. Do not add any commentary." }
                ]
            }
        });
        return response.text || "Transcription failed.";
    } catch (e) {
        console.error("Transcription failed", e);
        throw new Error("Failed to transcribe audio with Gemini.");
    }
};

/**
 * SOPHIE (Chat)
 */
export const chatWithSophie = async (history: {role: string, text: string}[], message: string): Promise<string> => {
    if (!apiKey) return "Please check your network connection or API configuration.";
    
    const chatHistory: Content[] = history.map(h => ({ 
        role: h.role === 'sophie' ? 'model' : 'user', 
        parts: [{ text: h.text }] 
    }));

    const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        history: chatHistory,
        config: {
            systemInstruction: "You are Sophie, a helpful AI assistant for ServiceFlow."
        }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't generate a response.";
};
