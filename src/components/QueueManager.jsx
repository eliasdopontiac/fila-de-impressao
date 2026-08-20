import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  Plus, 
  ArrowUpDown, 
  AlertCircle,
  FolderKanban
} from 'lucide-react';
import { usePrintQueue } from '../context/PrintQueueContext';
import JobCard from './JobCard';

export default function QueueManager({ onOpenNewJobModal }) {
  const { jobs, projects } = usePrintQueue();

  const [statusTab, setStatusTab] = useState('all'); // 'all' | 'queued' | 'printing' | 'completed' | 'failed'
  const [searchTerm, setSearchTerm] = useState('');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = statusTab === 'all' || job.status === statusTab;
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMaterial = materialFilter === 'all' || job.materialType === materialFilter;
    const matchesProject = projectFilter === 'all' || job.projectId === projectFilter;

    return matchesStatus && matchesSearch && matchesMaterial && matchesProject;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'time') {
      const timeA = a.estimatedTimeHours * 60 + a.estimatedTimeMinutes;
      const timeB = b.estimatedTimeHours * 60 + b.estimatedTimeMinutes;
      return timeB - timeA;
    }
    if (sortBy === 'weight') {
      return b.estimatedWeightGrams - a.estimatedWeightGrams;
    }
    return 0;
  });

  // Status counts
  const counts = {
    all: jobs.length,
    queued: jobs.filter((j) => j.status === 'queued').length,
    printing: jobs.filter((j) => j.status === 'printing').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search Controls */}
      <div className="glass-panel p-5 rounded-3xl space-y-4">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-600" />
              Fila de Impressão 3D
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Gerencie a sequência de produção, baixe arquivos GCODE/STL e atribua às impressoras.
            </p>
          </div>

          <button
            onClick={onOpenNewJobModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Arquivo à Fila</span>
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/80">
          {[
            { id: 'all', label: 'Todos os Trabalhos', count: counts.all },
            { id: 'queued', label: 'Na Fila', count: counts.queued, badgeColor: 'bg-blue-100 text-blue-800' },
            { id: 'printing', label: 'Imprimindo', count: counts.printing, badgeColor: 'bg-emerald-100 text-emerald-800' },
            { id: 'completed', label: 'Concluídos', count: counts.completed, badgeColor: 'bg-slate-200 text-slate-700' },
            { id: 'failed', label: 'Falhados', count: counts.failed, badgeColor: 'bg-rose-100 text-rose-800' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                statusTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                statusTab === tab.id ? 'bg-white/30 text-white' : tab.badgeColor || 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, cliente ou arquivo..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-indigo-600 shrink-0" />
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="all">Todos os Projetos</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.responsible})
                </option>
              ))}
            </select>
          </div>

          {/* Material Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="all">Todos os Materiais</option>
              <option value="PLA">PLA</option>
              <option value="PETG">PETG</option>
              <option value="ABS">ABS</option>
              <option value="TPU">TPU (Flex)</option>
              <option value="ASA">ASA</option>
              <option value="Resin">Resina</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="priority">Ordenar por Prioridade</option>
              <option value="newest">Ordenar por Mais Recente</option>
              <option value="time">Ordenar por Tempo Estimado</option>
              <option value="weight">Ordenar por Consumo de Filamento</option>
            </select>
          </div>

        </div>

      </div>

      {/* Jobs Grid / List */}
      {sortedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedJobs.map((job, idx) => (
            <JobCard
              key={job.id}
              job={job}
              index={idx}
              totalInQueue={sortedJobs.length}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-heading font-bold text-slate-800">
            Nenhum trabalho encontrado
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não há impressões correspondentes aos filtros selecionados. Tente alterar a busca ou adicionar um novo arquivo.
          </p>
          <button
            onClick={onOpenNewJobModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Arquivo</span>
          </button>
        </div>
      )}

    </div>
  );
}
