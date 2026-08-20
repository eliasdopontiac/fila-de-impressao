import React from 'react';
import { 
  Printer, 
  Layers, 
  Package, 
  Calculator, 
  BarChart3, 
  Plus, 
  RefreshCw, 
  AlertTriangle,
  Flame,
  Clock,
  FolderKanban
} from 'lucide-react';
import { usePrintQueue } from '../context/PrintQueueContext';

export default function Navbar({ activeTab, setActiveTab, onOpenNewJobModal }) {
  const { jobs, printers, spools, projects, resetDefaults } = usePrintQueue();

  const activePrintingCount = printers.filter((p) => p.status === 'printing').length;
  const queuedCount = jobs.filter((j) => j.status === 'queued').length;
  const lowSpoolsCount = spools.filter((s) => s.remainingWeight < 150).length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 border-b border-slate-200/90 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('queue')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/15 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Printer className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900">
                  Print<span className="text-blue-600">Stream</span>
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  3D Queue
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono hidden sm:block">
                Gestão da Fila & Frota de Impressão
              </p>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
              <Flame className={`w-3.5 h-3.5 ${activePrintingCount > 0 ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} />
              <span className="text-slate-600">Imprimindo:</span>
              <span className="font-bold text-slate-900">{activePrintingCount} / {printers.length}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200/80 text-xs">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-600">Na Fila:</span>
              <span className="font-bold text-blue-700">{queuedCount} jobs</span>
            </div>

            {lowSpoolsCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{lowSpoolsCount} filamento(s) baixo(s)</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewJobModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-600/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Trabalho</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Deseja restaurar os dados originais da demonstração?')) {
                  resetDefaults();
                }
              }}
              title="Restaurar Dados de Teste"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-200/60 no-scrollbar">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'queue'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Fila de Impressão</span>
            {queuedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold">
                {queuedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'projects'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Projetos de Impressão</span>
            {projects.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200">
                {projects.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('printers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'printers'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Frota de Impressoras</span>
            {activePrintingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('spools')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'spools'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Estoque de Filamentos</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Calculadora de Custos</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics & Relatórios</span>
          </button>
        </nav>

      </div>
    </header>
  );
}
