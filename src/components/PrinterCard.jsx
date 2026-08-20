import React from 'react';
import { 
  Printer, 
  Flame, 
  Thermometer, 
  Clock, 
  Download, 
  Pause, 
  Play, 
  CheckCircle, 
  Wrench, 
  RotateCcw,
  Sliders
} from 'lucide-react';
import { usePrintQueue } from '../context/PrintQueueContext';

export default function PrinterCard({ printer }) {
  const { jobs, updatePrinterStatus, updateJobStatus, handleDownloadJobFile } = usePrintQueue();

  const activeJob = jobs.find((j) => j.id === printer.currentJobId);

  // Status Badge styles for Light Theme
  const statusStyles = {
    idle: { label: 'Livre', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    printing: { label: 'Em Uso / Imprimindo', bg: 'bg-blue-50 text-blue-700 border-blue-300 animate-pulse' },
    paused: { label: 'Pausada', bg: 'bg-amber-50 text-amber-800 border-amber-300' },
    maintenance: { label: 'Manutenção', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    offline: { label: 'Indisponível', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  const currentStyle = statusStyles[printer.status] || statusStyles.idle;

  // Format seconds to h m s
  const formatTime = (secs) => {
    if (!secs || secs <= 0) return '0m';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const remainingSeconds = Math.max(0, printer.totalSeconds - printer.elapsedSeconds);

  // Default target temperatures based on active job material
  const targetNozzle = activeJob ? (activeJob.materialType === 'PETG' ? 240 : activeJob.materialType === 'ABS' ? 250 : 215) : 0;
  const targetBed = activeJob ? (activeJob.materialType === 'PETG' ? 70 : activeJob.materialType === 'ABS' ? 100 : 60) : 0;

  return (
    <div className={`glass-panel p-5 rounded-3xl relative overflow-hidden transition-all duration-300 ${
      printer.status === 'printing' ? 'border-blue-300 ring-2 ring-blue-500/20 shadow-md' : ''
    }`}>
      
      {/* Header: Printer Name, Model & Status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl border ${
            printer.status === 'printing'
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-slate-900">
              {printer.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {printer.model} • {printer.maxBuildVolume}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${currentStyle.bg}`}>
          {currentStyle.label}
        </span>
      </div>

      {/* Recommended Slicing Temperatures (Target Specs for Operator) */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
        
        {/* Recommended Nozzle Temp */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white border border-slate-200 text-rose-600 shadow-2xs">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Bico / Nozzle (Alvo)</div>
            <div className="text-xs font-bold text-slate-900 font-mono">
              {targetNozzle > 0 ? `${targetNozzle}°C` : '—'} <span className="text-[10px] text-slate-400 font-normal">(Recomendado)</span>
            </div>
          </div>
        </div>

        {/* Recommended Bed Temp */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white border border-slate-200 text-amber-600 shadow-2xs">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">Mesa / Bed (Alvo)</div>
            <div className="text-xs font-bold text-slate-900 font-mono">
              {targetBed > 0 ? `${targetBed}°C` : '—'} <span className="text-[10px] text-slate-400 font-normal">(Recomendado)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Active Job Progress View */}
      {activeJob ? (
        <div className="space-y-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-200 mb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-blue-700 font-bold font-mono">
                Trabalho Alocado
              </span>
              <h4 className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">
                {activeJob.title}
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                Cliente: {activeJob.customer} • Material: {activeJob.materialType}
              </p>
            </div>

            {/* Download file for active job */}
            <button
              onClick={() => handleDownloadJobFile(activeJob)}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 text-xs flex items-center gap-1 shadow-xs"
              title="Baixar GCODE/STL deste trabalho para colocar no pendrive/SD"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Baixar</span>
            </button>
          </div>

          {/* Progress Bar & Countdown */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-mono">Estimativa de Progresso:</span>
              <span className="font-bold text-blue-700 font-mono">{printer.progress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${printer.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Elapsed & Remaining Time */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Decorrido: {formatTime(printer.elapsedSeconds)}
            </span>
            <span>Restante: {formatTime(remainingSeconds)}</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center mb-4">
          <p className="text-xs text-slate-500">
            Impressora pronta para receber novos trabalhos da fila.
          </p>
        </div>
      )}

      {/* Footer Printer Controls */}
      <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
        {printer.status === 'printing' && (
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => updateJobStatus(activeJob.id, 'paused')}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pausar</span>
            </button>
            <button
              onClick={() => updateJobStatus(activeJob.id, 'completed')}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Concluir Impressão</span>
            </button>
          </div>
        )}

        {printer.status === 'paused' && activeJob && (
          <button
            onClick={() => updateJobStatus(activeJob.id, 'printing')}
            className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Retomar Impressão</span>
          </button>
        )}

        {printer.status === 'idle' && (
          <button
            onClick={() => updatePrinterStatus(printer.id, 'maintenance')}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Modo Manutenção</span>
          </button>
        )}

        {printer.status === 'maintenance' && (
          <button
            onClick={() => updatePrinterStatus(printer.id, 'idle')}
            className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Finalizar Manutenção (Liberar Impressora)</span>
          </button>
        )}
      </div>

    </div>
  );
}
