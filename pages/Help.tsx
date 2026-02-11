
import React, { useState } from 'react';

const GUIDE_SECTIONS = [
    {
        id: 'cards',
        title: 'Service Sequence Cards',
        desc: 'Create step-by-step SOPs from video or voice notes.',
        content: (
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-oxford-900">How to create Service Sequence Cards</h3>
                <ol className="list-decimal pl-5 space-y-3 text-sm text-oxford-700">
                    <li>Navigate to the <strong>Capture Workspace</strong> from the sidebar or home dashboard.</li>
                    <li>Select <strong>Service Sequence Cards</strong> from the top deliverables bar.</li>
                    <li>Choose your input method:
                        <ul className="list-disc pl-5 mt-1 text-oxford-600">
                            <li><strong>Record:</strong> Click the mic and narrate the steps clearly (e.g., "First, approach the table from the right...").</li>
                            <li><strong>Type:</strong> Paste rough notes or a bulleted list.</li>
                            <li><strong>Upload:</strong> If available, upload a video (MP4) of the service being performed.</li>
                        </ul>
                    </li>
                    <li>Click <strong>Generate</strong>. The Orchestrator will structure your input into distinct steps.</li>
                    <li>The <strong>Photographer Agent</strong> will generate a visual illustration for each step.</li>
                    <li>Review the output. Use the <strong>Download</strong> button to save as a PDF or Image.</li>
                </ol>
            </div>
        )
    },
    {
        id: 'diagram',
        title: 'Layout Diagrams',
        desc: 'Design floor plans and station maps using code.',
        content: (
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-oxford-900">Generating Layout Diagrams</h3>
                <p className="text-sm text-oxford-600">ServiceFlow uses code generation to create precise, scalable diagrams.</p>
                <ol className="list-decimal pl-5 space-y-3 text-sm text-oxford-700">
                    <li>Select <strong>Layout Diagram</strong> in the Capture Workspace.</li>
                    <li><strong>Input:</strong> Upload a photo of a napkin sketch or type a description (e.g., "A rectangular room with a bar on the north wall and 10 round tables").</li>
                    <li><strong>Processing:</strong> The Visual Coder agent creates an HTML file embedded with Mermaid.js logic to render the diagram.</li>
                    <li><strong>Interaction:</strong> You can interact with the diagram in the preview window (zoom/pan if supported).</li>
                    <li><strong>Export:</strong> Download the HTML file. You can open this in any browser to view the high-quality diagram.</li>
                </ol>
            </div>
        )
    },
    {
        id: 'script',
        title: 'Script Cards & Audio',
        desc: 'Perfect verbal scripts with AI voice acting.',
        content: (
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-oxford-900">Creating Audio Training Scripts</h3>
                <ol className="list-decimal pl-5 space-y-3 text-sm text-oxford-700">
                    <li>Select <strong>Script Card</strong>.</li>
                    <li><strong>Roleplay Mode:</strong> Click "Record" and pretend you are speaking to a guest. Don't worry about "ums" or "ahs".</li>
                    <li><strong>Generation:</strong> The AI cleans up your speech into a perfect script text.</li>
                    <li><strong>Audio Synthesis:</strong> The Voice Actor agent generates a high-quality audio clip of the script using the "Brand Tone" selected in settings (Formal/Casual).</li>
                    <li><strong>Usage:</strong> Download the `.wav` file for pre-shift lineups or mobile learning.</li>
                </ol>
            </div>
        )
    },
    {
        id: 'flowchart',
        title: 'Problem Resolution Flowcharts',
        desc: 'Logic trees for handling complex guest scenarios.',
        content: (
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-oxford-900">Building Decision Trees</h3>
                <ol className="list-decimal pl-5 space-y-3 text-sm text-oxford-700">
                    <li>Select <strong>Problem Resolution Flowchart</strong>.</li>
                    <li>Describe the policy (e.g., "If a guest dislikes food, offer a recook. If they refuse, offer a comp. If they are still unhappy, get a manager.").</li>
                    <li>The AI maps this logic into a visual flowchart.</li>
                    <li>The output is rendered as a clean, professional diagram that simplifies complex decision making for staff.</li>
                </ol>
            </div>
        )
    },
    {
        id: 'slides',
        title: 'Visual Slideshows',
        desc: 'Animated sequences for visual learners.',
        content: (
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-oxford-900">Creating Slideshows</h3>
                <p className="text-sm text-oxford-600">Replaces video generation for faster, clearer step-by-step visuals.</p>
                <ol className="list-decimal pl-5 space-y-3 text-sm text-oxford-700">
                    <li>Select <strong>Visual Slideshow</strong> (or Video).</li>
                    <li>Provide a sequence of events or a narrative.</li>
                    <li>The Animator Agent generates 3-5 sequential images representing key moments.</li>
                    <li>The result is played back as an auto-looping slideshow.</li>
                    <li>You can pause or manually navigate through the frames in the preview window.</li>
                </ol>
            </div>
        )
    }
];

const FAQS = [
    { q: "How do I create a new account?", a: "Currently, accounts are managed via invite tokens by your administrator. Contact your manager for an access token." },
    { q: "Can I use ServiceFlow offline?", a: "Basic navigation works offline, but content generation requires an active internet connection to reach the AI agents." },
    { q: "What formats can I download?", a: "You can download text as JSON/TXT, visuals as PNG, diagrams as HTML, and audio as WAV files." },
    { q: "Is my data private?", a: "ServiceFlow processes data via secure APIs. Your inputs are used only to generate your requested content." },
    { q: "How do I change the voice accent?", a: "Go to Settings > Brand Voice. You can toggle between 'Formal' (Kore) and 'Casual' (Puck) tones." },
    { q: "Why is generation taking long?", a: "Multi-modal generation (Images + Audio) involves complex processing. It typically takes 30-60 seconds." },
    { q: "Can I edit a generated image?", a: "Direct pixel editing is not supported. You should edit the text prompt and regenerate to adjust the visual." },
    { q: "Does Sophie save my chat?", a: "Yes, Sophie's chat history is saved locally on your device and can be resumed from the Sophie Chat page." },
    { q: "How many projects can I have?", a: "There is no limit to the number of Training Packs you can create." },
    { q: "Can I share a pack with staff?", a: "Currently, you must download the assets and distribute them via your existing LMS or email." },
    { q: "What happens if I stop generation?", a: "The process halts immediately. No partial assets are saved to prevent data corruption." },
    { q: "Can I duplicate a card?", a: "Yes, inside the Project Details view, hover over an item and click the copy icon." },
    { q: "Does the app support mobile?", a: "Yes, ServiceFlow is fully responsive and works great on tablets for floor observation." },
    { q: "How do I delete a project?", a: "Archiving/Deleting projects is currently an Admin-only feature to prevent accidental data loss." },
];

export const Help: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guide' | 'faq'>('guide');
  const [activeGuide, setActiveGuide] = useState(GUIDE_SECTIONS[0].id);

  return (
    <div className="space-y-6 max-w-5xl pb-20">
      <div>
        <h1 className="text-2xl font-bold text-oxford-900">Help Center</h1>
        <p className="text-oxford-500 text-sm mt-1">Documentation and support for ServiceFlow.</p>
      </div>

      <div className="flex gap-4 border-b border-oxford-200">
          <button 
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${activeTab === 'guide' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-oxford-500 hover:text-oxford-800'}`}
          >
              Feature Guides
          </button>
          <button 
            onClick={() => setActiveTab('faq')}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${activeTab === 'faq' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-oxford-500 hover:text-oxford-800'}`}
          >
              FAQs
          </button>
      </div>

      {activeTab === 'guide' ? (
          <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar */}
              <div className="w-full md:w-64 flex-shrink-0 space-y-1">
                  {GUIDE_SECTIONS.map(section => (
                      <button
                        key={section.id}
                        onClick={() => setActiveGuide(section.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                            activeGuide === section.id 
                            ? 'bg-white shadow-sm border border-oxford-100 text-primary-700 font-medium' 
                            : 'text-oxford-600 hover:bg-white/50'
                        }`}
                      >
                          {section.title}
                      </button>
                  ))}
              </div>

              {/* Content */}
              <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-oxford-100 min-h-[400px]">
                  {GUIDE_SECTIONS.map(section => {
                      if (section.id !== activeGuide) return null;
                      return (
                          <div key={section.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="mb-6 pb-6 border-b border-oxford-100">
                                <h2 className="text-2xl font-bold text-oxford-900">{section.title}</h2>
                                <p className="text-oxford-500 mt-2">{section.desc}</p>
                              </div>
                              {section.content}
                          </div>
                      );
                  })}
              </div>
          </div>
      ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-oxford-100 divide-y divide-oxford-100">
              {FAQS.map((faq, idx) => (
                  <details key={idx} className="group p-6">
                      <summary className="font-medium text-sm text-oxford-800 cursor-pointer list-none flex justify-between items-center outline-none">
                          {faq.q}
                          <span className="text-oxford-400 group-open:rotate-180 transition-transform duration-200">▼</span>
                      </summary>
                      <p className="text-sm text-oxford-500 mt-3 leading-relaxed pl-4 border-l-2 border-primary-200 animate-in fade-in">
                          {faq.a}
                      </p>
                  </details>
              ))}
          </div>
      )}
    </div>
  );
};
