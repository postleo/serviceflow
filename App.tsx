
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { QuickCapture } from './components/QuickCapture';
import { Sophie } from './components/Sophie';
import { Home } from './pages/Home';
import { TrainingPacks } from './pages/TrainingPacks';
import { ProjectDetails } from './pages/ProjectDetails';
import { CaptureWorkspace } from './pages/CaptureWorkspace';
import { Library } from './pages/Library';
import { Settings } from './pages/Settings';
import { History } from './pages/History';
import { Auth } from './pages/Auth';
import { Onboarding } from './pages/Onboarding';
import { SophiePage } from './pages/SophiePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Help } from './pages/Help';
import { Page, HistoryEntry } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC<{ currentPage: Page, setCurrentPage: (p: Page) => void }> = ({ currentPage, setCurrentPage }) => {
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<HistoryEntry | null>(null);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user && currentPage !== Page.AUTH) setCurrentPage(Page.AUTH);
    if (!isLoading && user && currentPage === Page.AUTH) setCurrentPage(Page.HOME);
  }, [user, isLoading, currentPage, setCurrentPage]);

  const handleEditAsset = (asset: HistoryEntry) => {
      setEditingAsset(asset);
      setCurrentPage(Page.CAPTURE);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-oxford-50 text-oxford-400">Loading...</div>;

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME: return <Home onNavigate={setCurrentPage} />;
      case Page.PACKS: return <TrainingPacks onNavigate={setCurrentPage} onSelectPack={setSelectedPackId} />;
      case Page.PROJECT_DETAILS: return <ProjectDetails packId={selectedPackId} onNavigate={setCurrentPage} />;
      case Page.CAPTURE: return <CaptureWorkspace onNavigate={setCurrentPage} initialAsset={editingAsset} onClearInitial={() => setEditingAsset(null)} />;
      case Page.LIBRARY: return <Library onEdit={handleEditAsset} />;
      case Page.HISTORY: return <History onNavigate={setCurrentPage} onEdit={handleEditAsset} />;
      case Page.SOPHIE_CHAT: return <SophiePage onNavigate={setCurrentPage} />;
      case Page.SETTINGS: return <Settings />;
      case Page.ADMIN: return <AdminDashboard />;
      case Page.AUTH: return <Auth onNavigate={setCurrentPage} />;
      case Page.ONBOARDING: return <Onboarding onNavigate={setCurrentPage} />;
      case Page.HELP: return <Help />;
      default: return <Home onNavigate={setCurrentPage} />;
    }
  };

  if (currentPage === Page.AUTH) return <Auth onNavigate={setCurrentPage} />;

  return (
    <div className="flex h-screen w-full bg-oxford-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header onNavigate={setCurrentPage} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth"><div className="max-w-6xl mx-auto pb-20">{renderPage()}</div></main>
        <QuickCapture isOpen={showQuickCapture} onClose={() => setShowQuickCapture(false)} onOpen={() => setShowQuickCapture(true)} />
        <Sophie />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.AUTH);
  return <AuthProvider onNavigate={setCurrentPage}><AppContent currentPage={currentPage} setCurrentPage={setCurrentPage} /></AuthProvider>;
};

export default App;
