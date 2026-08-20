import React, { useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  Scale, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  FolderKanban, 
  User, 
  Calendar, 
  PrinterIcon,
  DollarSign,
  FileText
} from 'lucide-react';
import { usePrintQueue } from '../context/PrintQueueContext';

export default function AnalyticsDashboard() {
  const { jobs, printers, projects, spools, settings } = usePrintQueue();

  // State to filter analytics by project ('all' or specific projectId)
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Helper to format date and time to PT-BR
  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // --- GLOBAL STATS ---
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const failedJobs = jobs.filter((j) => j.status === 'failed');

  const globalSuccessRate = jobs.length > 0
    ? Math.round((completedJobs.length / (completedJobs.length + failedJobs.length || 1)) * 100)
    : 100;

  const globalPrintHours = jobs.reduce((acc, j) => {
    return acc + (j.estimatedTimeHours + j.estimatedTimeMinutes / 60);
  }, 0);

  const globalFilamentGrams = jobs.reduce((acc, j) => {
    return acc + j.estimatedWeightGrams;
  }, 0);

  // --- PROJECT INDIVIDUAL STATS ---
  let projectJobs = [];
  let projectTotalRequiredParts = 0;
  let projectTotalPrintedParts = 0;
  let projectTotalTimeHours = 0;
  let projectTotalWeightGrams = 0;
  let projectMaterialCost = 0;
  let projectEnergyCost = 0;
  let projectMachineCost = 0;
  let projectTotalCost = 0;

  if (selectedProject) {
    projectJobs = jobs.filter((j) => j.projectId === selectedProject.id);

    projectTotalRequiredParts = selectedProject.parts.reduce((a, b) => a + (parseInt(b.quantityRequired) || 0), 0);
    projectTotalPrintedParts = selectedProject.parts.reduce((a, b) => a + (parseInt(b.quantityPrinted) || 0), 0);

    selectedProject.parts.forEach((part) => {
      const partHours = (part.estimatedTimeHours + part.estimatedTimeMinutes / 60) * part.quantityRequired;
      const partWeight = part.estimatedWeightGrams * part.quantityRequired;

      projectTotalTimeHours += partHours;
      projectTotalWeightGrams += partWeight;
    });

    const avgSpoolPrice = spools.length > 0
      ? spools.reduce((acc, s) => acc + s.pricePerKg, 0) / spools.length
      : 120.0;

    projectMaterialCost = (projectTotalWeightGrams / 1000) * avgSpoolPrice;
    const energyKwh = (250 / 1000) * projectTotalTimeHours;
    projectEnergyCost = energyKwh * (settings.electricityRate || 0.85);
    projectMachineCost = projectTotalTimeHours * (settings.hourlyMachineRate || 15.00);

    const baseCost = projectMaterialCost + projectEnergyCost + projectMachineCost;
    projectTotalCost = baseCost * 1.15;
  }

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Project Filter Selector */}
      <div className="glass-panel p-5 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Analytics & Histórico de Impressão
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Filtre relatórios por projeto, visualize datas e horas exatas de conclusão e analise o desempenho da frota.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Project Filter Dropdown */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <FolderKanban className="w-4 h-4 text-blue-600 ml-2" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-blue-600"
              >
                <option value="all">🌐 Visão Geral da Frota (Todos os Projetos)</option>
                <optgroup label="Relatório Individual por Projeto:">
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      📁 {p.title} (Resp: {p.responsible})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Print / PDF Button */}
            {selectedProjectId !== 'all' && (
              <button
                onClick={handlePrintReport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
                title="Imprimir ou Salvar Relatório em PDF"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Imprimir Relatório</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- CONDITIONAL VIEW 1: INDIVIDUAL PROJECT REPORT --- */}
      {selectedProject ? (
        <div className="space-y-6">
          
          {/* Project Summary Banner */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border-2 border-blue-200 bg-gradient-to-r from-blue-50/60 to-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700">
                  Relatório Analítico de Projeto
                </span>
                <h2 className="text-2xl font-heading font-extrabold text-slate-900">
                  {selectedProject.title}
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-600 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-slate-900">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Responsável: {selectedProject.responsible}
                  </span>
                  <span>•</span>
                  <span>Cliente/Dept: {selectedProject.customer}</span>
                  {selectedProject.deadline && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Prazo: {selectedProject.deadline}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                projectTotalPrintedParts >= projectTotalRequiredParts && projectTotalRequiredParts > 0
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}>
                {projectTotalPrintedParts >= projectTotalRequiredParts && projectTotalRequiredParts > 0 ? 'Projeto Concluído' : 'Em Produção'}
              </span>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-3 rounded-2xl bg-white border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Material Exigido</span>
                <div className="font-bold text-slate-900 font-mono">{selectedProject.materialRequirement}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Especificação de Cor</span>
                <div className="font-bold text-slate-900">{selectedProject.colorRequirement || 'Padrão'}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">Observações do Projeto</span>
                <div className="text-slate-700 italic truncate">{selectedProject.notes || 'Sem observações'}</div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-600 font-semibold">Progresso Total do Lote:</span>
                <span className="font-bold text-blue-700">
                  {projectTotalPrintedParts} / {projectTotalRequiredParts} peças impressas ({projectTotalRequiredParts > 0 ? Math.round((projectTotalPrintedParts / projectTotalRequiredParts) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${projectTotalRequiredParts > 0 ? Math.round((projectTotalPrintedParts / projectTotalRequiredParts) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Individual Project KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-3xl space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-mono uppercase">
                <span>Total de Peças</span>
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-heading font-bold text-slate-900">
                {projectTotalPrintedParts} / {projectTotalRequiredParts} <span className="text-xs text-slate-500 font-normal">unidades</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {selectedProject.parts.length} tipo(s) de peças cadastrados
              </p>
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-mono uppercase">
                <span>Tempo Est.</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-heading font-bold text-blue-700 font-mono">
                {projectTotalTimeHours.toFixed(1)}h
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Horas totais estimadas no lote
              </p>
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-mono uppercase">
                <span>Consumo Filamento</span>
                <Scale className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-heading font-bold text-amber-700 font-mono">
                {(projectTotalWeightGrams / 1000).toFixed(2)} kg
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Total de {projectTotalWeightGrams}g ({selectedProject.materialRequirement})
              </p>
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-mono uppercase">
                <span>Custo de Produção Est.</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-heading font-bold text-emerald-700 font-mono">
                R$ {projectTotalCost.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Material + Energia + Depreciação
              </p>
            </div>
          </div>

          {/* Queue Jobs Associated with this Project WITH DATE & TIME */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <PrinterIcon className="w-5 h-5 text-blue-600" />
              Histórico & Data/Hora de Impressão do Projeto
            </h3>

            {projectJobs.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-700 font-mono uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Trabalho na Fila</th>
                      <th className="p-3">Arquivo 3D</th>
                      <th className="p-3">Data/Hora Envio</th>
                      <th className="p-3">Data/Hora Impressão</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {projectJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{job.title}</td>
                        <td className="p-3 font-mono text-slate-600">{job.fileName}</td>
                        <td className="p-3 font-mono text-slate-500">{formatDateTime(job.createdAt)}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {job.status === 'completed' ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                              {formatDateTime(job.completedAt || job.createdAt)}
                            </span>
                          ) : job.status === 'printing' ? (
                            <span className="text-blue-600 animate-pulse">Imprimindo agora...</span>
                          ) : (
                            <span className="text-slate-400 italic">Pendente</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            job.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            job.status === 'printing' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {job.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-4 text-center">
                Nenhum trabalho individual enviado para a fila ainda. Acesse a aba "Projetos de Impressão" e clique em "Enviar Peças para a Fila".
              </p>
            )}
          </div>

        </div>
      ) : (
        /* --- CONDITIONAL VIEW 2: GLOBAL FLEET ANALYTICS WITH DATE/TIME --- */
        <div className="space-y-6">
          
          {/* Main Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-mono uppercase">Trabalhos Concluídos</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-heading font-bold text-slate-900">
                {completedJobs.length}
              </div>
              <p className="text-xs text-slate-500">
                Taxa de Sucesso: <span className="text-emerald-700 font-bold">{globalSuccessRate}%</span>
              </p>
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-mono uppercase">Horas Impressas</span>
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-heading font-bold text-blue-700 font-mono">
                {globalPrintHours.toFixed(1)}h
              </div>
              <p className="text-xs text-slate-500">
                Tempo acumulado na frota
              </p>
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-mono uppercase">Consumo de Filamento</span>
                <Scale className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-heading font-bold text-amber-700 font-mono">
                {(globalFilamentGrams / 1000).toFixed(2)} kg
              </div>
              <p className="text-xs text-slate-500">
                Total de {globalFilamentGrams}g processados
              </p>
            </div>

            <div className="glass-panel p-5 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-mono uppercase">Frota Ativa</span>
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-3xl font-heading font-bold text-slate-900 font-mono">
                {printers.length} unidades
              </div>
              <p className="text-xs text-slate-500">
                {printers.filter((p) => p.status === 'printing').length} operando no momento
              </p>
            </div>
          </div>

          {/* Global Production History Table WITH DATE & TIME */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Histórico Geral com Data & Hora de Impressão
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-700 font-mono uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Título / Peça</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Material</th>
                    <th className="p-3">Data/Hora Envio</th>
                    <th className="p-3">Data/Hora Conclusão</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900 font-sans">{job.title}</td>
                      <td className="p-3 text-slate-600 font-sans">{job.customer}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700">
                          {job.materialType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{formatDateTime(job.createdAt)}</td>
                      <td className="p-3 font-bold text-slate-900">
                        {job.status === 'completed' ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            {formatDateTime(job.completedAt || job.createdAt)}
                          </span>
                        ) : job.status === 'printing' ? (
                          <span className="text-blue-600 animate-pulse font-sans">Imprimindo agora...</span>
                        ) : (
                          <span className="text-slate-400 italic font-sans font-normal">Pendente</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-sans">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          job.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          job.status === 'printing' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          job.status === 'failed' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {job.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
