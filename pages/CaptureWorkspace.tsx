
import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { Page, DeliverableType, AgentOutput, HistoryEntry } from '../types';
import { IconMic, IconWand, IconEdit, IconCheck, IconPlay, IconUpload } from '../components/Icons';
import { orchestrateCreation, transcribeAudio } from '../services/gemini';
import { DB } from '../services/db';
import { useAuth } from '../contexts/AuthContext';

interface CaptureWorkspaceProps {
  onNavigate: (page: Page) => void;
  initialAsset?: HistoryEntry | null;
  onClearInitial?: () => void;
}

// Icons
const IconDownload = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
const IconMaximize = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
);
const IconChevronLeft = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const IconChevronRight = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
const IconImage = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);

type AssetTab = 'guide' | 'cards' | 'diagram' | 'audio' | 'slides';

export const CaptureWorkspace: React.FC<CaptureWorkspaceProps> = ({ onNavigate, initialAsset, onClearInitial }) => {
  const { user } = useAuth();
  const [selectedOutput, setSelectedOutput] = useState<DeliverableType>(DeliverableType.CARDS);
  const [inputMode, setInputMode] = useState<'record' | 'type' | 'upload'>('type');
  const [inputText, setInputText] = useState('');
  const [inputMedia, setInputMedia] = useState<{ data: string, mimeType: string, name: string } | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<AgentOutput | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [micError, setMicError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Asset Navigation
  const [activeTab, setActiveTab] = useState<AssetTab>('guide');
  const [cardIndex, setCardIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Resume/Edit Effect
  useEffect(() => {
      if (initialAsset) {
          setGeneratedResult(initialAsset.data);
          setSelectedOutput(initialAsset.type);
          setActiveTab('guide');
      }
      return () => {
          if (onClearInitial) onClearInitial();
      };
  }, [initialAsset]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Only reset inputs if we are NOT loading an initial asset
    if (!initialAsset) {
        if (selectedOutput === DeliverableType.DIAGRAM) setInputMode('upload');
        else if (selectedOutput === DeliverableType.SCRIPT) setInputMode('record');
        else setInputMode('type');
        setInputText('');
        setMicError('');
        setInputMedia(null);
    }
  }, [selectedOutput, initialAsset]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            const base64Data = base64String.split(',')[1];
            setInputMedia({ data: base64Data, mimeType: file.type, name: file.name });
            setInputText(`Attached file: ${file.name}`);
        };
        reader.readAsDataURL(file);
    }
  };

  const toggleMic = async () => {
    if (isRecording) {
        // Stop recording
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    } else {
        // Start recording
        setMicError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await handleAudioTranscription(audioBlob);
                stream.getTracks().forEach(track => track.stop()); // Release mic
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err: any) {
            console.error("Mic Error:", err);
            setMicError("Could not access microphone. Please check permissions.");
        }
    }
  };

  const handleAudioTranscription = async (audioBlob: Blob) => {
      setIsTranscribing(true);
      try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
              const base64String = reader.result as string;
              // Strip "data:audio/webm;base64," prefix
              const base64Data = base64String.split(',')[1];
              const mimeType = base64String.split(';')[0].split(':')[1];
              
              const transcript = await transcribeAudio(base64Data, mimeType);
              setInputText(prev => (prev + ' ' + transcript).trim());
              setIsTranscribing(false);
          };
      } catch (e) {
          setMicError("Transcription failed. Please try again.");
          setIsTranscribing(false);
      }
  };

  const handleGenerate = async () => {
    if ((!inputText && !inputMedia) || !user) return;
    setIsProcessing(true);
    setGeneratedResult(null); 
    setProgressStatus('Initializing Gemini 3 Agents...');
    abortControllerRef.current = new AbortController();
    
    try {
        const result = await orchestrateCreation(
            inputText, inputMedia, selectedOutput, 
            {
                workspaceName: 'Maison Verde', accentColor: '#f97316', brandTone: 'Encouraging',
                visualStyle: 'Minimalist', sophiePersonality: 'Helper',
                enableAudio: true, enableImages: true, enableDiagrams: true
            },
            (status) => setProgressStatus(status),
            abortControllerRef.current.signal
        );
        DB.saveAsset(user.id, { date: new Date().toISOString(), title: result.title, type: selectedOutput, preview: result.summary, data: result });
        setGeneratedResult(result);
        
        // Logic for default tab
        if (selectedOutput === DeliverableType.DIAGRAM && result.visualCode) {
            setActiveTab('diagram');
        } else {
            setActiveTab('guide');
        }
        setCardIndex(0);
    } catch (e: any) {
        if (e.message !== "Process stopped.") alert("Generation failed: " + e.message);
    } finally {
        setIsProcessing(false);
        abortControllerRef.current = null;
    }
  };

  const handleStop = () => abortControllerRef.current?.abort();

  // Helper to generate full HTML Guide document
  const generateGuideHtml = (data: AgentOutput) => {
      const stepsHtml = data.steps?.map(step => `
        <div class="step-card">
            <div class="step-header">
                <span class="step-num">${step.stepNumber}</span>
                <h3 class="step-title">${step.action}</h3>
            </div>
            ${step.script ? `
            <div class="script-section">
                <div class="script-label">SAY THIS</div>
                <div class="script-content">"${step.script}"</div>
            </div>` : ''}
            <div class="cue-section">
                <span class="cue-icon">👁️</span>
                <span class="cue-text"><strong>Visual Cue:</strong> ${step.visualCue}</span>
            </div>
        </div>
      `).join('') || '';

      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${data.title} - Training Guide</title>
            <style>
                :root {
                    --primary: #f97316;
                    --primary-light: #fff7ed;
                    --text-main: #1f2937;
                    --text-muted: #6b7280;
                    --border: #e5e7eb;
                    --bg: #f9fafb;
                    --card-bg: #ffffff;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.6;
                    color: var(--text-main);
                    background-color: var(--bg);
                    margin: 0;
                    padding: 40px 20px;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 60px;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                .header {
                    margin-bottom: 40px;
                    border-bottom: 2px solid var(--border);
                    padding-bottom: 30px;
                }
                .meta {
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--primary);
                    font-size: 0.75rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                h1 {
                    font-size: 2.25rem;
                    font-weight: 800;
                    margin: 0 0 16px 0;
                    line-height: 1.2;
                    letter-spacing: -0.02em;
                }
                .summary {
                    font-size: 1.125rem;
                    color: var(--text-muted);
                    max-width: 65ch;
                }
                .step-card {
                    background: var(--card-bg);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 24px;
                    transition: transform 0.2s ease;
                }
                .step-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .step-num {
                    background: var(--text-main);
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.875rem;
                    margin-right: 16px;
                    flex-shrink: 0;
                }
                .step-title {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                }
                .script-section {
                    background: var(--primary-light);
                    border-left: 4px solid var(--primary);
                    padding: 16px 20px;
                    border-radius: 0 8px 8px 0;
                    margin-bottom: 16px;
                }
                .script-label {
                    font-size: 0.625rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--primary);
                    font-weight: 700;
                    margin-bottom: 4px;
                }
                .script-content {
                    font-style: italic;
                    color: #9a3412;
                    font-weight: 500;
                }
                .cue-section {
                    display: flex;
                    align-items: center;
                    background: #f3f4f6;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    width: fit-content;
                }
                .cue-icon {
                    margin-right: 8px;
                    font-size: 1rem;
                }
                .footer {
                    margin-top: 60px;
                    padding-top: 20px;
                    border-top: 1px solid var(--border);
                    font-size: 0.75rem;
                    color: #9ca3af;
                    text-align: center;
                }
                @media print {
                    body { background: white; padding: 0; }
                    .container { box-shadow: none; padding: 0; }
                    .step-card { break-inside: avoid; border: 1px solid #ddd; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="meta">ServiceFlow Guide • Generated ${date}</div>
                    <h1>${data.title}</h1>
                    <p class="summary">${data.summary}</p>
                </div>
                <div class="steps-container">
                    ${stepsHtml}
                </div>
                <div class="footer">
                    Generated by ServiceFlow AI
                </div>
            </div>
        </body>
        </html>
      `;
  };

  const handleZipDownload = async () => {
    if (!generatedResult) return;
    const zip = new JSZip();
    
    // Metadata
    zip.file("meta.json", JSON.stringify({ title: generatedResult.title, summary: generatedResult.summary, date: new Date().toISOString() }, null, 2));

    // Full Guide HTML
    const guideHtml = generateGuideHtml(generatedResult);
    zip.file("training_guide.html", guideHtml);

    // Visuals
    if (generatedResult.visualImage) {
        const imgData = generatedResult.visualImage.split(',')[1];
        zip.file("visual_illustration.png", imgData, { base64: true });
    }
    
    if (generatedResult.visualCode) {
        zip.file("diagram.html", generatedResult.visualCode);
    }

    // Audio
    if (generatedResult.audioAsset) {
        const audioData = generatedResult.audioAsset.split(',')[1];
        zip.file("audio_guide.wav", audioData, { base64: true });
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedResult.title.replace(/\s+/g, '_').toLowerCase()}_assets.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- PREVIEW RENDERERS ---

  const renderGuide = () => (
      <div className="bg-white p-8 rounded-xl h-full overflow-y-auto border border-oxford-100 shadow-sm">
          <div className="max-w-3xl mx-auto">
            <div className="text-center border-b border-oxford-100 pb-6 mb-8">
                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded mb-4 inline-block">Training Guide</span>
                <h2 className="text-3xl font-bold text-oxford-900 mb-4">{generatedResult?.title}</h2>
                <p className="text-lg text-oxford-600 leading-relaxed italic font-light">{generatedResult?.summary}</p>
            </div>
            
            <div className="space-y-6">
                {generatedResult?.steps?.map((step, idx) => (
                    <div key={idx} className="bg-white border border-oxford-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-oxford-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1 shadow-sm">
                                {step.stepNumber}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-oxford-900 mb-3">{step.action}</h3>
                                {step.script && (
                                    <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded-r-lg mb-4 text-oxford-800">
                                        <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1">Say This</p>
                                        <p className="italic font-medium text-oxford-700">"{step.script}"</p>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-xs bg-oxford-50 p-2 rounded-lg w-fit text-oxford-500 border border-oxford-100">
                                    <span className="text-lg">👁️</span>
                                    <span className="font-medium text-oxford-700">Visual Cue:</span> {step.visualCue}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      </div>
  );

  const renderCards = (fullscreen: boolean) => {
      if (!generatedResult?.steps || generatedResult.steps.length === 0) return <div className="p-10 text-center text-oxford-400">No steps generated</div>;
      
      const step = generatedResult.steps[cardIndex];
      
      return (
          <div className={`flex flex-col h-full ${fullscreen ? 'max-w-4xl mx-auto' : ''}`}>
              <div className="flex-1 bg-white rounded-2xl border border-oxford-200 overflow-hidden shadow-sm flex flex-col md:flex-row">
                  {/* Left: Content */}
                  <div className="flex-1 p-8 flex flex-col justify-center">
                      <span className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">Step {step.stepNumber} of {generatedResult.steps.length}</span>
                      <h3 className="text-2xl font-bold text-oxford-900 mb-4">{step.action}</h3>
                      {step.script && (
                          <div className="bg-oxford-50 p-4 rounded-xl border border-oxford-100 italic text-oxford-700 leading-relaxed mb-6">
                              "{step.script}"
                          </div>
                      )}
                      <div className="mt-auto">
                           <span className="text-[10px] font-semibold text-oxford-400 uppercase">Visual Cue</span>
                           <p className="text-xs text-oxford-500">{step.visualCue}</p>
                      </div>
                  </div>
                  {/* Right: Illustration (If global image exists, show it, otherwise placeholder based on cue) */}
                  <div className="w-full md:w-1/3 bg-oxford-100 border-l border-oxford-200 relative overflow-hidden">
                       {generatedResult.visualImage ? (
                           <img src={generatedResult.visualImage} alt="Visual" className="w-full h-full object-cover" />
                       ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                               <IconImage className="w-12 h-12 text-oxford-300 mb-2" />
                               <p className="text-xs text-oxford-400">Image Generation Disabled</p>
                           </div>
                       )}
                       {generatedResult.visualSlides && generatedResult.visualSlides[cardIndex] && (
                            <img src={generatedResult.visualSlides[cardIndex]} alt={`Slide ${cardIndex}`} className="absolute inset-0 w-full h-full object-cover" />
                       )}
                  </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between mt-4 px-2">
                  <button 
                    onClick={() => setCardIndex(prev => Math.max(0, prev - 1))}
                    disabled={cardIndex === 0}
                    className="p-2 rounded-full hover:bg-oxford-100 disabled:opacity-30 transition-colors"
                  >
                      <IconChevronLeft className="w-6 h-6 text-oxford-700" />
                  </button>
                  <div className="flex gap-1.5">
                      {generatedResult.steps.map((_, idx) => (
                          <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === cardIndex ? 'bg-primary-500 w-4' : 'bg-oxford-300'}`} />
                      ))}
                  </div>
                  <button 
                    onClick={() => setCardIndex(prev => Math.min(generatedResult.steps!.length - 1, prev + 1))}
                    disabled={cardIndex === generatedResult.steps.length - 1}
                    className="p-2 rounded-full hover:bg-oxford-100 disabled:opacity-30 transition-colors"
                  >
                      <IconChevronRight className="w-6 h-6 text-oxford-700" />
                  </button>
              </div>
          </div>
      );
  };

  const renderAudio = () => {
      if (!generatedResult?.audioAsset) return <div className="p-10 text-center text-oxford-400">No audio generated</div>;
      return (
          <div className="bg-white p-8 rounded-xl h-full flex flex-col items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-primary-50 flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-primary-100 animate-ping opacity-20"></div>
                  <IconPlay className="w-12 h-12 text-primary-500 ml-1" />
              </div>
              <h3 className="text-xl font-bold text-oxford-900 mb-2">Training Audio Track</h3>
              <p className="text-sm text-oxford-500 mb-8">Generated by Gemini 2.5 Native Audio</p>
              <audio controls src={generatedResult.audioAsset} className="w-full max-w-md" />
              <div className="mt-8 text-left w-full max-w-md bg-oxford-50 p-4 rounded-lg text-sm text-oxford-600 max-h-48 overflow-y-auto">
                  <p className="font-bold mb-2 text-xs uppercase text-oxford-400">Transcript Preview</p>
                  {generatedResult.steps?.map(s => s.script).join(' ')}
              </div>
          </div>
      );
  };

  // Replaced dangerouslySetInnerHTML with iframe for isolation and better rendering
  const renderDiagram = () => {
       if (!generatedResult?.visualCode) return <div className="p-10 text-center text-oxford-400">No diagram generated</div>;
       return (
           <div className="bg-white rounded-xl h-full w-full overflow-hidden flex flex-col">
               <div className="flex-1 w-full h-full bg-white relative">
                   <iframe 
                        title="Diagram Preview"
                        srcDoc={generatedResult.visualCode}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts" // Allow mermaid scripts to run
                   />
               </div>
           </div>
       );
  };

  const renderActiveTab = (fullscreen: boolean) => {
      switch(activeTab) {
          case 'guide': return renderGuide();
          case 'cards': return renderCards(fullscreen);
          case 'audio': return renderAudio();
          case 'diagram': return renderDiagram();
          default: return renderGuide();
      }
  };

  // --- MAIN RENDER ---
  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Fullscreen Modal */}
      {isFullscreen && generatedResult && (
          <div className="fixed inset-0 z-50 bg-oxford-900/95 flex flex-col p-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center text-white mb-6">
                  <h2 className="text-xl font-bold">{generatedResult.title} <span className="text-white/50 text-sm font-normal">| {activeTab.toUpperCase()}</span></h2>
                  <div className="flex gap-4">
                      {/* Fullscreen Tab Nav */}
                      <div className="flex bg-white/10 rounded-lg p-1">
                          {(['guide', 'cards', 'audio', 'diagram'] as const).map(tab => {
                              if (tab === 'diagram' && !generatedResult.visualCode) return null;
                              if (tab === 'audio' && !generatedResult.audioAsset) return null;
                              return (
                                <button 
                                    key={tab} 
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 rounded-md text-sm transition-all capitalize ${activeTab === tab ? 'bg-white text-oxford-900 font-medium' : 'text-white/70 hover:text-white'}`}
                                >
                                    {tab}
                                </button>
                              );
                          })}
                      </div>
                      <button onClick={() => setIsFullscreen(false)} className="p-2 hover:bg-white/10 rounded-full text-white">×</button>
                  </div>
              </div>
              <div className="flex-1 overflow-hidden">
                  {renderActiveTab(true)}
              </div>
          </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-oxford-900">Capture Workspace</h1>
          <p className="text-oxford-500 text-sm mt-1">Orchestrating <span className="font-semibold text-primary-600">Gemini 3 Agents</span></p>
        </div>
        <div className="flex items-center gap-3">
             <div className="flex bg-white border border-oxford-200 rounded-lg p-1">
                {Object.values(DeliverableType).map(type => (
                    <button key={type} onClick={() => setSelectedOutput(type as DeliverableType)} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${selectedOutput === type ? 'bg-oxford-900 text-white' : 'text-oxford-500 hover:text-oxford-700'}`}>
                        {type.split(' ')[0]}
                    </button>
                ))}
            </div>
            <button onClick={() => onNavigate(Page.HOME)} className="text-sm text-oxford-500 hover:text-oxford-800 px-3">Exit</button>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* INPUT AREA (35%) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0">
            <div className="bg-white rounded-2xl shadow-sm border border-oxford-100 flex flex-col overflow-hidden h-full">
                <div className="p-4 border-b border-oxford-100 bg-oxford-50/50">
                    <div className="flex p-1 bg-oxford-200/50 rounded-lg w-full">
                    {(['type', 'record', 'upload'] as const).map((mode) => (
                        <button key={mode} onClick={() => setInputMode(mode)} className={`flex-1 py-2 rounded-md text-xs font-medium transition-all capitalize ${inputMode === mode ? 'bg-white text-oxford-900 shadow-sm' : 'text-oxford-500 hover:text-oxford-700'}`}>{mode}</button>
                    ))}
                    </div>
                </div>
                
                <div className="flex-1 p-6 flex flex-col min-h-0 overflow-y-auto">
                    {inputMode === 'type' && (
                        <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} className="flex-1 w-full resize-none focus:outline-none text-oxford-800 leading-relaxed text-sm bg-white placeholder-oxford-300 border-none p-2 rounded-lg" placeholder={`Describe the ${selectedOutput} process in detail...`} />
                    )}
                    {inputMode === 'record' && (
                         <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                             <div 
                                className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all border-4 group ${isRecording ? 'bg-red-500 border-red-200 animate-pulse' : 'bg-red-50 border-red-100 hover:bg-red-100'} ${isTranscribing ? 'bg-orange-100 border-orange-200 animate-pulse' : ''}`} 
                                onClick={toggleMic}
                             >
                                 <IconMic className={`w-10 h-10 transition-transform ${isRecording ? 'text-white' : 'text-red-500 group-hover:scale-110'}`} />
                             </div>
                             <p className="text-xs text-oxford-500 font-medium">
                                {isRecording ? "Recording... Tap to Stop" : (isTranscribing ? "Gemini Transcribing..." : "Tap to Record (Gemini 3)")}
                             </p>
                             {micError && <p className="text-xs text-red-500 px-4 text-center">{micError}</p>}
                             
                             {/* Live Transcript Display */}
                             <div className="w-full mt-4 p-3 bg-oxford-50 rounded-xl border border-oxford-100 min-h-[100px] text-left">
                                <p className="text-[10px] text-oxford-400 uppercase font-bold mb-1">Transcript</p>
                                <p className="text-sm text-oxford-800 leading-relaxed">
                                    {inputText}
                                    {!inputText && <span className="text-oxford-400 italic">Transcription will appear here after recording stops...</span>}
                                </p>
                             </div>
                         </div>
                    )}
                    {inputMode === 'upload' && (
                        <div className="flex-1 border-2 border-dashed border-oxford-200 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-oxford-50/30 hover:bg-oxford-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*,application/pdf" onChange={handleFileUpload} />
                            <IconUpload className="w-8 h-8 text-oxford-300 mb-2" />
                            <span className="text-xs font-medium text-oxford-600">{inputMedia ? inputMedia.name : "Upload File"}</span>
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-oxford-100 bg-white">
                    {isProcessing ? (
                        <button onClick={handleStop} className="w-full py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">Stop Generation</button>
                    ) : (
                        <button onClick={handleGenerate} disabled={!inputText && !inputMedia} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-oxford-900 hover:bg-oxford-800 disabled:bg-oxford-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl">
                            <IconWand className="w-4 h-4" /> Generate
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* OUTPUT AREA (65%) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0 bg-oxford-100/50 rounded-2xl border border-oxford-200 overflow-hidden relative">
            
            {/* Output Toolbar */}
            <div className="h-14 bg-white border-b border-oxford-200 flex items-center justify-between px-4">
                <div className="flex gap-1">
                    {(['guide', 'cards', 'diagram', 'audio'] as const).map(tab => {
                        // Only show tabs if content exists or if it's overview/guide
                        if (tab !== 'guide' && !generatedResult) return null;
                        if (tab === 'diagram' && generatedResult && !generatedResult.visualCode) return null;
                        if (tab === 'audio' && generatedResult && !generatedResult.audioAsset) return null;

                        return (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab as AssetTab)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize border ${activeTab === tab ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-transparent text-oxford-500 border-transparent hover:bg-oxford-50'}`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>
                
                {generatedResult && (
                    <div className="flex gap-2">
                        <button onClick={handleZipDownload} className="flex items-center gap-2 px-3 py-1.5 bg-oxford-50 hover:bg-oxford-100 text-oxford-700 rounded-lg text-xs font-medium transition-colors border border-oxford-200">
                            <IconDownload className="w-3.5 h-3.5" /> Download ZIP
                        </button>
                        <button onClick={() => setIsFullscreen(true)} className="p-1.5 hover:bg-oxford-100 text-oxford-500 rounded-lg transition-colors">
                            <IconMaximize className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Content Stage */}
            <div className="flex-1 overflow-hidden p-6 relative">
                 {!generatedResult && !isProcessing && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-oxford-400">
                         <div className="w-20 h-20 bg-oxford-200/50 rounded-full flex items-center justify-center mb-4">
                             <IconWand className="w-8 h-8 opacity-50" />
                         </div>
                         <p className="font-medium">Ready to create</p>
                         <p className="text-sm opacity-70">Select input to begin</p>
                     </div>
                 )}

                 {isProcessing && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                         <div className="w-16 h-16 border-4 border-oxford-200 border-t-primary-500 rounded-full animate-spin mb-6"></div>
                         <h3 className="text-lg font-bold text-oxford-900">{progressStatus}</h3>
                         <p className="text-sm text-oxford-500 mt-2">Gemini is thinking...</p>
                     </div>
                 )}

                 {generatedResult && !isProcessing && (
                     <div className="h-full w-full animate-in fade-in zoom-in-95 duration-300">
                         {renderActiveTab(false)}
                     </div>
                 )}
            </div>
        </div>

      </div>
    </div>
  );
};
