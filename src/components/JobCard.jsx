import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Clock, 
  Scale, 
  Layers, 
  User, 
  ArrowUp, 
  ArrowDown, 
  Play, 
  Pause, 
  CheckCircle, 
  Trash2, 
  FileCode, 
  FileCheck,
  FolderKanban,
  Check
} from 'lucide-react';
import { usePrintQueue } from '../context/PrintQueueContext';
import { formatFileSize, getFileFromStorage, downloadJobFile } from '../utils/fileStorage';
import Model3DPreview from './Model3DPreview';

export default function JobCard({ job, index, totalInQueue }) {
  const { 
    printers, 
    spools, 
    projects,
    assignJobToPrinter, 
    updateJobStatus, 
    deleteJob, 
    moveJobPriority 
  } = usePrintQueue();

  const [downloadDone, setDownloadDone] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [hasRealFile, setHasRealFile] = useState(false);

  // Check if real file is stored in storage or memory
  useEffect(() => {
    let isMounted = true;
    getFileFromStorage(job.id, job.fileDataUrl).then((file) => {
      if (isMounted && file) {
        setHasRealFile(true);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [job.id, job.fileDataUrl]);

  // Spool & Project info
  const assignedSpool = spools.find((s) => s.id === job.spoolId);
  const linkedProject = projects.find((p) => p.id === job.projectId);
  const availablePrinters = printers.filter((p) => p.status === 'idle');

  // Priority color config
  const priorityConfig = {
    urgent: { label: 'Urgente', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    high: { label: 'Alta', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    normal: { label: 'Normal', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    low: { label: 'Baixa', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  };

  // Status color config
  const statusConfig = {
    queued: { label: 'Na Fila', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    printing: { label: 'Imprimindo', bg: 'bg-blue-50 text-blue-700 border-blue-300 animate-pulse' },
    paused: { label: 'Pausada', bg: 'bg-amber-50 text-amber-800 border-amber-300' },
    completed: { label: 'Concluído', bg: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    failed: { label: 'Falhou', bg: 'bg-rose-50 text-rose-700 border-rose-300' },
  };

  const getFileTypeStyle = (ext) => {
    switch (ext) {
      case 'gcode':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'stl':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case '3mf':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleDownload = async () => {
    try {
      await downloadJobFile(job);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 2500);
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      deleteJob(job.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000); // Auto reset after 4s
    }
  };

  const priorityStyle = priorityConfig[job.priority] || priorityConfig.normal;
  const currentStatusStyle = statusConfig[job.status] || statusConfig.queued;

  return (
    <div className={`group relative rounded-2xl glass-panel p-5 transition-all duration-300 hover:border-blue-300 hover:shadow-lg ${
      job.status === 'printing' ? 'ring-2 ring-blue-500/40 shadow-md shadow-blue-500/10' : ''
    }`}>
      
      {/* Top Header: Extension + Priority + Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center flex-wrap gap-2">
          {/* File extension tag */}
          <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase border flex items-center gap-1 ${getFileTypeStyle(job.fileType)}`}>
            <FileCode className="w-3.5 h-3.5" />
            .{job.fileType}
          </span>

          {/* Priority Tag */}
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
            {priorityStyle.label}
          </span>

          {/* Status Tag */}
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${currentStatusStyle.bg}`}>
            {currentStatusStyle.label}
          </span>
        </div>

        {/* Priority Reordering Arrows */}
        {job.status === 'queued' && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => moveJobPriority(job.id, 'up')}
              disabled={index === 0}
              title="Aumentar Prioridade"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 border border-slate-200 cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => moveJobPriority(job.id, 'down')}
              disabled={index === totalInQueue - 1}
              title="Diminuir Prioridade"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 border border-slate-200 cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 3D Model Render Preview */}
      <div className="mb-4">
        <Model3DPreview
          fileType={job.fileType}
          fileName={job.fileName}
          materialColor={assignedSpool ? assignedSpool.colorHex : '#2563eb'}
        />
      </div>

      {/* Linked Project Badge */}
      {linkedProject && (
        <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold">
          <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
          <span>Projeto: {linkedProject.title}</span>
          <span className="text-indigo-400 font-normal">| Resp: {linkedProject.responsible}</span>
        </div>
      )}

      {/* Main Info: Title & Customer */}
      <div className="mb-4">
        <h3 className="text-lg font-heading font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
          {job.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span>{job.customer}</span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-slate-600" title="Tamanho do arquivo">
            {formatFileSize(job.fileSize)}
          </span>
          {hasRealFile && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
              <Check className="w-3 h-3" /> Arquivo Salvo
            </span>
          )}
        </div>
      </div>

      {/* Specifications */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Clock className="w-4 h-4 text-blue-600" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Tempo Estimado</div>
            <div className="font-semibold text-slate-900">
              {job.estimatedTimeHours}h {job.estimatedTimeMinutes}m
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          <Scale className="w-4 h-4 text-amber-600" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Peso / Filamento</div>
            <div className="font-semibold text-slate-900">
              {job.estimatedWeightGrams}g ({job.materialType})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          <Layers className="w-4 h-4 text-indigo-600" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Altura Camada</div>
            <div className="font-semibold text-slate-900">{job.layerHeight} mm</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[9px]">
            %
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Preenchimento</div>
            <div className="font-semibold text-slate-900">{job.infillPercentage}%</div>
          </div>
        </div>
      </div>

      {/* Spool Assignment Indicator */}
      {assignedSpool && (
        <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-slate-100/60 border border-slate-200/80 mb-4">
          <span className="text-slate-500">Carretel Alocado:</span>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-400"
              style={{ backgroundColor: assignedSpool.colorHex }}
            ></span>
            <span className="font-medium text-slate-800">{assignedSpool.name}</span>
            <span className="text-slate-500 font-mono">({assignedSpool.remainingWeight}g disp.)</span>
          </div>
        </div>
      )}

      {/* Notes if available */}
      {job.notes && (
        <p className="text-xs text-slate-600 italic mb-4 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
          "{job.notes}"
        </p>
      )}

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        
        {/* DOWNLOAD BUTTON */}
        <button
          onClick={handleDownload}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
            downloadDone
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 hover:shadow-md'
          }`}
          title="Baixar arquivo 3D / GCODE para cartão SD ou pendrive"
        >
          {downloadDone ? (
            <>
              <FileCheck className="w-4 h-4 text-white" />
              <span>Download Concluído!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo ({job.fileName})</span>
            </>
          )}
        </button>

        {/* Printer Controls & Direct Delete */}
        <div className="flex items-center gap-2">
          {job.status === 'queued' && (
            <div className="flex items-center gap-2">
              {availablePrinters.length > 0 ? (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      assignJobToPrinter(job.id, e.target.value);
                    }
                  }}
                  defaultValue=""
                  className="px-3 py-2 rounded-xl bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="" disabled>Iniciar na Impressora...</option>
                  {availablePrinters.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.model})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-[11px] text-amber-700 font-medium italic">
                  Nenhuma impressora livre
                </span>
              )}
            </div>
          )}

          {job.status === 'printing' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateJobStatus(job.id, 'paused')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pausar</span>
              </button>

              <button
                onClick={() => updateJobStatus(job.id, 'completed')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Concluir</span>
              </button>
            </div>
          )}

          {job.status === 'paused' && (
            <button
              onClick={() => updateJobStatus(job.id, 'printing')}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Retomar</span>
            </button>
          )}

          {(job.status === 'completed' || job.status === 'failed') && (
            <button
              onClick={() => updateJobStatus(job.id, 'queued')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 cursor-pointer"
            >
              Reenviar à Fila
            </button>
          )}

          {/* Inline Confirmation Delete Button */}
          <button
            onClick={handleDeleteClick}
            className={`flex items-center gap-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              confirmDelete
                ? 'bg-rose-600 text-white border-rose-700 shadow-md animate-pulse'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-200'
            }`}
            title={confirmDelete ? 'Clique novamente para confirmar a exclusão' : 'Excluir Trabalho'}
          >
            <Trash2 className="w-4 h-4" />
            {confirmDelete && <span>Confirmar?</span>}
          </button>
        </div>
      </div>

    </div>
  );
}
