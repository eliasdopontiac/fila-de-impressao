import React, { useState } from 'react';
import { PrintQueueProvider } from './context/PrintQueueContext';
import Navbar from './components/Navbar';
import QueueManager from './components/QueueManager';
import ProjectManager from './components/ProjectManager';
import PrinterGrid from './components/PrinterGrid';
import FilamentInventory from './components/FilamentInventory';
import CostCalculator from './components/CostCalculator';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import NewJobModal from './components/NewJobModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'queue' | 'printers' | 'spools' | 'calculator' | 'analytics'
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewJobModal={() => setIsNewJobModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'projects' && <ProjectManager />}

        {activeTab === 'queue' && (
          <QueueManager onOpenNewJobModal={() => setIsNewJobModalOpen(true)} />
        )}

        {activeTab === 'printers' && <PrinterGrid />}

        {activeTab === 'spools' && <FilamentInventory />}

        {activeTab === 'calculator' && <CostCalculator />}

        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </main>

      {/* New Job Modal */}
      <NewJobModal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-700">PrintStream 3D Queue & Fleet System © 2026</span>
          <span className="text-slate-500">
            Fila de Impressão • Módulo de Projetos & Lotes • Upload/Download de GCODE & STL
          </span>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <PrintQueueProvider>
      <AppContent />
    </PrintQueueProvider>
  );
}
